import { getAdminDb, requirePermission, writeAuditEvent } from "@/lib/admin-auth";
import { adminErrorResponse } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function PUT(request: Request, context: { params: Promise<{ groupId: string }> }) {
  const requestId = crypto.randomUUID();
  try {
    const actor = await requirePermission(request, "groups.permissions.manage");
    if (actor.user.roleName !== "Super Admin")
      return Response.json(
        {
          success: false,
          requestId,
          error: { code: "forbidden", message: "Only a Super Admin may change group permissions." },
        },
        { status: 403 },
      );
    const { groupId } = await context.params;
    const body = (await request.json()) as { permissions?: unknown };
    if (!Array.isArray(body.permissions)) throw new Error("permissions must be an array");
    const entries = body.permissions as Array<{ permissionKey?: unknown; effect?: unknown }>;
    if (
      !entries.every(
        (entry) =>
          typeof entry.permissionKey === "string" &&
          (entry.effect === "allow" || entry.effect === "deny"),
      )
    )
      throw new Error("invalid permission entry");
    const db = getAdminDb();
    const { data: group, error: groupError } = await db
      .from("admin_groups")
      .select("id,is_protected")
      .eq("id", groupId)
      .maybeSingle();
    if (groupError) throw groupError;
    if (!group)
      return Response.json(
        { success: false, requestId, error: { code: "not_found", message: "Group not found." } },
        { status: 404 },
      );
    if (group.is_protected)
      return Response.json(
        {
          success: false,
          requestId,
          error: {
            code: "protected_group",
            message: "The built-in group permissions cannot be changed.",
          },
        },
        { status: 409 },
      );
    const { data: permissions, error: permissionError } = await db
      .from("admin_permissions")
      .select("id,permission_key")
      .in(
        "permission_key",
        entries.map((entry) => entry.permissionKey),
      );
    if (permissionError) throw permissionError;
    if ((permissions ?? []).length !== entries.length) throw new Error("unknown permission key");
    const permissionIds = new Map(
      (permissions ?? []).map((permission) => [permission.permission_key, permission.id]),
    );
    const { error: deleteError } = await db
      .from("admin_group_permissions")
      .delete()
      .eq("group_id", groupId);
    if (deleteError) throw deleteError;
    if (entries.length) {
      const { error: insertError } = await db.from("admin_group_permissions").insert(
        entries.map((entry) => ({
          group_id: groupId,
          permission_id: permissionIds.get(entry.permissionKey),
          effect: entry.effect,
        })),
      );
      if (insertError) throw insertError;
    }
    await writeAuditEvent(
      actor.user.id,
      "groups.permissions.manage",
      "group",
      groupId,
      "success",
      requestId,
      { permissionCount: entries.length },
    );
    return Response.json({ success: true, requestId });
  } catch (error) {
    return adminErrorResponse(error, requestId);
  }
}
