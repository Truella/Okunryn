"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { apiGetConversations } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import type { ConversationSummary } from "@/types";

interface ConversationsContextValue {
	conversations: ConversationSummary[];
	loading: boolean;
	refreshConversations: () => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

function sortByRecent(conversations: ConversationSummary[]): ConversationSummary[] {
	return [...conversations].sort(
		(a, b) =>
			new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
	);
}

export function ConversationsProvider({ children }: { children: ReactNode }) {
	const [conversations, setConversations] = useState<ConversationSummary[]>([]);
	const [loading, setLoading] = useState(true);

	const refreshConversations = useCallback(async () => {
		const token = getAccessToken();
		if (!token) {
			setLoading(false);
			return;
		}

		try {
			const data = await apiGetConversations(token);
			setConversations(sortByRecent(data));
		} catch {
			// Keep last known list on fetch errors.
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refreshConversations();
	}, [refreshConversations]);

	useEffect(() => {
		function handleConversationUpdated(event: Event) {
			const customEvent = event as CustomEvent<{
				userId?: string;
				at?: string;
			}>;
			const userId = customEvent.detail?.userId;
			const at = customEvent.detail?.at ?? new Date().toISOString();

			if (userId) {
				setConversations((prev) =>
					sortByRecent(
						prev.map((conversation) =>
							conversation.user_id === userId
								? { ...conversation, last_message_at: at }
								: conversation,
						),
					),
				);
			}
			void refreshConversations();
		}

		window.addEventListener("conversation-updated", handleConversationUpdated);
		return () => {
			window.removeEventListener(
				"conversation-updated",
				handleConversationUpdated,
			);
		};
	}, [refreshConversations]);

	return (
		<ConversationsContext.Provider
			value={{ conversations, loading, refreshConversations }}
		>
			{children}
		</ConversationsContext.Provider>
	);
}

export function useConversationsContext(): ConversationsContextValue {
	const ctx = useContext(ConversationsContext);
	if (!ctx) {
		throw new Error(
			"useConversationsContext must be used within ConversationsProvider",
		);
	}
	return ctx;
}
