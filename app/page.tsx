import { Home } from "@/home/Home";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Hotel PNS Nakshatra — Luxury Hotel in Vellore",
  description: "Premium rooms, rooftop dining and banquet halls at Hotel PNS Nakshatra, Vellore.",
  path: "/",
});

export default function Page() {
  return <Home />;
}
