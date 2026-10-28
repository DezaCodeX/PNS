export const runtime = "nodejs";

export async function GET() {
  return Response.json({ authenticated: false }, { status: 410 });
}
