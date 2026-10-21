import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPageAdminContext } from "@/lib/admin-auth";
import { AdminPanel } from "@/site-pages/AdminPanel";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function Page() {
  const context = await getPageAdminContext().catch(() => null);
  if (!context) redirect("/admin/login?next=/admin");
  return <AdminPanel currentUser={context.user} permissions={[...context.permissions]} />;
}
