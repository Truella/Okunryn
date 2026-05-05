"use client";

import { WifiOff } from "lucide-react";

interface ConnectionBannerProps {
	connected: boolean;
}

export default function ConnectionBanner({ connected }: ConnectionBannerProps) {
	if (connected) return null;

	return (
		<div
			className="flex items-center gap-2 px-4 py-2"
			style={{
				backgroundColor: "rgba(245,158,11,0.06)",
				borderBottom: "1px solid rgba(245,158,11,0.15)",
			}}
		>
			<WifiOff
				className="h-3.5 w-3.5 shrink-0"
				style={{ color: "#f59e0b" }}
			/>
			<p className="text-xs" style={{ color: "#f59e0b" }}>
				Reconnecting… Messages will be delivered when connection is restored.
			</p>
		</div>
	);
}
