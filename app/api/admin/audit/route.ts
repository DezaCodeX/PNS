import { getAdminDb, requirePermission } from "@/lib/admin-auth";
import { adminErrorResponse } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    await requirePermission(request, "audit.read");
    const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") ?? 100), 200);
    const { data, error } = await getAdminDb()
      .from("admin_audit_events")
      .select(
        "id,actor_user_id,action,target_type,target_id,outcome,request_id,metadata,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(Number.isInteger(limit) && limit > 0 ? limit : 100);
    if (error) throw error;
    return Response.json({ success: true, events: data ?? [], requestId });
  } catch (error) {
    return adminErrorResponse(error, requestId);
  }
}
