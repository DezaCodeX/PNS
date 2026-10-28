import {
  expiredSessionCookieHeader,
  destroyAdminSession,
  getAdminContext,
  writeAuditEvent,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const context = await getAdminContext(request);
    await destroyAdminSession(request);
    if (context)
      await writeAuditEvent(
        context.user.id,
        "auth.logout",
        "user",
        context.user.id,
        "success",
        context.requestId,
      );
    return Response.json(
      {
        success: true,
        message: "Signed out successfully.",
      },
      { headers: { "Set-Cookie": expiredSessionCookieHeader() } },
    );
  } catch (error) {
    console.error("admin logout failed", error instanceof Error ? error.message : "unknown error");
    return Response.json(
      {
        success: false,
        error: { code: "server_error", message: "Admin authentication is disabled." },
      },
      { status: 410 },
    );
  }
}
