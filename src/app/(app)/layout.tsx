"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login");
    }
  }, [user, initializing, router]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent" />
          <p className="text-sm text-[#a3a3a3]">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <div className="flex min-h-screen bg-[#0a0a0a]">{children}</div>;
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
