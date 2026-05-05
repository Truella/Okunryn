import { Lock } from "lucide-react";

interface EmptyThreadProps {
  recipientName: string;
}

export default function EmptyThread({ recipientName }: EmptyThreadProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1e1e1e] bg-[#111111]">
        <Lock className="h-5 w-5 text-[#22c55e]" strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5 text-center">
        <p className="text-sm font-medium text-[#a3a3a3]">No messages yet</p>
        <p className="max-w-xs text-xs leading-relaxed text-[#3a3a3a]">
          Messages between you and{" "}
          <span className="text-[#a3a3a3]">{recipientName}</span> are end-to-end
          encrypted. Only you two can read them.
        </p>
      </div>
    </div>
  );
}
