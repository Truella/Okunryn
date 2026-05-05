"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Lock } from "lucide-react";
import MessageBubble from "@/components/chat/MessageBubble";
import ComposeBox from "@/components/chat/ComposeBox";
import MessageListSkeleton from "@/components/chat/MessageListSkeleton";
import EmptyThread from "@/components/chat/EmptyThread";
import ConnectionBanner from "@/components/ui/ConnectionBanner";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocket } from "@/hooks/useWebSocket";
import { encryptMessage } from "@/crypto_utils/encrypt";
import { importPublicKey } from "@/crypto_utils/keys";
import { apiGetPublicKey, apiSendMessage } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { toUserMessage } from "@/lib/errors";
import type { AuthUser } from "@/context/AuthContext";

interface ChatThreadProps {
  recipientId: string;
  recipientName: string;
  currentUser: AuthUser;
}

export default function ChatThread({
  recipientId,
  recipientName,
  currentUser,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [recipientPublicKey, setRecipientPublicKey] = useState<CryptoKey | null>(
    null,
  );
  const [sendError, setSendError] = useState<string | null>(null);

  const { addMessage, loadHistory, getThread, loading } = useMessages(
    currentUser.userId,
    currentUser.privateKey,
  );

  const { connected, sendMessage } = useWebSocket({
    privateKey: currentUser.privateKey,
    currentUserId: currentUser.userId,
    onMessage: addMessage,
    onPresence: () => {},
  });

  const messages = getThread(recipientId);

  useEffect(() => {
    void loadHistory(recipientId);

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

    void fetchRecipientKey();
  }, [loadHistory, recipientId]);

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
        const payload = await encryptMessage(content, recipientPublicKey, senderPublicKey);
        const sent = sendMessage(recipientId, payload);

        if (!sent) {
          const token = getAccessToken();
          if (!token) throw new Error("Not authenticated");
          await apiSendMessage({ to: recipientId, payload }, token);
        }

        addMessage({
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
    [addMessage, currentUser, recipientId, recipientPublicKey, sendMessage],
  );

  return (
    <div className="flex h-screen flex-1 flex-col bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#1a1a1a]">
            <span className="text-xs font-semibold text-[#a3a3a3]">
              {recipientName[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f5f5f5]">{recipientName}</p>
            <div className="flex items-center gap-1">
              <Lock className="h-2.5 w-2.5 text-[#22c55e]" strokeWidth={2} />
              <span className="text-[10px] text-[#22c55e]">Encrypted</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[#3a3a3a]">{connected ? "Live" : "Offline"}</p>
      </div>

      <ConnectionBanner connected={connected} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <MessageListSkeleton />
        ) : messages.length === 0 ? (
          <EmptyThread recipientName={recipientName} />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.fromUserId === currentUser.userId}
              />
            ))}
          </>
        )}

        {sendError && (
          <ErrorBanner message={sendError} onDismiss={() => setSendError(null)} />
        )}

        <div ref={bottomRef} />
      </div>

      <ComposeBox onSend={handleSend} disabled={!recipientPublicKey} />
    </div>
  );
}
