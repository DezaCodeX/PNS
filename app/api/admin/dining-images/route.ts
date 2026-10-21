import { handleCreate, handleList } from "@/lib/image-management-api";

export const runtime = "nodejs";

export function GET(request: Request) {
  return handleList(request, "dining-images");
}

export function POST(request: Request) {
  return handleCreate(request, "dining-images");
}
