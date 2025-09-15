"use client";

import * as React from "react";
import AuthCard from "@/components/AuthCard";
import { Input, PasswordInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login, loginWithGoogle } from "@/lib/auth";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    try {
      await login(email, password);
      window.location.href = "/chat";
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle(idToken: string) {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle(idToken);
      window.location.href = "/chat";
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Enter your credentials">
      {error && (
        <div className="mb-3 rounded-lg border border-blood-500/60 bg-blood-500/10 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
        />
        <PasswordInput
          name="password"
          label="Password"
          placeholder="••••••••"
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="hr-muted flex-1" />
        <span className="text-xs text-muted">or</span>
        <div className="hr-muted flex-1" />
      </div>

      <GoogleButton onCredential={onGoogle} text="signin_with" />

      <p className="mt-4 text-center text-sm text-muted">
        New here?{" "}
        <a className="text-[var(--accent)] underline" href="/register">
          Create account
        </a>
      </p>
    </AuthCard>
  );
}
