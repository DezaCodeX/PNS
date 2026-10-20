import type { Metadata } from "next";
import { ForgotPassword } from "@/admin/auth/pages/ForgotPassword";

export const metadata: Metadata = { title: "Forgot Password" };

export default function Page() {
  return <ForgotPassword />;
}
