import {
  addExternalImage,
  addUploadedImage,
  assertAdminRequest,
  deleteManagedImage,
  ImageManagementError,
  isCollection,
  listManagedImages,
  type ImageCollection,
} from "@/lib/image-management";

function errorResponse(error: unknown, requestId: string) {
  if (error instanceof ImageManagementError) {
    return Response.json(
      { success: false, requestId, error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  console.error(`[image-management:${requestId}] unexpected storage failure`);
  return Response.json(
    {
      success: false,
      requestId,
      error: { code: "server_error", message: "The image operation could not be completed." },
    },
    { status: 500 },
  );
}

function collectionFromRoute(value: string): ImageCollection {
  const collection = value.replace(/-images$/, "");
  if (!isCollection(collection))
    throw new ImageManagementError("invalid_collection", "The image collection is invalid.", 400);
  return collection;
}

export async function handleList(request: Request, routeCollection: string) {
  const requestId = crypto.randomUUID();
  try {
    assertAdminRequest(request);
    const collection = collectionFromRoute(routeCollection);
    const category = new URL(request.url).searchParams.get("type")?.trim() ?? "";
    const images = await listManagedImages(collection, category);
    console.info(`[image-management:${requestId}] ${collection} list ${category}`);
    return Response.json({ success: true, requestId, category, images });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

export async function handleCreate(request: Request, routeCollection: string) {
  const requestId = crypto.randomUUID();
  try {
    assertAdminRequest(request);
    const collection = collectionFromRoute(routeCollection);
    const contentType = request.headers.get("content-type") ?? "";
    let image;
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const category = String(form.get("category") ?? "").trim();
      const file = form.get("file");
      if (!(file instanceof File))
        throw new ImageManagementError("missing_file", "Choose an image file.", 400);
      image = await addUploadedImage(collection, category, file);
    } else {
      const body = (await request.json()) as { category?: unknown; imageUrl?: unknown };
      if (typeof body.category !== "string" || typeof body.imageUrl !== "string") {
        throw new ImageManagementError(
          "invalid_payload",
          "A category and image URL are required.",
          400,
        );
      }
      image = await addExternalImage(collection, body.category.trim(), body.imageUrl.trim());
    }
    console.info(
      `[image-management:${requestId}] ${collection} create ${image.category} ${image.sourceType}`,
    );
    return Response.json(
      { success: true, requestId, category: image.category, image },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

export async function handleDelete(request: Request, routeCollection: string, routeId: string) {
  const requestId = crypto.randomUUID();
  try {
    assertAdminRequest(request);
    const collection = collectionFromRoute(routeCollection);
    const category = new URL(request.url).searchParams.get("type")?.trim() ?? "";
    await deleteManagedImage(collection, category, routeId);
    console.info(`[image-management:${requestId}] ${collection} delete ${category}`);
    return Response.json({ success: true, requestId, category, id: routeId });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

export async function handlePublicList(request: Request, routeCollection: string) {
  const requestId = crypto.randomUUID();
  try {
    const collection = collectionFromRoute(routeCollection);
    const category = new URL(request.url).searchParams.get("type")?.trim() ?? "";
    const images = await listManagedImages(collection, category);
    return Response.json(
      { success: true, requestId, category, images },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error, requestId);
  }
}
