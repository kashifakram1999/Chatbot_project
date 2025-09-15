"use client";

import * as React from "react";
import AuthCard from "@/components/AuthCard";
import { Input, PasswordInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import GoogleButton from "@/components/auth/GoogleButton";
import { loginWithGoogle } from "@/lib/auth";

export default function RegisterPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const pwMatch =
    password.length > 0 && confirm.length > 0 && password === confirm;
  const pwWeak = password.length > 0 && password.length < 8; // simple hint; keep backend as source of truth

  async function onGoogle(idToken: string) {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle(idToken); // backend will create-or-login
      window.location.href = "/chat";
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };

    try {
      // Call Django backend directly (normalize base to avoid /api duplication)
      const raw = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const base = raw.replace(/\/+$/, "");
      const apiBase = base.endsWith("/api") ? base : `${base}/api`;
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      if (!res.ok) {
        let errorMessage = "Registration failed";
        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      // Store tokens if registration returns them
      if (data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        // Redirect to chat if logged in
        window.location.href = "/chat";
      } else {
        // Redirect to login if no auto-login
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Join and start chatting">
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
          autoComplete="email"
          required
        />
        <PasswordInput
          name="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="new-password"
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
        />
        <PasswordInput
          name="confirm_password"
          label="Confirm password"
          placeholder="••••••••"
          autoComplete="new-password"
          onChange={(e) => setConfirm(e.currentTarget.value)}
          required
          error={
            confirm && password !== confirm
              ? "Passwords do not match."
              : undefined
          }
        />

        {/* Simple strength/match hints */}
        <div className="text-xs text-muted">
          {pwWeak && <div>Password should be at least 8 characters.</div>}
          {pwMatch && !pwWeak && <div>Looks good — passwords match.</div>}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <input type="checkbox" required className="rounded" id="tos" />
          <label htmlFor="tos" className="text-muted">
            I agree to the{" "}
            <a className="text-[var(--accent)] underline" href="/terms">
              Terms
            </a>
            .
          </label>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
        <div className="my-4 flex items-center gap-3">
          <div className="hr-muted flex-1" />
          <span className="text-xs text-muted">or</span>
          <div className="hr-muted flex-1" />
        </div>
        <GoogleButton onCredential={onGoogle} text="signup_with" />
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <a className="text-[var(--accent)] underline" href="/login">
          Sign in
        </a>
      </p>
    </AuthCard>
  );
}
