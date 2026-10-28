import type { ReactNode } from "react";

type AuthCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function AuthCard({ title, subtitle, children, className = "" }: AuthCardProps) {
  return (
    <div
      className={`rounded-[22px] border border-[#dfe9f0] bg-white p-5 shadow-[0_22px_60px_-42px_rgba(5,24,56,0.45)] sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="mb-1 text-2xl font-semibold tracking-[-0.05em] text-[#051838]">{title}</h2>
      )}
      {subtitle && <p className="mb-5 text-sm text-[#46536b]">{subtitle}</p>}
      {children}
    </div>
  );
}
