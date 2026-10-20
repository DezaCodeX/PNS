"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { AuthButton } from "../components/AuthButton";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { AuthMessage } from "../components/AuthMessage";
import { authService, isValidEmail } from "../services/authService";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("This field is required.");
      setMessage(null);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setMessage(null);
      return;
    }

    setError("");
    setIsLoading(true);

    const result = await authService.requestPasswordReset(email);
    setIsLoading(false);
    setMessage(result.message ?? "If this account is registered, a reset link will be sent to your email.");
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your registered email address to receive a secure reset link."
      footer={
        <Link href="/admin/login" className="inline-flex items-center gap-2 font-medium text-[#051838] underline-offset-4 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@pnsnakshatra.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
            if (message) setMessage(null);
          }}
          error={error}
        />

        {message && <AuthMessage tone="info">{message}</AuthMessage>}

        <AuthButton type="submit" loading={isLoading}>
          {isLoading ? "Sending reset link..." : "Send reset link"}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
