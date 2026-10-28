import type { ButtonHTMLAttributes, ReactNode } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "secondary";
  children: ReactNode;
};

export function AuthButton({
  loading = false,
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: AuthButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-[#051838] text-[#f3f8fa] hover:bg-[#0a2244]"
      : "border border-[#dfe7ef] bg-white text-[#051838] hover:bg-[#f4f8fb]";

  return (
    <button
      type="button"
      disabled={loading || disabled}
      className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold tracking-[0.02em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70 ${styles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
