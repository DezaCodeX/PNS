import { getAdminDb, requirePermission, writeAuditEvent } from "@/lib/admin-auth";
import { adminErrorResponse, requireText } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ imageId: string }> }) {
  const requestId = crypto.randomUUID();
  try {
    const { imageId } = await context.params;
    const body = (await request.json()) as {
      categoryType?: unknown;
      displayLocation?: unknown;
      displayOrder?: unknown;
      isActive?: unknown;
    };
    const categoryType = requireText(body.categoryType, "Category type");
    const permission =
      categoryType === "room"
        ? "room_images.upload"
        : categoryType === "dining"
          ? "dining_images.upload"
          : null;
    if (!permission) throw new Error("invalid category type");
    const actor = await requirePermission(request, permission);
    const patch: Record<string, unknown> = {};
    if (body.displayLocation !== undefined)
      patch["display_location"] = requireText(body.displayLocation, "Display location");
    if (body.displayOrder !== undefined) {
      if (!Number.isInteger(body.displayOrder) || Number(body.displayOrder) < 0)
        throw new Error("Display order must be a non-negative integer.");
      patch["display_order"] = body.displayOrder;
    }
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") throw new Error("Active state must be boolean.");
      patch["is_active"] = body.isActive;
    }
    if (!Object.keys(patch).length) throw new Error("No image changes were supplied.");
    const { data, error } = await getAdminDb()
      .from("managed_images")
      .update(patch)
      .eq("id", imageId)
      .eq("category_type", categoryType)
      .select(
        "id,category_type,category_id,public_url,storage_path,source_type,display_location,display_order,is_active",
      )
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return Response.json(
        { success: false, requestId, error: { code: "not_found", message: "Image not found." } },
        { status: 404 },
      );
    await writeAuditEvent(
      actor.user.id,
      "images.placement.update",
      "image",
      imageId,
      "success",
      requestId,
      { fields: Object.keys(patch) },
    );
    return Response.json({ success: true, image: data, requestId });
  } catch (error) {
    return adminErrorResponse(error, requestId);
  }
}
