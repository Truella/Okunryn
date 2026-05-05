import { ShieldAlert } from "lucide-react";

interface DecryptionErrorProps {
  compact?: boolean;
}

export default function DecryptionError({ compact = false }: DecryptionErrorProps) {
  if (compact) {
    return (
      <div className="flex max-w-xs items-center gap-1.5 rounded-lg border border-[#ef4444]/20 bg-[#1a1a1a] px-3 py-2">
        <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0 text-[#ef4444]" />
        <span className="text-xs text-[#ef4444]">Could not decrypt</span>
      </div>
    );
  }

  return (
    <div className="flex max-w-xs flex-col items-start gap-1 rounded-lg border border-[#ef4444]/20 bg-[#1a1a1a] px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0 text-[#ef4444]" />
        <span className="text-xs font-medium text-[#ef4444]">Decryption failed</span>
      </div>
      <p className="text-[10px] leading-relaxed text-[#ef4444]/60">
        This message could not be decrypted. It may have been sent from a
        different device or the keys may have changed.
      </p>
    </div>
  );
}
