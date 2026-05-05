import { Lock } from "lucide-react";

interface EmptyThreadProps {
	recipientName: string;
}

export default function EmptyThread({ recipientName }: EmptyThreadProps) {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-16">
			<div
				className="flex h-14 w-14 items-center justify-center rounded-2xl"
				style={{
					background: "var(--gradient)",
					boxShadow: "0 8px 24px rgba(91,107,248,0.25)",
				}}
			>
				<Lock className="h-6 w-6 text-white" strokeWidth={1.5} />
			</div>
			<div className="space-y-1.5 text-center">
				<p
					className="text-sm font-medium"
					style={{ color: "var(--text-secondary)" }}
				>
					No messages yet
				</p>
				<p
					className="max-w-xs text-xs leading-relaxed"
					style={{ color: "var(--text-muted)" }}
				>
					Messages between you and{" "}
					<span style={{ color: "var(--text-secondary)" }}>
						{recipientName}
					</span>{" "}
					are end-to-end encrypted. Only you two can read them.
				</p>
			</div>
		</div>
	);
}
