"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Lock, LogOut, Moon, Sun } from "lucide-react";
import { apiGetConversations, apiSearchUsers } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { useAuthContext } from "@/context/AuthContext";
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
		<div
			className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
			style={{
				background: "var(--gradient)",
				boxShadow: "0 2px 8px rgba(91,107,248,0.25)",
			}}
		>
			<span className="text-xs font-semibold text-white">{initials}</span>
		</div>
	);
}

export default function ConversationList({
	currentUserId,
}: ConversationListProps) {
	const { logout } = useAuthContext();
	const pathname = usePathname();
	const [conversations, setConversations] = useState<ConversationSummary[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<UserPublicInfo[] | null>(
		null,
	);
	const [searching, setSearching] = useState(false);
	const [loading, setLoading] = useState(true);
	const [theme, setTheme] = useState<"light" | "dark">("dark");

	useEffect(() => {
		const storedTheme = localStorage.getItem("theme");
		const initialTheme = storedTheme === "light" ? "light" : "dark";
		setTheme(initialTheme);
		document.documentElement.classList.toggle("dark", initialTheme === "dark");
	}, []);

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

	function toggleTheme() {
		const nextTheme = theme === "dark" ? "light" : "dark";
		setTheme(nextTheme);
		localStorage.setItem("theme", nextTheme);
		document.documentElement.classList.toggle("dark", nextTheme === "dark");
	}

	return (
		<aside
			className="flex h-screen w-fullshrink-0 flex-col md:w-72 md:min-w-72 md:max-w-72"
			style={{
				backgroundColor: "var(--bg-soft)",
				borderRight: "1px solid var(--border)",
			}}
		>
			{/* Header */}
			<div
				className="px-4 pb-4 pt-5"
				style={{ borderBottom: "1px solid var(--border)" }}
			>
				{/* Wordmark */}
				<div className="mb-4 flex items-center gap-2.5">
					<div
						className="flex h-7 w-7 items-center justify-center rounded-lg"
						style={{ background: "var(--gradient)" }}
					>
						<Lock className="h-3.5 w-3.5 text-white" strokeWidth={2} />
					</div>
					<h1
						className="text-sm font-semibold tracking-tight"
						style={{ color: "var(--text-primary)" }}
					>
						Okunryn
					</h1>
				</div>

				{/* Search */}
				<div className="relative">
					<Search
						className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
						style={{ color: "var(--text-muted)" }}
					/>
					<input
						type="text"
						placeholder="Search users…"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full rounded-xl py-2.5 pl-8 pr-3 text-xs outline-none transition-all"
						style={{
							backgroundColor: "var(--surface)",
							border: "1px solid var(--border)",
							color: "var(--text-primary)",
						}}
						onFocus={(e) => {
							e.currentTarget.style.borderColor = "var(--primary)";
							e.currentTarget.style.boxShadow =
								"0 0 0 3px rgba(91,107,248,0.12)";
						}}
						onBlur={(e) => {
							e.currentTarget.style.borderColor = "var(--border)";
							e.currentTarget.style.boxShadow = "none";
						}}
					/>
				</div>
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto py-2">
				{searchResults !== null && (
					<div>
						<p
							className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest"
							style={{ color: "var(--text-muted)" }}
						>
							Users
						</p>
						{searching && (
							<p
								className="px-4 py-3 text-xs"
								style={{ color: "var(--text-muted)" }}
							>
								Searching…
							</p>
						)}
						{!searching && searchResults.length === 0 && (
							<p
								className="px-4 py-3 text-xs"
								style={{ color: "var(--text-muted)" }}
							>
								No users found
							</p>
						)}
						{searchResults.map((user) => (
							<Link
								key={user.id}
								href={`/chat/${user.id}`}
								onClick={() => setSearchQuery("")}
								className="mx-2 mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
								style={{
									backgroundColor:
										activeUserId === user.id ? "var(--surface)" : "transparent",
									border:
										activeUserId === user.id
											? "1px solid var(--primary)"
											: "1px solid transparent",
								}}
								onMouseEnter={(e) => {
									if (activeUserId !== user.id)
										e.currentTarget.style.backgroundColor = "var(--surface)";
								}}
								onMouseLeave={(e) => {
									if (activeUserId !== user.id)
										e.currentTarget.style.backgroundColor = "transparent";
								}}
							>
								<Avatar name={user.display_name} />
								<div className="min-w-0">
									<p
										className="truncate text-sm font-medium"
										style={{ color: "var(--text-primary)" }}
									>
										{user.display_name}
									</p>
									<p
										className="truncate text-xs"
										style={{ color: "var(--text-muted)" }}
									>
										@{user.username}
									</p>
								</div>
							</Link>
						))}

						<div
							className="mx-4 my-2"
							style={{ borderTop: "1px solid var(--border)" }}
						/>
						<p
							className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest"
							style={{ color: "var(--text-muted)" }}
						>
							Recent
						</p>
					</div>
				)}

				{loading ? (
					Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="mx-2 mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5"
						>
							<div
								className="h-10 w-10 shrink-0 animate-pulse rounded-full"
								style={{ backgroundColor: "var(--surface)" }}
							/>
							<div className="flex-1 space-y-2">
								<div
									className="h-3 w-2/3 animate-pulse rounded"
									style={{ backgroundColor: "var(--surface)" }}
								/>
								<div
									className="h-2.5 w-1/2 animate-pulse rounded"
									style={{ backgroundColor: "var(--surface)" }}
								/>
							</div>
						</div>
					))
				) : conversations.length === 0 && searchResults === null ? (
					<div className="flex h-40 flex-col items-center justify-center gap-2">
						<p className="text-xs" style={{ color: "var(--text-muted)" }}>
							No conversations yet
						</p>
						<p
							className="text-[10px]"
							style={{ color: "var(--text-secondary)" }}
						>
							Search for a user to start
						</p>
					</div>
				) : (
					conversations.map((conv) => (
						<Link
							key={conv.user_id}
							href={`/chat/${conv.user_id}`}
							className="mx-2 mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
							style={{
								backgroundColor:
									activeUserId === conv.user_id
										? "var(--surface)"
										: "transparent",
								border:
									activeUserId === conv.user_id
										? "1px solid var(--primary)"
										: "1px solid transparent",
							}}
							onMouseEnter={(e) => {
								if (activeUserId !== conv.user_id)
									e.currentTarget.style.backgroundColor = "var(--surface)";
							}}
							onMouseLeave={(e) => {
								if (activeUserId !== conv.user_id)
									e.currentTarget.style.backgroundColor = "transparent";
							}}
						>
							<Avatar name={conv.display_name} />
							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between gap-2">
									<p
										className="truncate text-sm font-medium"
										style={{ color: "var(--text-primary)" }}
									>
										{conv.display_name}
									</p>
									<span
										className="shrink-0 text-[10px]"
										style={{ color: "var(--text-muted)" }}
									>
										{timeAgo(conv.last_message_at)}
									</span>
								</div>
								<p
									className="mt-0.5 truncate text-xs"
									style={{ color: "var(--text-muted)" }}
								>
									@{conv.username}
								</p>
							</div>
						</Link>
					))
				)}
			</div>

			{/* Footer */}
			<div
				className="px-4 py-4"
				style={{ borderTop: "1px solid var(--border)" }}
			>
				<div className="mb-3 flex items-center gap-2">
					<div
						className="h-2 w-2 rounded-full"
						style={{ backgroundColor: "var(--success)" }}
					/>
					<p className="text-xs" style={{ color: "var(--text-secondary)" }}>
						Online
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={toggleTheme}
						className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all"
						style={{
							backgroundColor: "var(--surface)",
							border: "1px solid var(--border)",
							color: "var(--text-secondary)",
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.color = "var(--text-primary)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.color = "var(--text-secondary)")
						}
					>
						{theme === "dark" ? (
							<Sun className="h-3.5 w-3.5" />
						) : (
							<Moon className="h-3.5 w-3.5" />
						)}
						<span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
					</button>

					<button
						type="button"
						onClick={() => void logout()}
						className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all"
						style={{
							backgroundColor: "var(--surface)",
							border: "1px solid var(--border)",
							color: "var(--text-secondary)",
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.color = "var(--danger)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.color = "var(--text-secondary)")
						}
					>
						<LogOut className="h-3.5 w-3.5" />
						<span>Logout</span>
					</button>
				</div>
			</div>
		</aside>
	);
}
