import type { ReactNode } from "react";

import Link from "next/link";

type AuthLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  useTimesFont?: boolean;
};

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  useTimesFont = false,
}: AuthLayoutProps) {
  return (
    <div
      className={`${useTimesFont ? "admin-times-font " : ""}min-h-screen bg-[radial-gradient(circle_at_top,#18345b_0%,#07162d_48%,#030914_100%)] px-4 py-8 text-[#f3f8fa] sm:px-6 lg:px-8`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
        <div className="w-full">
          <div className="mb-6 text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-3 text-[#f3f8fa] no-underline"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg font-semibold shadow-sm backdrop-blur-md">
                P
              </div>
              <div className="text-left">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#cf8c55]">
                  Hotel
                </div>
                <div className="text-xl font-semibold tracking-[-0.03em] text-[#f3f8fa]">
                  PNS Nakshatra
                </div>
              </div>
            </Link>

            {(title || subtitle) && (
              <div className="mt-5 text-center">
                {title && (
                  <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#f3f8fa]">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="mt-2 text-sm text-[#c7d3e0]">{subtitle}</p>}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-white/20 bg-white/10 p-5 shadow-[0_24px_80px_-35px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
            {children}
          </div>

          {footer && <div className="mt-4 text-center text-xs text-[#c7d3e0]">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
