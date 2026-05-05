"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Lock } from "lucide-react";
import { apiGetConversations, apiSearchUsers } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import type { ConversationSummary, UserPublicInfo } from "@/types";

interface ConversationListProps {
  currentUserId: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#1a1a1a]">
      <span className="text-xs font-semibold text-[#a3a3a3]">{initials}</span>
    </div>
  );
}

export default function ConversationList({ currentUserId }: ConversationListProps) {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserPublicInfo[] | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void currentUserId;
    async function load() {
      const token = getAccessToken();
      if (!token) return;
      try {
        const data = await apiGetConversations(token);
        setConversations(data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [currentUserId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      const token = getAccessToken();
      if (!token) return;
      try {
        const results = await apiSearchUsers(searchQuery, token);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const activeUserId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  return (
    <div className="flex h-screen w-72 flex-shrink-0 flex-col border-r border-[#1a1a1a] bg-[#0d0d0d]">
      <div className="border-b border-[#1a1a1a] px-4 pt-6 pb-4">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#22c55e]" strokeWidth={1.5} />
          <h1 className="text-sm font-semibold tracking-wide text-[#f5f5f5]">
            WhisperBox
          </h1>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#3a3a3a]" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[#1e1e1e] bg-[#111111] py-2.5 pr-3 pl-8 text-xs text-[#f5f5f5] placeholder-[#3a3a3a] outline-none transition-colors focus:border-[#22c55e]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {searchResults !== null && (
          <div>
            <p className="px-4 py-2 text-[10px] font-medium tracking-widest text-[#3a3a3a] uppercase">
              Users
            </p>
            {searching && (
              <p className="px-4 py-3 text-xs text-[#3a3a3a]">Searching...</p>
            )}
            {!searching && searchResults.length === 0 && (
              <p className="px-4 py-3 text-xs text-[#3a3a3a]">No users found</p>
            )}
            {searchResults.map((user) => (
              <Link
                key={user.id}
                href={`/chat/${user.id}`}
                onClick={() => setSearchQuery("")}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  activeUserId === user.id ? "bg-[#111111]" : "hover:bg-[#111111]"
                }`}
              >
                <Avatar name={user.display_name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#f5f5f5]">
                    {user.display_name}
                  </p>
                  <p className="truncate text-xs text-[#3a3a3a]">@{user.username}</p>
                </div>
              </Link>
            ))}
            <div className="mt-1 mb-1 border-t border-[#1a1a1a]" />
            <p className="px-4 py-2 text-[10px] font-medium tracking-widest text-[#3a3a3a] uppercase">
              Recent
            </p>
          </div>
        )}

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-[#1a1a1a]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#1a1a1a]" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-[#1a1a1a]" />
              </div>
            </div>
          ))
        ) : conversations.length === 0 && searchResults === null ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <p className="text-xs text-[#3a3a3a]">No conversations yet</p>
            <p className="text-[10px] text-[#2a2a2a]">Search for a user to start</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.user_id}
              href={`/chat/${conv.user_id}`}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                activeUserId === conv.user_id
                  ? "border-r-2 border-[#22c55e] bg-[#111111]"
                  : "hover:bg-[#0f0f0f]"
              }`}
            >
              <Avatar name={conv.display_name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-[#f5f5f5]">
                    {conv.display_name}
                  </p>
                  <span className="flex-shrink-0 text-[10px] text-[#3a3a3a]">
                    {timeAgo(conv.last_message_at)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-[#3a3a3a]">@{conv.username}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="border-t border-[#1a1a1a] px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
          <p className="text-xs text-[#a3a3a3]">You</p>
        </div>
      </div>
    </div>
  );
}
