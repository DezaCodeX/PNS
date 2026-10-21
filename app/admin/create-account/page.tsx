import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateAdminAccount } from "@/admin/auth/pages/CreateAdminAccount";

export const metadata: Metadata = { title: "Create Admin Account" };

export default function Page() {
  redirect("/admin/login");
}
