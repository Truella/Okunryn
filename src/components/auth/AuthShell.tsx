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
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-8">
        {/* Mobile only logo — hidden on lg since layout shows it */}
        <div
          className="lg:hidden w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "var(--gradient)" }}
        >
          <Lock className="w-5 h-5 text-white" strokeWidth={2} />
        </div>

        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Okunryn
        </h1>
        <p
          className="text-sm text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          {subtitle}
        </p>
      </div>

      {/* Form */}
      <div className="w-full">{children}</div>

      {/* Security note */}
      <div
        className="mt-8 flex items-center justify-center gap-2 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{securityNote}</span>
      </div>
    </div>
  );
}