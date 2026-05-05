"use client";

import { Lock } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

export default function InboxPage() {
	const { user } = useAuthContext();
	if (!user) return null;

	return (
		<div
			className="flex flex-1 flex-col items-center justify-center gap-4"
			style={{ backgroundColor: "var(--bg)" }}
		>
			{/* Ambient glow */}
			<div
				className="pointer-events-none fixed inset-0"
				style={{
					background:
						"radial-gradient(ellipse at 60% 40%, rgba(91,107,248,0.07) 0%, transparent 60%)",
				}}
			/>

			<div
				className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
				style={{
					background: "var(--gradient)",
					boxShadow: "0 8px 30px rgba(91,107,248,0.25)",
				}}
			>
				<Lock className="h-6 w-6 text-white" strokeWidth={1.8} />
			</div>

			<div className="flex flex-col items-center gap-1.5">
				<p
					className="text-sm font-medium"
					style={{ color: "var(--text-secondary)" }}
				>
					Your messages are end-to-end encrypted
				</p>
				<p className="text-xs" style={{ color: "var(--text-muted)" }}>
					Select a conversation or search for a user to start
				</p>
			</div>
		</div>
	);
}
