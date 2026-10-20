import { Legal } from "@/site-pages/Legal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Refund and Cancellation Policy",
  description: "Refund and cancellation policy information for Hotel PNS Nakshatra reservations.",
  path: "/refund-cancellation-policy",
});

export default function Page() {
  return <Legal path="/refund-cancellation-policy" />;
}
