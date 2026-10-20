"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

const Chatbot = dynamic(() => import("@/components/chatbot").then((module) => module.Chatbot), {
  ssr: false,
});

export default function ClientExtras() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {!isAdminRoute && <Chatbot />}
      <Analytics />
    </>
  );
}
