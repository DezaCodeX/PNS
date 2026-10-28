import type { Metadata } from "next";
import { AdminLogin } from "@/admin/auth/pages/AdminLogin";

export const metadata: Metadata = { title: "Admin Login" };

export default function Page() {
  return <AdminLogin />;
}
