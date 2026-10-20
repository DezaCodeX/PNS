import type { ReactNode } from "react";

import Link from "next/link";

type AuthLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  useTimesFont?: boolean;
};

export function AuthLayout({ children, title, subtitle, footer, useTimesFont = false }: AuthLayoutProps) {
  return (
    <div className={`${useTimesFont ? "admin-times-font " : ""}min-h-screen bg-[#edf3f7] px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
        <div className="w-full">
          <div className="mb-6 text-center">
            <Link href="/admin/login" className="inline-flex items-center justify-center gap-3 text-[#051838] no-underline">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#dfe9f0] bg-white text-lg font-semibold shadow-sm">
                P
              </div>
              <div className="text-left">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#cf8c55]">Hotel</div>
                <div className="text-xl font-semibold tracking-[-0.03em]">PNS Nakshatra</div>
              </div>
            </Link>

            {(title || subtitle) && (
              <div className="mt-5 text-center">
                {title && <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#051838]">{title}</h1>}
                {subtitle && <p className="mt-2 text-sm text-[#46536b]">{subtitle}</p>}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-[#dfe7ef] bg-white p-5 shadow-[0_20px_50px_-35px_rgba(5,24,56,0.38)] sm:p-6">
            {children}
          </div>

          {footer && <div className="mt-4 text-center text-xs text-[#46536b]">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
