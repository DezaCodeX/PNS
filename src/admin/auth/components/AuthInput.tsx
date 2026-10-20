import type { InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
  helperText?: string | undefined;
};

export function AuthInput({ label, id, error, helperText, className = "", ...props }: AuthInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-[#051838]">
        {label}
      </label>

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`w-full rounded-xl border bg-[#f8fbfd] px-3.5 py-3 text-sm text-[#051838] placeholder:text-[#687a90] transition-colors duration-150 outline-none ${
          error ? "border-[#b34c46] focus:border-[#b34c46]" : "border-[#dfe7ef] focus:border-[#051838]"
        } ${className}`}
        {...props}
      />

      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-[#46536b]">
          {helperText}
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-[#b34c46]">
          {error}
        </p>
      )}
    </div>
  );
}
