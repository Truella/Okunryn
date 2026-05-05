"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import AuthShell from "@/components/auth/AuthShell";
import {
  type RegisterFormErrors,
  type RegisterFormState,
  validateRegister,
} from "@/components/auth/registerValidation";

export default function RegisterForm() {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormState, boolean>>>({});

  function handleChange(field: keyof RegisterFormState) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const updated = { ...form, [field]: e.target.value };
      setForm(updated);
      if (touched[field]) {
        setErrors(validateRegister(updated));
      }
    };
  }

  function handleBlur(field: keyof RegisterFormState) {
    return () => {
      setTouched((current) => ({ ...current, [field]: true }));
      setErrors(validateRegister(form));
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ username: true, displayName: true, password: true, confirmPassword: true });
    const validationErrors = validateRegister(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    await register({
      username: form.username,
      displayName: form.displayName,
      password: form.password,
    });
  }

  return (
    <AuthShell
      subtitle="Encrypted from the start"
      securityNote="Keys generated on your device. We never see your private key."
    >
      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-sm flex-col gap-6">
        <Input label="Username" type="text" autoComplete="username" autoCapitalize="none" placeholder="alice_92" value={form.username} onChange={handleChange("username")} onBlur={handleBlur("username")} error={touched.username ? errors.username : undefined} />
        <Input label="Display name" type="text" autoComplete="name" placeholder="Alice" value={form.displayName} onChange={handleChange("displayName")} onBlur={handleBlur("displayName")} error={touched.displayName ? errors.displayName : undefined} />
        <Input label="Password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange("password")} onBlur={handleBlur("password")} error={touched.password ? errors.password : undefined} />
        <Input label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange("confirmPassword")} onBlur={handleBlur("confirmPassword")} error={touched.confirmPassword ? errors.confirmPassword : undefined} />

        {error && <p className="-mt-2 text-center text-sm text-[#ef4444]">{error}</p>}

        <Button type="submit" loading={loading} className="mt-2">
          Create account
        </Button>

        <p className="text-center text-sm text-[#a3a3a3]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#22c55e] transition-colors hover:text-[#16a34a]">
            Sign in →
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
