import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className = "", ...props }, ref) => {
		return (
			<div className="flex w-full flex-col gap-1.5">
				<label
					className="text-[11px] font-semibold tracking-widest uppercase"
					style={{ color: "var(--text-muted)" }}
				>
					{label}
				</label>
				<input
					ref={ref}
					className={`w-full rounded-lg px-4 py-3 text-sm outline-none
            transition-all duration-200 ${className}`}
					style={{
						backgroundColor: "var(--surface)",
						border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
						color: "var(--text-primary)",
						backdropFilter: "blur(8px)",
					}}
					onFocus={(e) => {
						if (!error) {
							e.currentTarget.style.borderColor = "var(--primary)";
							e.currentTarget.style.boxShadow =
								"0 0 0 3px rgba(91, 107, 248, 0.12)";
						}
					}}
					onBlur={(e) => {
						if (!error) {
							e.currentTarget.style.borderColor = "var(--border)";
							e.currentTarget.style.boxShadow = "none";
						}
						props.onBlur?.(e);
					}}
					{...props}
				/>
				{error && (
					<p className="mt-0.5 text-xs" style={{ color: "var(--danger)" }}>
						{error}
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";
export default Input;
