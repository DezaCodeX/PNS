import type { Metadata } from "next";
import { AdminPanel } from "@/site-pages/AdminPanel";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function Page() {
  return <AdminPanel />;
}
