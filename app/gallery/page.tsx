import { Gallery } from "@/site-pages/Gallery";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Gallery",
  description: "View rooms and dining spaces at Hotel PNS Nakshatra in Vellore.",
  path: "/gallery",
});

export default function Page() {
  return <Gallery />;
}
