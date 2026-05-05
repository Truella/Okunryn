"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { Lock } from "lucide-react";

function AppShell({ children }: { children: React.ReactNode }) {
	const { user, initializing } = useAuthContext();
	const router = useRouter();

	useEffect(() => {
		const storedTheme = localStorage.getItem("theme");
		const shouldUseDark = storedTheme ? storedTheme === "dark" : true;
		document.documentElement.classList.toggle("dark", shouldUseDark);
	}, []);

	useEffect(() => {
		if (!initializing && !user) {
			router.replace("/login");
		}
	}, [user, initializing, router]);

	if (initializing) {
		return (
			<div
				className="flex min-h-screen items-center justify-center"
				style={{ backgroundColor: "var(--bg)" }}
			>
				{/* Ambient glow */}
				<div
					className="pointer-events-none fixed inset-0"
					style={{
						background:
							"radial-gradient(ellipse at 30% 20%, rgba(91,107,248,0.12) 0%, transparent 60%), radial-gradient(ellipse at 75% 80%, rgba(155,89,245,0.08) 0%, transparent 60%)",
					}}
				/>

				<div className="relative flex flex-col items-center gap-5">
					{/* Logo mark */}
					<div
						className="flex h-12 w-12 items-center justify-center rounded-2xl"
						style={{ background: "var(--gradient)" }}
					>
						<Lock className="h-5 w-5 text-white" strokeWidth={2} />
					</div>

					{/* Spinner */}
					<div
						className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
						style={{
							borderColor:
								"var(--primary) transparent var(--primary) var(--primary)",
						}}
					/>

					<p className="text-sm" style={{ color: "var(--text-muted)" }}>
						Restoring session…
					</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<SocketProvider user={user}>
			<div
				className="flex min-h-screen"
				style={{ backgroundColor: "var(--bg)" }}
			>
				{children}
			</div>
		</SocketProvider>
	);
}

export default function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<AuthProvider>
			<AppShell>{children}</AppShell>
		</AuthProvider>
	);
}
