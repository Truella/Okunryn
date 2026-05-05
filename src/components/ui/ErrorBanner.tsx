"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#ef4444]/20 bg-[#1a0a0a] px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#ef4444]" />
      <p className="flex-1 text-xs leading-relaxed text-[#ef4444]">{message}</p>
      {onDismiss && (
        <button
          onClick={dismiss}
          className="flex-shrink-0 text-[#ef4444]/50 transition-colors hover:text-[#ef4444]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
