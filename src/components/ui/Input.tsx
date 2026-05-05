import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-[#a3a3a3] uppercase">
          {label}
        </label>
        <input
          ref={ref}
          className={`
            w-full border-b-2 bg-transparent px-0 py-3 text-sm text-[#f5f5f5] placeholder-[#3a3a3a]
            outline-none transition-all duration-200
            ${error ? "border-[#ef4444]" : "border-[#2a2a2a] focus:border-[#22c55e]"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-0.5 text-xs text-[#ef4444]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
