import { useState, useCallback } from "react";
import { apiGetConversationHistory } from "@/lib/api";
import { decryptMessage } from "@/crypto_utils/decrypt";
import { getAccessToken } from "@/lib/session";
import type { DecryptedMessage } from "@/hooks/useWebSocket";

export function useMessages(
  currentUserId: string | null,
  privateKey: CryptoKey | null,
) {
  const [threads, setThreads] = useState<Record<string, DecryptedMessage[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback(
    (msg: DecryptedMessage) => {
      const threadId =
        msg.fromUserId === currentUserId ? msg.toUserId : msg.fromUserId;

      setThreads((prev) => {
        const existing = prev[threadId] ?? [];
        if (existing.some((m) => m.id === msg.id)) {
          return prev;
        }
        return { ...prev, [threadId]: [...existing, msg] };
      });
    },
    [currentUserId],
  );

  const loadHistory = useCallback(
    async (userId: string) => {
      const token = getAccessToken();
      if (!token || !privateKey) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const history = await apiGetConversationHistory(userId, token);

        const decrypted = await Promise.all(
          history.map(async (msg) => {
            const isSender = msg.from_user_id === currentUserId;
            try {
              const content = await decryptMessage(msg.payload, privateKey, isSender);
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

        const sorted = decrypted.reverse();

        setThreads((prev) => ({
          ...prev,
          [userId]: sorted,
        }));
      } catch {
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    },
    [currentUserId, privateKey],
  );

  function getThread(userId: string): DecryptedMessage[] {
    return threads[userId] ?? [];
  }

  return { threads, loading, error, addMessage, loadHistory, getThread };
}
