"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import AuthShell from "@/components/auth/AuthShell";
import {
  type LoginFormErrors,
  type LoginFormState,
  validateLogin,
} from "@/components/auth/loginValidation";

export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState<LoginFormState>({ username: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormState, boolean>>>({});

  function handleChange(field: keyof LoginFormState) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const updated = { ...form, [field]: e.target.value };
      setForm(updated);
      if (touched[field]) {
        setErrors(validateLogin(updated));
      }
    };
  }

  function handleBlur(field: keyof LoginFormState) {
    return () => {
      setTouched((current) => ({ ...current, [field]: true }));
      setErrors(validateLogin(form));
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ username: true, password: true });
    const validationErrors = validateLogin(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    await login({ username: form.username, password: form.password });
  }

  return (
    <AuthShell subtitle="Your keys. Your messages." securityNote="Private key never leaves this device.">
      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-sm flex-col gap-6">
        <Input label="Username" type="text" autoComplete="username" autoCapitalize="none" placeholder="alice_92" value={form.username} onChange={handleChange("username")} onBlur={handleBlur("username")} error={touched.username ? errors.username : undefined} />
        <Input label="Password" type="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={handleChange("password")} onBlur={handleBlur("password")} error={touched.password ? errors.password : undefined} />

        <p className="-mt-2 text-xs text-[#3a3a3a]">
          ⚠ You must sign in from the device you registered on.
        </p>

        {error && <p className="-mt-2 text-center text-sm text-[#ef4444]">{error}</p>}

        <Button type="submit" loading={loading} className="mt-2">
          {loading ? "Unlocking keys..." : "Sign in"}
        </Button>

        <p className="text-center text-sm text-[#a3a3a3]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#22c55e] transition-colors hover:text-[#16a34a]">
            Create one →
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
