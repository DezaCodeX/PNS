export const runtime = "nodejs";

export async function POST() {
  return Response.json(
    {
      success: false,
      error: { code: "removed", message: "Admin login has been disabled for this project." },
    },
    { status: 410 },
  );
}
