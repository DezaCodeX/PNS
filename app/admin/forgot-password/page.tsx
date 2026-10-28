import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Forgot Password" };

export default function Page() {
  redirect("/");
}
