import DecryptionError from "@/components/ui/DecryptionError";
import type { DecryptedMessage } from "@/hooks/useWebSocket";

interface MessageBubbleProps {
	message: DecryptedMessage;
	isOwn: boolean;
}

function formatTime(iso: string): string {
	return new Date(iso).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
	if (message.decryptFailed) {
		return (
			<div className={`mb-2 flex ${isOwn ? "justify-end" : "justify-start"}`}>
				<DecryptionError compact />
			</div>
		);
	}

	return (
		<div className={`mb-2 flex ${isOwn ? "justify-end" : "justify-start"}`}>
			<div
				className="max-w-xs rounded-2xl px-4 py-2.5 lg:max-w-md"
				style={
					isOwn
						? {
								background: "var(--gradient)",
								borderBottomRightRadius: "4px",
								boxShadow: "0 2px 12px rgba(91,107,248,0.25)",
							}
						: {
								backgroundColor: "var(--surface)",
								border: "1px solid var(--border)",
								borderBottomLeftRadius: "4px",
							}
				}
			>
				<p
					className="wrap-break-word text-sm leading-relaxed"
					style={{ color: isOwn ? "white" : "var(--text-primary)" }}
				>
					{message.content}
				</p>
				<p
					className="mt-1 text-right text-[10px]"
					style={{
						color: isOwn ? "rgba(255,255,255,0.55)" : "var(--text-muted)",
					}}
				>
					{formatTime(message.createdAt)}
				</p>
			</div>
		</div>
	);
}
