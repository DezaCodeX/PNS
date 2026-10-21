import { authenticateAdmin, AdminAuthError, sessionCookieHeader } from "@/lib/admin-auth";

export const runtime = "nodejs";

const failedAttempts = new Map<string, { count: number; resetAt: number }>();
const attemptWindowMs = 15 * 60 * 1000;
const maxAttempts = 5;

export async function POST(request: Request) {
  try {
    const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const current = failedAttempts.get(clientKey);
    if (current && current.resetAt > Date.now() && current.count >= maxAttempts) {
      return Response.json(
        {
          success: false,
          error: { code: "rate_limited", message: "Too many sign-in attempts. Try again later." },
        },
        { status: 429 },
      );
    }
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
      rememberMe?: unknown;
    };
    if (typeof body.email !== "string" || typeof body.password !== "string") {
      throw new AdminAuthError("validation", "Email and password are required.", 400);
    }
    const result = await authenticateAdmin(body.email, body.password, body.rememberMe === true);
    failedAttempts.delete(clientKey);
    return Response.json(
      { success: true, user: result.user },
      { headers: { "Set-Cookie": sessionCookieHeader(result.token, body.rememberMe === true) } },
    );
  } catch (error) {
    if (error instanceof AdminAuthError) {
      if (error.code === "invalid_credentials") {
        const clientKey =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const previous = failedAttempts.get(clientKey);
        failedAttempts.set(clientKey, {
          count: (previous?.count ?? 0) + 1,
          resetAt:
            previous?.resetAt && previous.resetAt > Date.now()
              ? previous.resetAt
              : Date.now() + attemptWindowMs,
        });
      }
      return Response.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("admin login failed", error instanceof Error ? error.message : "unknown error");
    return Response.json(
      {
        success: false,
        error: { code: "server_error", message: "Sign-in is temporarily unavailable." },
      },
      { status: 500 },
    );
  }
}
