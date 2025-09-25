"use client";

import * as React from "react";
import RedirectIfAuthed from "@/components/auth/RedirectIfAuthed";
import AuthCard from "@/components/AuthCard";
import { Input, PasswordInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import GoogleButton from "@/components/auth/GoogleButton";
import { loginWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onGoogle(idToken: string) {
    setError(null); setLoading(true);
    try { await loginWithGoogle(idToken); window.location.href = "/chat"; }
    catch (err: any) { setError(err?.message || "Google sign-in failed"); }
    finally { setLoading(false); }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };

    try {
      // Call Next proxy (sets httpOnly cookies in the response)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = "Login failed";
        try { msg = (await res.json())?.detail || msg; } catch {}
        throw new Error(msg);
      }
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <RedirectIfAuthed />
      <AuthCard title="Welcome back" subtitle="Sign in to continue">
        {error && (
          <div className="mb-3 rounded-lg border border-blood-500/60 bg-blood-500/10 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <Input name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" required />
          <PasswordInput name="password" label="Password" placeholder="••••••••" autoComplete="current-password" required />
          <Button type="submit" className="w-full" loading={loading}>Sign in</Button>
          <div className="my-4 flex items-center gap-3">
            <div className="hr-muted flex-1" /><span className="text-xs text-muted">or</span><div className="hr-muted flex-1" />
          </div>
          <GoogleButton onCredential={onGoogle} text="signin_with" />
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          New here? <a className="text-[var(--accent)] underline" href="/register">Create account</a>
        </p>
      </AuthCard>
    </>
  );
}
