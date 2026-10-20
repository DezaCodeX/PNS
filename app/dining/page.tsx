import { Dining } from "@/site-pages/Dining";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Dining",
  description: "Explore dining at Vrindavan, Cloud 9 and Clinq at Hotel PNS Nakshatra.",
  path: "/dining",
});

export default function Page() {
  return <Dining />;
}
