import { Rooms } from "@/site-pages/Rooms";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Rooms",
  description: "Explore room options at Hotel PNS Nakshatra in Vellore.",
  path: "/rooms",
});

export default function Page() {
  return <Rooms />;
}
