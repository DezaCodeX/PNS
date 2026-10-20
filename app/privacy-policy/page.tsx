import { Legal } from "@/site-pages/Legal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "Privacy information for visitors to Hotel PNS Nakshatra.",
  path: "/privacy-policy",
});

export default function Page() {
  return <Legal path="/privacy-policy" />;
}
