import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Create Admin Account" };

export default function Page() {
  redirect("/");
}
