"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Lock } from "lucide-react";
import MessageBubble from "@/components/chat/MessageBubble";
import ComposeBox from "@/components/chat/ComposeBox";
import MessageListSkeleton from "@/components/chat/MessageListSkeleton";
import EmptyThread from "@/components/chat/EmptyThread";
import ConnectionBanner from "@/components/ui/ConnectionBanner";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { useSocket, type DecryptedMessage } from "@/context/SocketContext";
import { encryptMessage } from "@/crypto_utils/encrypt";
import { decryptMessage } from "@/crypto_utils/decrypt";
import { importPublicKey } from "@/crypto_utils/keys";
import {
	apiGetConversationHistory,
	apiGetPublicKey,
	apiSendMessage,
} from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { toUserMessage } from "@/lib/errors";
import type { AuthUser } from "@/context/AuthContext";

interface ChatThreadProps {
	recipientId: string;
	recipientName: string;
	currentUser: AuthUser;
}

function Avatar({ name }: { name: string }) {
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div
			className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
			style={{
				background: "var(--gradient)",
				boxShadow: "0 2px 8px rgba(91,107,248,0.25)",
			}}
		>
			<span className="text-xs font-semibold text-white">{initials}</span>
		</div>
	);
}

export default function ChatThread({
	recipientId,
	recipientName,
	currentUser,
}: ChatThreadProps) {
	const bottomRef = useRef<HTMLDivElement>(null);
	const [recipientPublicKey, setRecipientPublicKey] =
		useState<CryptoKey | null>(null);
	const [sendError, setSendError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const { connected, sendMessage, threads, addToThread, loadThread } =
		useSocket();
	const messages = threads[recipientId] ?? [];

	useEffect(() => {
		async function loadConversation() {
			const token = getAccessToken();
			if (!token) return;
			setLoading(true);
			try {
				const history = await apiGetConversationHistory(recipientId, token);
				const decrypted = await Promise.all(
					history.map(async (msg) => {
						const isSender = msg.from_user_id === currentUser.userId;
						try {
							const content = await decryptMessage(
								msg.payload,
								currentUser.privateKey,
								isSender,
							);
							return {
								id: msg.id,
								fromUserId: msg.from_user_id,
								toUserId: msg.to_user_id,
								content,
								createdAt: msg.created_at,
							} satisfies DecryptedMessage;
						} catch {
							return {
								id: msg.id,
								fromUserId: msg.from_user_id,
								toUserId: msg.to_user_id,
								content: "",
								createdAt: msg.created_at,
								decryptFailed: true,
							} satisfies DecryptedMessage;
						}
					}),
				);
				loadThread(recipientId, decrypted.reverse());
			} catch {
				setSendError("Failed to load messages");
			} finally {
				setLoading(false);
			}
		}

		async function fetchRecipientKey() {
			const token = getAccessToken();
			if (!token) return;
			try {
				const { public_key } = await apiGetPublicKey(recipientId, token);
				const imported = await importPublicKey(public_key);
				setRecipientPublicKey(imported);
			} catch (err) {
				setSendError(toUserMessage(err));
			}
		}

		void loadConversation();
		void fetchRecipientKey();
	}, [currentUser.privateKey, currentUser.userId, loadThread, recipientId]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const handleSend = useCallback(
		async (content: string) => {
			if (!recipientPublicKey) {
				setSendError("Recipient key not loaded yet");
				return;
			}
			setSendError(null);
			try {
				const senderPublicKey = await importPublicKey(currentUser.publicKey);
				const payload = await encryptMessage(
					content,
					recipientPublicKey,
					senderPublicKey,
				);
				const sent = sendMessage(recipientId, payload);
				if (!sent) {
					const token = getAccessToken();
					if (!token) throw new Error("Not authenticated");
					await apiSendMessage({ to: recipientId, payload }, token);
				}
				addToThread({
					id: crypto.randomUUID(),
					fromUserId: currentUser.userId,
					toUserId: recipientId,
					content,
					createdAt: new Date().toISOString(),
				});
			} catch (err) {
				setSendError(toUserMessage(err));
			}
		},
		[addToThread, currentUser, recipientId, recipientPublicKey, sendMessage],
	);

	return (
		<div
			className="flex h-screen flex-1 flex-col"
			style={{ backgroundColor: "var(--bg)" }}
		>
			{/* Thread header */}
			<div
				className="flex items-center justify-between px-6 py-4"
				style={{
					backgroundColor: "var(--bg-soft)",
					borderBottom: "1px solid var(--border)",
				}}
			>
				<div className="flex items-center gap-3">
					<Avatar name={recipientName} />
					<div>
						<p
							className="text-sm font-semibold"
							style={{ color: "var(--text-primary)" }}
						>
							{recipientName}
						</p>
						<div className="flex items-center gap-1.5 mt-0.5">
							<Lock
								className="h-2.5 w-2.5"
								style={{ color: "var(--success)" }}
								strokeWidth={2}
							/>
							<span className="text-[10px]" style={{ color: "var(--success)" }}>
								End-to-end encrypted
							</span>
						</div>
					</div>
				</div>

				{/* Connection indicator */}
				<div className="flex items-center gap-1.5">
					<div
						className="h-1.5 w-1.5 rounded-full"
						style={{
							backgroundColor: connected
								? "var(--success)"
								: "var(--text-muted)",
						}}
					/>
					<span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
						{connected ? "Live" : "Offline"}
					</span>
				</div>
			</div>

			<ConnectionBanner connected={connected} />

			{/* Message list */}
			<div className="flex-1 overflow-y-auto px-4 py-4">
				{loading ? (
					<MessageListSkeleton />
				) : messages.length === 0 ? (
					<EmptyThread recipientName={recipientName} />
				) : (
					messages.map((msg) => (
						<MessageBubble
							key={msg.id}
							message={msg}
							isOwn={msg.fromUserId === currentUser.userId}
						/>
					))
				)}

				{sendError && (
					<ErrorBanner
						message={sendError}
						onDismiss={() => setSendError(null)}
					/>
				)}

				<div ref={bottomRef} />
			</div>

			<ComposeBox onSend={handleSend} disabled={!recipientPublicKey} />
		</div>
	);
}
