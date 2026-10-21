import { handleDelete } from "@/lib/image-management-api";

export const runtime = "nodejs";

export async function DELETE(request: Request, context: { params: Promise<{ imageId: string }> }) {
  const { imageId } = await context.params;
  return handleDelete(request, "dining-images", imageId);
}
