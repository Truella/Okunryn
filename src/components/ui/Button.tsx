import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	loading?: boolean;
	variant?: "primary" | "ghost";
}

export default function Button({
	children,
	loading = false,
	variant = "primary",
	className = "",
	disabled,
	...props
}: ButtonProps) {
	const base =
		"flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40";

	const variants: Record<string, React.CSSProperties> = {
		primary: {
			background: "var(--gradient)",
			color: "white",
			boxShadow: "0 6px 24px rgba(91, 107, 248, 0.3)",
		},
		ghost: {
			background: "var(--surface)",
			color: "var(--text-primary)",
			border: "1px solid var(--border)",
		},
	};

	return (
		<button
			disabled={disabled || loading}
			className={`${base} ${className} hover:opacity-90 active:scale-[0.98]`}
			style={variants[variant]}
			{...props}
		>
			{loading ? (
				<>
					<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
					<span>Working...</span>
				</>
			) : (
				children
			)}
		</button>
	);
}
