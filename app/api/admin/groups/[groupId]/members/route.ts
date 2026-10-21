import { getAdminDb, requirePermission, writeAuditEvent } from "@/lib/admin-auth";
import { adminErrorResponse } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function PUT(request: Request, context: { params: Promise<{ groupId: string }> }) {
  const requestId = crypto.randomUUID();
  try {
    const actor = await requirePermission(request, "groups.members.manage");
    const { groupId } = await context.params;
    const body = (await request.json()) as { userIds?: unknown };
    if (!Array.isArray(body.userIds) || !body.userIds.every((id) => typeof id === "string"))
      throw new Error("userIds must be an array of IDs");
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
    const { error: deleteError } = await db
      .from("admin_user_groups")
      .delete()
      .eq("group_id", groupId);
    if (deleteError) throw deleteError;
    if (body.userIds.length) {
      const { error: insertError } = await db
        .from("admin_user_groups")
        .insert(body.userIds.map((userId) => ({ group_id: groupId, user_id: userId })));
      if (insertError) throw insertError;
    }
    await writeAuditEvent(
      actor.user.id,
      "groups.members.manage",
      "group",
      groupId,
      "success",
      requestId,
      { memberCount: body.userIds.length },
    );
    return Response.json({ success: true, requestId });
  } catch (error) {
    return adminErrorResponse(error, requestId);
  }
}
