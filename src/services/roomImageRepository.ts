import { roomCategories } from "@/data/rooms";
import {
  ROOM_IMAGE_DESTINATIONS,
  ROOM_TYPE_LABELS,
  ROOM_TYPES,
  RoomImageRepositoryError,
  RoomImageValidationError,
  type RoomImage,
  type RoomImageDestination,
  type RoomImageLoadResult,
  type RoomImageRepository,
  type RoomImageSelections,
  type RoomImageSettingsRecord,
  type RoomType,
} from "@/types/roomImages";

const STORAGE_KEY = "pns-room-images:v1";
const SCHEMA_VERSION = 1;
const DEFAULT_SELECTIONS: RoomImageSelections = {
  homepage: true,
  roomsPage: true,
  gallery: true,
};

const discoveredAssets = import.meta.glob<string>(
  "/src/assets/rooms/**/*.{webp,avif,jpg,jpeg,png}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

type PersistedSettings = {
  version: number;
  images: Record<string, RoomImageSettingsRecord>;
};

function isRoomType(value: unknown): value is RoomType {
  return typeof value === "string" && ROOM_TYPES.includes(value as RoomType);
}

function isSelection(value: unknown): value is RoomImageSelections {
  if (!value || typeof value !== "object") return false;
  const selections = value as Record<string, unknown>;
  return ROOM_IMAGE_DESTINATIONS.every(
    (destination) => typeof selections[destination] === "boolean",
  );
}

function roomTypeForAssetPath(path: string): RoomType | null {
  const match = path.match(/\/rooms\/([^/]+)\//);
  return match && isRoomType(match[1]) ? match[1] : null;
}

function createDiscoveredImages(): RoomImage[] {
  const images = Object.entries(discoveredAssets)
    .map<RoomImage | null>(([path, url]) => {
      const roomType = roomTypeForAssetPath(path);
      if (!roomType) return null;

      const filename = path.split("/").pop() ?? path;
      const storageKey = path.replace(/^\/src\/assets\/rooms\//, "");
      const identity = storageKey.toLowerCase();
      const roomName = roomCategories.find((room) => room.id === roomType)?.name ?? roomType;

      return {
        id: `${roomType}:${identity}`,
        roomType,
        filename,
        storageKey,
        url,
        altText: `${roomName} room at Hotel PNS Nakshatra`,
        displayOrder: 0,
        active: true,
        selections: { ...DEFAULT_SELECTIONS },
      } satisfies RoomImage;
    })
    .filter((image): image is RoomImage => image !== null)
    .sort((left, right) => left.storageKey.localeCompare(right.storageKey));

  const ids = new Set<string>();
  for (const image of images) {
    if (ids.has(image.id)) {
      throw new RoomImageRepositoryError(`Duplicate room image ID discovered: ${image.id}`);
    }
    ids.add(image.id);
  }

  return images;
}

function readPersistedSettings(): {
  records: Record<string, RoomImageSettingsRecord>;
  warnings: string[];
} {
  const warnings: string[] = [];
  let stored: string | null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      records: {},
      warnings: ["Browser storage is unavailable; default image selections are being used."],
    };
  }

  if (!stored) return { records: {}, warnings };

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return {
      records: {},
      warnings: ["Saved room-image settings were invalid and have been reset to defaults."],
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      records: {},
      warnings: ["Saved room-image settings were invalid and have been reset to defaults."],
    };
  }

  const saved = parsed as Partial<PersistedSettings>;
  if (saved.version !== SCHEMA_VERSION || !saved.images || typeof saved.images !== "object") {
    return {
      records: {},
      warnings: [
        "Saved room-image settings used an unsupported format and have been reset to defaults.",
      ],
    };
  }

  const records: Record<string, RoomImageSettingsRecord> = {};
  for (const [id, value] of Object.entries(saved.images)) {
    if (
      !value ||
      typeof value !== "object" ||
      !isRoomType(value.roomType) ||
      !isSelection(value.selections) ||
      !Number.isInteger(value.displayOrder) ||
      value.displayOrder < 0
    ) {
      warnings.push(
        `Saved settings for ${id} were invalid; defaults are being used for that image.`,
      );
      continue;
    }
    records[id] = value;
  }

  return { records, warnings };
}

function isDestinationValid(
  images: RoomImage[],
  roomType: RoomType,
  destination: RoomImageDestination,
) {
  return images.some(
    (image) => image.roomType === roomType && image.active && image.selections[destination],
  );
}

function validateMinimumSelections(images: RoomImage[]) {
  for (const roomType of ROOM_TYPES) {
    for (const destination of ROOM_IMAGE_DESTINATIONS) {
      if (!isDestinationValid(images, roomType, destination)) {
        const roomName = ROOM_TYPE_LABELS[roomType];
        const label = destination === "roomsPage" ? "Rooms page" : destination;
        throw new RoomImageValidationError(
          `At least one ${roomName} image must remain selected for the ${label}.`,
        );
      }
    }
  }
}

function createLoadResult(): RoomImageLoadResult {
  const images = createDiscoveredImages();
  const { records, warnings } = readPersistedSettings();
  const unmappedFolders = [
    ...new Set(
      Object.keys(discoveredAssets)
        .map((path) => path.match(/\/rooms\/([^/]+)\//)?.[1])
        .filter((folder): folder is string => folder !== undefined && !isRoomType(folder)),
    ),
  ];
  warnings.push(
    ...unmappedFolders.map(
      (folder) =>
        `Room image folder src/assets/rooms/${folder}/ does not match a supported room type.`,
    ),
  );

  for (const image of images) {
    const saved = records[image.id];
    if (saved && saved.roomType === image.roomType) {
      image.selections = { ...saved.selections };
      image.displayOrder = saved.displayOrder;
    } else if (saved) {
      warnings.push(
        `Saved room assignment for ${image.filename} was invalid; defaults are being used.`,
      );
    }
  }

  for (const roomType of ROOM_TYPES) {
    const roomImages = images.filter((image) => image.roomType === roomType);
    if (roomImages.length === 0) {
      warnings.push(`No room images found in src/assets/rooms/${roomType}/.`);
      continue;
    }
    for (const destination of ROOM_IMAGE_DESTINATIONS) {
      if (!isDestinationValid(images, roomType, destination)) {
        roomImages[0]!.selections[destination] = true;
        warnings.push(
          `Invalid saved selection recovered: at least one ${ROOM_TYPE_LABELS[roomType]} image is selected for ${destination === "roomsPage" ? "the Rooms page" : destination}.`,
        );
      }
    }
  }

  return { images, warnings };
}

function serializeSettings(images: RoomImage[]): PersistedSettings {
  return {
    version: SCHEMA_VERSION,
    images: Object.fromEntries(
      images.map((image) => [
        image.id,
        {
          roomType: image.roomType,
          selections: image.selections,
          displayOrder: image.displayOrder,
        },
      ]),
    ),
  };
}

export class LocalRoomImageRepository implements RoomImageRepository {
  private readonly listeners = new Set<() => void>();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY) this.notify();
      });
    }
  }

  async listImages(): Promise<RoomImageLoadResult> {
    return createLoadResult();
  }

  async updateSelection(
    imageId: string,
    destination: RoomImageDestination,
    selected: boolean,
  ): Promise<RoomImageLoadResult> {
    const result = createLoadResult();
    const image = result.images.find((candidate) => candidate.id === imageId);
    if (!image) {
      throw new RoomImageRepositoryError(`Room image ${imageId} is not available.`);
    }
    if (image.selections[destination] === selected) return result;

    image.selections[destination] = selected;
    validateMinimumSelections(result.images);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeSettings(result.images)));
    } catch {
      throw new RoomImageRepositoryError(
        "Room-image selections could not be saved in this browser.",
      );
    }

    this.notify();
    return { images: result.images, warnings: result.warnings };
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }
}

export const roomImageRepository: RoomImageRepository = new LocalRoomImageRepository();

export function getSelectedRoomImages(
  images: RoomImage[],
  destination: RoomImageDestination,
  roomType?: RoomType,
) {
  return images
    .filter(
      (image) =>
        image.active &&
        image.selections[destination] &&
        (roomType === undefined || image.roomType === roomType),
    )
    .sort(
      (left, right) => left.displayOrder - right.displayOrder || left.id.localeCompare(right.id),
    );
}

export function getRoomImageCounts(images: RoomImage[], roomType: RoomType) {
  return Object.fromEntries(
    ROOM_IMAGE_DESTINATIONS.map((destination) => [
      destination,
      images.filter(
        (image) => image.roomType === roomType && image.active && image.selections[destination],
      ).length,
    ]),
  ) as Record<RoomImageDestination, number>;
}
