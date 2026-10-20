import type { Metadata } from "next";
import { CreateAdminAccount } from "@/admin/auth/pages/CreateAdminAccount";

export const metadata: Metadata = { title: "Create Admin Account" };

export default function Page() {
  return <CreateAdminAccount />;
}
