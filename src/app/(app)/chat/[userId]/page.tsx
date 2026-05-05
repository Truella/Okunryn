"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useAuthContext } from "@/context/AuthContext";
import ChatThread from "@/components/chat/ChatThread";
import ConversationList from "@/components/chat/ConversationList";
import { apiSearchUsers } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

export default function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { user } = useAuthContext();
  const [recipientName, setRecipientName] = useState("...");

  useEffect(() => {
    async function fetchName() {
      const token = getAccessToken();
      if (!token) return;
      try {
        const results = await apiSearchUsers(userId, token);
        const match = results.find((u) => u.id === userId);
        if (match) setRecipientName(match.display_name);
      } catch {
      }
    }

    void fetchName();
  }, [userId]);

  if (!user) return null;

  return (
    <>
      <ConversationList currentUserId={user.userId} />
      <ChatThread recipientId={userId} recipientName={recipientName} currentUser={user} />
    </>
  );
}
