import { Legal } from "@/site-pages/Legal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Terms and Conditions",
  description: "Website terms and conditions for Hotel PNS Nakshatra.",
  path: "/terms-and-conditions",
});

export default function Page() {
  return <Legal path="/terms-and-conditions" />;
}
