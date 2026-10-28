import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Admin Login" };

export default function Page() {
  redirect("/");
}
