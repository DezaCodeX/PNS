import { AboutUs } from "@/site-pages/AboutUs";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About Us",
  description: "Discover Hotel PNS Nakshatra and its hospitality in Vellore.",
  path: "/about-us",
});

export default function Page() {
  return <AboutUs />;
}
