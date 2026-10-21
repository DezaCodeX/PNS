import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { diningImageAssets, roomImageAssets } from "@/lib/asset-manifest";
import { DINING_TYPES, ROOM_TYPES, type DiningType, type RoomType } from "@/types/roomImages";

export type ImageCollection = "room" | "dining";
export type ImageSourceType = "bundled" | "upload" | "external";

export type ManagedImage = {
  id: string;
  category: string;
  url: string;
  path: string | null;
  sourceType: ImageSourceType;
  filename: string | null;
};

type StoredImage = ManagedImage & { deleted?: boolean };
type ImageManifest = { version: number; images: StoredImage[] };

const manifestPath = path.resolve(
  process.env["PNS_IMAGE_MANIFEST"] ?? "data/uploads/image-manifest.json",
);
const defaultStorageRoot = path.resolve(process.env["PNS_IMAGE_STORAGE_DIR"] ?? "public/uploads");
const maxUploadBytes = 8 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const categorySets: Record<ImageCollection, readonly string[]> = {
  room: ROOM_TYPES,
  dining: DINING_TYPES,
};

function assertCategory(collection: ImageCollection, category: string) {
  if (!categorySets[collection].includes(category)) {
    throw new ImageManagementError(
      "invalid_category",
      "The selected image category is invalid.",
      400,
    );
  }
}

function assetsFor(collection: ImageCollection) {
  return collection === "room" ? roomImageAssets : diningImageAssets;
}

function categoryFromAsset(collection: ImageCollection, assetPath: string) {
  const marker = collection === "room" ? "/rooms/" : "/dining/";
  const match = assetPath.match(new RegExp(`${marker}([^/]+)/`));
  return match?.[1] ?? null;
}

function staticImages(collection: ImageCollection): ManagedImage[] {
  return Object.entries(assetsFor(collection)).flatMap(([assetPath, url]) => {
    const category = categoryFromAsset(collection, assetPath);
    if (!category || !categorySets[collection].includes(category)) return [];
    const filename = assetPath.split("/").pop() ?? assetPath;
    return [
      {
        id: `${category}:${`${category}/${filename}`.toLowerCase()}`,
        category,
        url,
        path: assetPath.replace(/^\//, ""),
        sourceType: "bundled" as const,
        filename,
      },
    ];
  });
}

async function readManifest(): Promise<ImageManifest> {
  try {
    const parsed = JSON.parse(await readFile(manifestPath, "utf8")) as Partial<ImageManifest>;
    if (!Array.isArray(parsed.images)) return { version: 1, images: [] };
    return { version: 1, images: parsed.images };
  } catch {
    return { version: 1, images: [] };
  }
}

async function writeManifest(manifest: ImageManifest) {
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function visibleImages(collection: ImageCollection, category: string, manifest: ImageManifest) {
  const deleted = new Set(
    manifest.images.filter((image) => image.deleted).map((image) => image.id),
  );
  const bundled = staticImages(collection).filter(
    (image) => image.category === category && !deleted.has(image.id),
  );
  const managed = manifest.images.filter(
    (image) =>
      !image.deleted && image.category === category && image.id.startsWith(`${collection}:`),
  );
  return [...bundled, ...managed];
}

export async function listManagedImages(collection: ImageCollection, category: string) {
  assertCategory(collection, category);
  const manifest = await readManifest();
  return visibleImages(collection, category, manifest);
}

export async function listPublicImages(collection: ImageCollection, category: string) {
  return listManagedImages(collection, category);
}

export async function addExternalImage(
  collection: ImageCollection,
  category: string,
  imageUrl: string,
) {
  assertCategory(collection, category);
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new ImageManagementError("invalid_url", "Enter a valid image URL.", 400);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ImageManagementError(
      "invalid_url_scheme",
      "Only HTTP and HTTPS image URLs are allowed.",
      400,
    );
  }
  const image: StoredImage = {
    id: `${collection}:external:${randomUUID()}`,
    category,
    url: parsed.toString(),
    path: null,
    sourceType: "external",
    filename: null,
  };
  const manifest = await readManifest();
  manifest.images.push(image);
  await writeManifest(manifest);
  return image;
}

export async function addUploadedImage(collection: ImageCollection, category: string, file: File) {
  assertCategory(collection, category);
  if (!allowedTypes.has(file.type)) {
    throw new ImageManagementError(
      "invalid_file_type",
      "Use a JPEG, PNG, WebP, or AVIF image.",
      400,
    );
  }
  if (file.size > maxUploadBytes) {
    throw new ImageManagementError("file_too_large", "Images must be 8 MB or smaller.", 400);
  }
  const extension = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${randomUUID()}.${extension}`;
  const relativePath = `uploads/${collection}/${category}/${filename}`;
  const destination = path.resolve(defaultStorageRoot, collection, category, filename);
  if (!destination.startsWith(`${defaultStorageRoot}${path.sep}`)) {
    throw new ImageManagementError(
      "invalid_storage_path",
      "The image storage path is invalid.",
      500,
    );
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));
  const image: StoredImage = {
    id: `${collection}:upload:${randomUUID()}`,
    category,
    url: `/${relativePath}`,
    path: relativePath,
    sourceType: "upload",
    filename,
  };
  const manifest = await readManifest();
  manifest.images.push(image);
  try {
    await writeManifest(manifest);
  } catch (error) {
    await unlink(destination).catch(() => undefined);
    throw error;
  }
  return image;
}

export async function deleteManagedImage(
  collection: ImageCollection,
  category: string,
  id: string,
) {
  assertCategory(collection, category);
  const manifest = await readManifest();
  const image = manifest.images.find(
    (candidate) =>
      !candidate.deleted &&
      candidate.id === id &&
      candidate.category === category &&
      candidate.id.startsWith(`${collection}:`),
  );
  if (image) {
    image.deleted = true;
    if (image.sourceType === "upload" && image.path) {
      const destination = path.resolve(defaultStorageRoot, image.path.replace(/^uploads\//, ""));
      if (!destination.startsWith(`${defaultStorageRoot}${path.sep}`)) {
        throw new ImageManagementError(
          "invalid_storage_path",
          "The image storage path is invalid.",
          500,
        );
      }
      await unlink(destination).catch(() => undefined);
    }
    await writeManifest(manifest);
    return;
  }
  const bundled = staticImages(collection).find(
    (candidate) => candidate.id === id && candidate.category === category,
  );
  if (bundled) {
    manifest.images.push({ ...bundled, deleted: true });
    await writeManifest(manifest);
    return;
  }
  throw new ImageManagementError("not_found", "The image was not found in this category.", 404);
}

export function assertAdminRequest(request: Request) {
  const expected = process.env["ADMIN_IMAGE_API_TOKEN"];
  const supplied =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.headers.get("x-admin-image-token");
  if (!expected || !supplied || supplied !== expected) {
    throw new ImageManagementError(
      "unauthorized",
      "Admin image management is not configured or authorized.",
      401,
    );
  }
}

export class ImageManagementError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ImageManagementError";
  }
}

export function isCollection(value: string): value is ImageCollection {
  return value === "room" || value === "dining";
}

export { maxUploadBytes };
export type { DiningType, RoomType };
