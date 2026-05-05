"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useConversationsContext } from "@/context/ConversationsContext";
import ChatThread from "@/components/chat/ChatThread";
import { apiSearchUsers } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

export default function ChatPage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const { userId } = use(params);
	const searchParams = useSearchParams();
	const { user } = useAuthContext();
	const { conversations, loading: conversationsLoading } = useConversationsContext();
	const [recipientName, setRecipientName] = useState<string | null>(null);
	const recipientNameFromQuery = searchParams.get("name");

	useEffect(() => {
		if (recipientNameFromQuery) {
			setRecipientName(recipientNameFromQuery);
			return;
		}

		if (conversationsLoading) {
			return;
		}

		const fromConversations = conversations.find(
			(conv) => conv.user_id === userId,
		)?.display_name;
		if (fromConversations) {
			setRecipientName(fromConversations);
			return;
		}

		async function fetchName() {
			const token = getAccessToken();
			if (!token) {
				setRecipientName("Unknown user");
				return;
			}
			try {
				const results = await apiSearchUsers(userId, token);
				const match = results.find((u) => u.id === userId);
				setRecipientName(match?.display_name ?? "Unknown user");
			} catch {
				setRecipientName("Unknown user");
			}
		}

		void fetchName();
	}, [conversations, conversationsLoading, recipientNameFromQuery, userId]);

	if (!user) return null;
	if (!recipientName) return null;

	return (
		<ChatThread
			recipientId={userId}
			recipientName={recipientName}
			currentUser={user}
		/>
	);
}
