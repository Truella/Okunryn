"use client";

import { WifiOff } from "lucide-react";

interface ConnectionBannerProps {
  connected: boolean;
}

export default function ConnectionBanner({ connected }: ConnectionBannerProps) {
  if (connected) return null;

  return (
    <div className="flex items-center gap-2 border-b border-[#f59e0b]/20 bg-[#1a1500] px-4 py-2">
      <WifiOff className="h-3.5 w-3.5 flex-shrink-0 text-[#f59e0b]" />
      <p className="text-xs text-[#f59e0b]">
        Reconnecting... Messages will be delivered when connection is restored.
      </p>
    </div>
  );
}
