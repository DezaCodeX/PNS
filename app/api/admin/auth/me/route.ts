import { getAdminContext } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await getAdminContext(request);
    if (!context) return Response.json({ authenticated: false }, { status: 401 });
    return Response.json({
      authenticated: true,
      user: context.user,
      permissions: [...context.permissions],
    });
  } catch (error) {
    console.error(
      "admin session lookup failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return Response.json({ authenticated: false }, { status: 401 });
  }
}
