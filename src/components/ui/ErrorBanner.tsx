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
		<div
			className="my-2 flex items-start gap-3 rounded-xl px-4 py-3"
			style={{
				backgroundColor: "rgba(239,68,68,0.06)",
				border: "1px solid rgba(239,68,68,0.15)",
			}}
		>
			<AlertTriangle
				className="mt-0.5 h-4 w-4 shrink-0"
				style={{ color: "var(--danger)" }}
			/>
			<p
				className="flex-1 text-xs leading-relaxed"
				style={{ color: "var(--danger)" }}
			>
				{message}
			</p>
			{onDismiss && (
				<button
					onClick={dismiss}
					className="shrink-0 transition-opacity hover:opacity-100"
					style={{ color: "var(--danger)", opacity: 0.5 }}
				>
					<X className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	);
}
