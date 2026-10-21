import { getAdminDb, requirePermission, writeAuditEvent } from "@/lib/admin-auth";
import { adminErrorResponse, requireText } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ groupId: string }> }) {
  const requestId = crypto.randomUUID();
  try {
    const actor = await requirePermission(request, "groups.update");
    const { groupId } = await context.params;
    const body = (await request.json()) as {
      name?: unknown;
      description?: unknown;
      isActive?: unknown;
    };
    const db = getAdminDb();
    const { data: existing, error: existingError } = await db
      .from("admin_groups")
      .select("id,is_protected")
      .eq("id", groupId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing)
      return Response.json(
        { success: false, requestId, error: { code: "not_found", message: "Group not found." } },
        { status: 404 },
      );
    if (existing.is_protected && (body.name !== undefined || body.isActive === false))
      return Response.json(
        {
          success: false,
          requestId,
          error: {
            code: "protected_group",
            message: "The built-in group cannot be renamed or disabled.",
          },
        },
        { status: 409 },
      );
    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch["name"] = requireText(body.name, "Group name");
    if (body.description !== undefined)
      patch["description"] = typeof body.description === "string" ? body.description.trim() : "";
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") throw new Error("invalid active state");
      patch["is_active"] = body.isActive;
    }
    if (!Object.keys(patch).length) throw new Error("No group changes were supplied.");
    const { data, error } = await db
      .from("admin_groups")
      .update(patch)
      .eq("id", groupId)
      .select("id,name,description,is_active,is_protected,created_at,updated_at")
      .single();
    if (error) throw error;
    await writeAuditEvent(actor.user.id, "groups.update", "group", groupId, "success", requestId, {
      fields: Object.keys(patch),
    });
    return Response.json({ success: true, group: data, requestId });
  } catch (error) {
    return adminErrorResponse(error, requestId);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ groupId: string }> }) {
  const requestId = crypto.randomUUID();
  try {
    const actor = await requirePermission(request, "groups.delete");
    const { groupId } = await context.params;
    const db = getAdminDb();
    const { data: existing, error: existingError } = await db
      .from("admin_groups")
      .select("is_protected")
      .eq("id", groupId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing)
      return Response.json(
        { success: false, requestId, error: { code: "not_found", message: "Group not found." } },
        { status: 404 },
      );
    if (existing.is_protected)
      return Response.json(
        {
          success: false,
          requestId,
          error: { code: "protected_group", message: "The built-in group cannot be deleted." },
        },
        { status: 409 },
      );
    const { error } = await db.from("admin_groups").delete().eq("id", groupId);
    if (error) throw error;
    await writeAuditEvent(actor.user.id, "groups.delete", "group", groupId, "success", requestId);
    return Response.json({ success: true, requestId });
  } catch (error) {
    return adminErrorResponse(error, requestId);
  }
}
