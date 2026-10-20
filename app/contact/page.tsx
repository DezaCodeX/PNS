import { Home } from "@/home/Home";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Contact Hotel PNS Nakshatra in Vellore for enquiries and reservations.",
  path: "/contact",
});

export default function Page() {
  return <Home contactOpen />;
}
