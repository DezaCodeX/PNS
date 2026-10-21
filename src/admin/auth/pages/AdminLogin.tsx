"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { AuthButton } from "../components/AuthButton";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { AuthMessage } from "../components/AuthMessage";
import { PasswordInput } from "../components/PasswordInput";
import { authService, isValidEmail } from "../services/authService";
import type { LoginFormData } from "../types";

const initialForm: LoginFormData = {
  email: "",
  password: "",
  rememberMe: false,
};

export function AdminLogin() {
  const [form, setForm] = useState<LoginFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitTone, setSubmitTone] = useState<"info" | "success" | "error">("info");

  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitMessage(null);
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof LoginFormData, string>> = {};

    if (!form.email.trim()) {
      nextErrors.email = "This field is required.";
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "This field is required.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitMessage(null);
      return;
    }

    setIsLoading(true);
    setSubmitMessage(null);

    const result = await authService.login(form);
    setIsLoading(false);

    if (!result.success) {
      setSubmitTone("error");
      setSubmitMessage(result.message ?? "Invalid email or password.");
      return;
    }

    setSubmitTone("success");
    setSubmitMessage("Signed in successfully.");
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.assign(next?.startsWith("/") && !next.startsWith("//") ? next : "/admin");
  };

  return (
    <AuthLayout
      useTimesFont
      title="Admin Portal"
      subtitle="Secure access to the Hotel PNS Nakshatra administration panel."
      footer={<span>Need access? Contact an existing Super Admin.</span>}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-xl border border-[#dfe7ef] bg-[#f4f8fb] px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#051838]">
          <ShieldCheck className="h-4 w-4 text-[#cf8c55]" />
          Administrator access only
        </div>

        {submitMessage && <AuthMessage tone={submitTone}>{submitMessage}</AuthMessage>}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <AuthInput
            label="Email / Username"
            type="email"
            autoComplete="username"
            placeholder="name@pnsnakshatra.com"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            error={errors.password}
          />

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-[#46536b]">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) => handleChange("rememberMe", event.target.checked)}
                className="h-4 w-4 rounded border-[#cfd8e4] text-[#051838] accent-[#051838]"
              />
              Remember me
            </label>

            <Link
              href="/admin/forgot-password"
              className="font-medium text-[#051838] underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <AuthButton type="submit" loading={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </AuthButton>
        </form>

        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe7ef] bg-[#f9fbfc] px-3 py-2 text-xs text-[#46536b]">
          <CheckCircle2 className="h-4 w-4 text-[#cf8c55]" />
          Secure dashboard access for authorised staff only
        </div>
      </div>
    </AuthLayout>
  );
}
