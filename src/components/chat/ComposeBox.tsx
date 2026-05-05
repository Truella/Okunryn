"use client";

import { useState, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { Send, Lock } from "lucide-react";

interface ComposeBoxProps {
	onSend: (content: string) => Promise<void>;
	disabled?: boolean;
}

export default function ComposeBox({ onSend, disabled }: ComposeBoxProps) {
	const [content, setContent] = useState("");
	const [sending, setSending] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	async function handleSend() {
		const trimmed = content.trim();
		if (!trimmed || sending || disabled) return;
		setSending(true);
		try {
			await onSend(trimmed);
			setContent("");
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		} finally {
			setSending(false);
		}
	}

	function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			void handleSend();
		}
	}

	function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
		setContent(e.target.value);
		const el = e.target;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
	}

	return (
		<div
			className="sticky bottom-0 z-10 px-3 py-3 sm:px-4 sm:py-4"
			style={{
				backgroundColor: "var(--bg-soft)",
				borderTop: "1px solid var(--border)",
				backdropFilter: "blur(12px)",
			}}
		>
			{/* Encryption label */}
			<div className="mb-2 flex items-center gap-1.5">
				<Lock
					className="h-3 w-3"
					style={{ color: "var(--primary)" }}
					strokeWidth={1.5}
				/>
				<span
					className="text-[10px] tracking-wide"
					style={{ color: "var(--text-muted)" }}
				>
					End-to-end encrypted
				</span>
			</div>

			<div
				className="flex items-end gap-2 rounded-2xl p-2 sm:gap-3 sm:p-3"
				style={{
					backgroundColor: "var(--surface)",
					border: "1px solid var(--border)",
				}}
			>
				<textarea
					ref={textareaRef}
					value={content}
					onChange={handleInput}
					onKeyDown={handleKeyDown}
					placeholder="Message…"
					disabled={disabled || sending}
					rows={1}
					className="flex-1 resize-none bg-transparent py-1 px-1 text-sm leading-relaxed outline-none disabled:opacity-40"
					style={{
						color: "var(--text-primary)",
					}}
				/>
				<button
					onClick={() => void handleSend()}
					disabled={!content.trim() || sending || disabled}
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
					style={{ background: "var(--gradient)" }}
				>
					{sending ? (
						<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
					) : (
						<Send className="h-4 w-4 text-white" />
					)}
				</button>
			</div>
		</div>
	);
}
