"use client";

import { Lock } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import ConversationList from "@/components/chat/ConversationList";

export default function InboxPage() {
  const { user } = useAuthContext();
  if (!user) return null;

  return (
    <>
      <ConversationList currentUserId={user.userId} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1e1e1e] bg-[#111111]">
          <Lock className="h-5 w-5 text-[#22c55e]" strokeWidth={1.8} />
        </div>
        <p className="text-sm text-[#3a3a3a]">
          Select a conversation or search for a user
        </p>
      </div>
    </>
  );
}
