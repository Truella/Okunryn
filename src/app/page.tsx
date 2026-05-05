import Link from "next/link";
import { Lock, Zap, Shield, MessageCircle } from "lucide-react";

export default function RootPage() {
	return (
		<main
			className="min-h-screen max-h-screen flex flex-col overflow-hidden"
			style={{ backgroundColor: "var(--bg)" }}
		>
			{/* Ambient background blobs */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div
					className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
					style={{ background: "var(--gradient)" }}
				/>
				<div
					className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
					style={{ background: "var(--gradient)" }}
				/>
			</div>

			{/* Nav */}
			<nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-6xl mx-auto w-full">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
						<Lock className="w-4 h-4 text-white" strokeWidth={2} />
					</div>
					<span
						className="text-base font-semibold tracking-tight"
						style={{ color: "var(--text-primary)" }}
					>
						Okunryn
					</span>
				</div>

				<div className="flex items-center gap-3">
					<Link
						href="/login"
						className="text-sm px-4 py-2 rounded-lg transition-colors"
						style={{ color: "var(--text-secondary)" }}
					>
						Sign in
					</Link>
					<Link
						href="/register"
						className="text-sm px-4 py-2 rounded-lg font-medium text-white gradient-bg
              hover:opacity-90 active:scale-95 transition-all"
					>
						Get started
					</Link>
				</div>
			</nav>

			{/* Hero */}
			<section
				className="relative z-10 flex-1 flex flex-col items-center justify-center
        text-center px-6 max-w-4xl mx-auto w-full"
			>
				{/* Badge */}
				<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-8">
					<div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
					<span
						className="text-xs font-medium"
						style={{ color: "var(--text-secondary)" }}
					>
						End-to-end encrypted · Keys never leave your device
					</span>
				</div>

				{/* Headline */}
				<h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
					<span style={{ color: "var(--text-primary)" }}>
						Messages that stay
					</span>
					<br />
					<span className="gradient-text">between you.</span>
				</h1>

				{/* Subheadline */}
				<p
					className="text-base md:text-lg max-w-xl leading-relaxed mb-10"
					style={{ color: "var(--text-secondary)" }}
				>
					Your messages are end-to-end encrypted, so only you and the person
					you are chatting with can read them.
				</p>

				{/* CTAs */}
				<div className="flex items-center gap-3 mb-16">
					<Link
						href="/register"
						className="px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-bg
              hover:opacity-90 active:scale-95 transition-all shadow-lg"
						style={{ boxShadow: "0 8px 30px rgba(91, 107, 248, 0.35)" }}
					>
						Create free account
					</Link>
					<Link
						href="/login"
						className="px-6 py-3 rounded-xl text-sm font-medium glass
              hover:opacity-80 transition-all"
						style={{ color: "var(--text-primary)" }}
					>
						Sign in →
					</Link>
				</div>

				{/* Feature pills */}
				<div className="flex flex-wrap items-center justify-center gap-3">
					{[
						{ icon: Zap, label: "Real-time messaging" },
						{ icon: Shield, label: "Zero-knowledge encryption" },
						{ icon: MessageCircle, label: "Works on any device" },
					].map(({ icon: Icon, label }) => (
						<div
							key={label}
							className="flex items-center gap-2 px-4 py-2 rounded-full glass"
						>
							<Icon
								className="w-3.5 h-3.5"
								style={{ color: "var(--primary)" }}
							/>
							<span
								className="text-xs"
								style={{ color: "var(--text-secondary)" }}
							>
								{label}
							</span>
						</div>
					))}
				</div>
			</section>

			{/* Footer */}
			<footer className="relative z-10 flex items-center justify-center py-6">
				<p className="text-xs" style={{ color: "var(--text-muted)" }}>
					© 2026 Okunryn · Your keys. Your messages. Always.
				</p>
			</footer>
		</main>
	);
}
