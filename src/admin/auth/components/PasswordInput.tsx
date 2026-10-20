import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import type { InputHTMLAttributes } from "react";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
};

export function PasswordInput({ label, id, error, className = "", ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-[#051838]">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-xl border bg-[#f8fbfd] px-3.5 py-3 pr-11 text-sm text-[#051838] placeholder:text-[#687a90] transition-colors duration-150 outline-none ${
            error ? "border-[#b34c46] focus:border-[#b34c46]" : "border-[#dfe7ef] focus:border-[#051838]"
          } ${className}`}
          {...props}
        />

        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-[#46536b] transition-colors hover:text-[#051838]"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-[#b34c46]">
          {error}
        </p>
      )}
    </div>
  );
}
