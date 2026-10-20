"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";

import { AuthButton } from "../components/AuthButton";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { AuthMessage } from "../components/AuthMessage";
import { PasswordInput } from "../components/PasswordInput";
import { authService, isValidEmail, passwordRules } from "../services/authService";
import type { CreateAccountFormData } from "../types";

const initialForm: CreateAccountFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
};

export function CreateAdminAccount() {
  const [form, setForm] = useState<CreateAccountFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAccountFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitTone, setSubmitTone] = useState<"info" | "success" | "error">("info");

  const passwordChecks = useMemo(
    () =>
      passwordRules.map((rule) => ({
        ...rule,
        valid: rule.test(form.password),
      })),
    [form.password],
  );

  const confirmPasswordState =
    form.confirmPassword && form.password && form.confirmPassword === form.password
      ? "Passwords match."
      : form.confirmPassword && form.password && form.confirmPassword !== form.password
        ? "Passwords do not match."
        : undefined;

  const handleChange = (field: keyof CreateAccountFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitMessage(null);
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof CreateAccountFormData, string>> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "This field is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "This field is required.";
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "This field is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "This field is required.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
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

    const result = await authService.createAccount(form);
    setIsLoading(false);

    if (!result.success) {
      setSubmitTone("error");
      setSubmitMessage(result.message ?? "Please review the account details and try again.");
      return;
    }

    setSubmitTone("success");
    setSubmitMessage("Account created successfully.");
    setAccountCreated(true);
  };

  return (
    <AuthLayout
      title="Create admin account"
      subtitle="Set up an administrator account for Hotel PNS Nakshatra."
      footer={
        <span>
          Already have access? <Link href="/admin/login" className="font-medium text-[#051838] underline-offset-4 hover:underline">Go to Admin Login</Link>
        </span>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-xl border border-[#dfe7ef] bg-[#f4f8fb] px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#051838]">
          <ShieldAlert className="h-4 w-4 text-[#cf8c55]" />
          Admin account setup
        </div>

        {submitMessage && <AuthMessage tone={submitTone}>{submitMessage}</AuthMessage>}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <AuthInput
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="Full name"
            value={form.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            error={errors.fullName}
          />

          <AuthInput
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="name@pnsnakshatra.com"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            error={errors.email}
          />

          <AuthInput
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            placeholder="Optional"
            value={form.phoneNumber ?? ""}
            onChange={(event) => handleChange("phoneNumber", event.target.value)}
            error={errors.phoneNumber}
          />

          <PasswordInput
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            error={errors.password}
          />

          <div className="rounded-xl border border-[#dfe7ef] bg-[#f8fbfd] p-3">
            <p className="mb-2 text-sm font-medium text-[#051838]">Password requirements</p>
            <ul className="space-y-2 text-xs text-[#46536b]">
              {passwordChecks.map((rule) => (
                <li key={rule.label} className="flex items-center gap-2">
                  <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${rule.valid ? "bg-[#eaf7ef] text-[#1d6c4a]" : "bg-[#edf1f5] text-[#46536b]"}`}>
                    {rule.valid ? "✓" : "•"}
                  </span>
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <PasswordInput
            label="Confirm Password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(event) => handleChange("confirmPassword", event.target.value)}
            error={errors.confirmPassword}
          />

          {confirmPasswordState && (
            <p className={`text-xs ${confirmPasswordState.includes("match") ? "text-[#1d6c4a]" : "text-[#b34c46]"}`}>
              {confirmPasswordState}
            </p>
          )}

          <div className="rounded-xl border border-[#dfe7ef] bg-[#f9fbfc] px-3 py-2 text-sm text-[#46536b]">
            <span className="font-medium text-[#051838]">Role:</span> Administrator
          </div>

          <AuthButton type="submit" loading={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </AuthButton>
        </form>

        {accountCreated && (
          <div className="space-y-3 rounded-xl border border-[#dfe7ef] bg-[#f7fafb] p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[#184d37]">
              <CheckCircle2 className="h-4 w-4" />
              Account created successfully.
            </div>
            <Link href="/admin/login" className="inline-flex w-full items-center justify-center rounded-xl bg-[#051838] px-4 py-3 text-sm font-semibold text-[#f3f8fa] transition-colors hover:bg-[#0a2244]">
              Go to Admin Login
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
