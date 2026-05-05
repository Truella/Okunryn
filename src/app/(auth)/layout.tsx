import AuthIllustration from "@/components/auth/AuthIllustration";
import { Lock } from "lucide-react";

export default function AuthLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<main
			className="min-h-screen flex items-center justify-center p-4"
			style={{ backgroundColor: "var(--bg)" }}
		>
			<div
				className="w-full max-w-5xl min-h-[600px] max-h-[820px] overflow-hidden rounded-2xl grid lg:grid-cols-2 shadow-2xl"
				style={{
					border: "1px solid var(--border)",
					boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
				}}
			>
				{/* Left — illustration panel */}
				<section
					className="hidden lg:flex flex-col items-center justify-between p-10 relative overflow-hidden"
					style={{ background: "linear-gradient(145deg, #0e0e1a, #13132a)" }}
				>
					{/* Ambient glow */}
					<div
						className="absolute top-0 left-0 w-full h-full pointer-events-none"
						style={{
							background:
								"radial-gradient(ellipse at 30% 20%, rgba(91,107,248,0.18) 0%, transparent 65%), radial-gradient(ellipse at 80% 80%, rgba(155,89,245,0.12) 0%, transparent 60%)",
						}}
					/>

					{/* Logo */}
					<div className="relative z-10 flex items-center gap-2.5 self-start">
						<div
							className="w-8 h-8 rounded-lg flex items-center justify-center"
							style={{ background: "var(--gradient)" }}
						>
							<Lock className="w-4 h-4 text-white" strokeWidth={2} />
						</div>
						<span
							className="text-sm font-semibold tracking-tight"
							style={{ color: "var(--text-primary)" }}
						>
							Okunryn
						</span>
					</div>

					{/* Illustration */}
					<div className="relative z-10 flex-1 flex items-center justify-center w-full py-6">
						<AuthIllustration />
					</div>

					{/* Tagline */}
					<div className="relative z-10 text-center">
						<p
							className="text-base font-semibold tracking-tight mb-1"
							style={{ color: "var(--text-primary)" }}
						>
							Private by design.
						</p>
						<p className="text-xs" style={{ color: "var(--text-muted)" }}>
							Your keys never leave your device.
						</p>
					</div>
				</section>

				{/* Right — auth form */}
				<section
					className="flex items-center justify-center px-8 sm:px-12 py-10"
					style={{ backgroundColor: "var(--bg-soft)" }}
				>
					<div className="w-full max-w-sm">{children}</div>
				</section>
			</div>
		</main>
	);
}
