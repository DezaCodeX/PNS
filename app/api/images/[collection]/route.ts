import { handlePublicList } from "@/lib/image-management-api";

export const runtime = "nodejs";

export function GET(request: Request, context: { params: Promise<{ collection: string }> }) {
  return context.params.then(({ collection }) => handlePublicList(request, `${collection}-images`));
}
