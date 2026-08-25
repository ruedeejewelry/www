"use client";

import { useState, useTransition } from "react";
import { signIn } from "@/app/(admin)/admin/login/actions";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await signIn(email, password);
          // A successful sign-in redirects, so anything returned is a failure.
          if (result && !result.ok) setError(result.error);
        });
      }}
    >
      <label htmlFor="email" className="text-[13px] text-ink">
        อีเมล
      </label>
      <input
        id="email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-2 h-[52px] w-full rounded-[11px] border border-border bg-card px-[14px] text-[14px] text-ink outline-none"
      />

      <label htmlFor="password" className="mt-4 block text-[13px] text-ink">
        รหัสผ่าน
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-2 h-[52px] w-full rounded-[11px] border border-border bg-card px-[14px] text-[14px] text-ink outline-none"
      />

      {error ? <p className="mt-3 text-[12.5px] text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 min-h-[50px] w-full rounded-[13px] bg-ink text-[15px] font-semibold text-[#f5f1ea] disabled:opacity-60"
      >
        {pending ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
