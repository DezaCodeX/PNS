export const runtime = "nodejs";

export async function POST() {
  return Response.json(
    {
      success: false,
      error: { code: "removed", message: "Admin logout has been disabled for this project." },
    },
    { status: 410 },
  );
}
