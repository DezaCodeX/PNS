import type { ReactNode } from "react";

import type { AuthMessageTone } from "../types";

type AuthMessageProps = {
  tone?: AuthMessageTone;
  children: ReactNode;
};

const toneStyles = {
  info: "border-[#dfe7ef] bg-[#f4f8fb] text-[#051838]",
  success: "border-[#cfe8d8] bg-[#edf9f2] text-[#184d37]",
  error: "border-[#f7d1ce] bg-[#fff1f0] text-[#7d2d29]",
};

export function AuthMessage({ tone = "info", children }: AuthMessageProps) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 text-sm ${toneStyles[tone]}`}>{children}</div>
  );
}
