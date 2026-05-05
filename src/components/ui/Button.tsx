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
  const base = `
    flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm px-6 py-3.5
    text-sm font-semibold tracking-wide transition-all duration-200
    disabled:cursor-not-allowed disabled:opacity-40
  `;

  const variants = {
    primary:
      "bg-[#22c55e] text-[#0a0a0a] hover:bg-[#16a34a] active:scale-[0.98]",
    ghost:
      "border border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:border-[#3a3a3a] hover:text-[#f5f5f5]",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Working...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
