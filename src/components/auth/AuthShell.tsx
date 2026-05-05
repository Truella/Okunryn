import { type ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";

interface AuthShellProps {
  subtitle: string;
  securityNote: string;
  children: ReactNode;
}

export default function AuthShell({
  subtitle,
  securityNote,
  children,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 py-12">
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1e1e1e] bg-[#111111]">
          <Lock className="h-6 w-6 text-[#22c55e]" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f5]">WhisperBox</h1>
        <p className="text-sm tracking-wide text-[#a3a3a3]">{subtitle}</p>
      </div>

      {children}

      <div className="mt-12 flex items-center gap-2 text-xs text-[#3a3a3a]">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>{securityNote}</span>
      </div>
    </div>
  );
}
