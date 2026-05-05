"use client";

import { useState, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { Send, Lock } from "lucide-react";

interface ComposeBoxProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export default function ComposeBox({ onSend, disabled }: ComposeBoxProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <div className="border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-[#22c55e]" strokeWidth={1.5} />
        <span className="text-[10px] tracking-wide text-[#3a3a3a]">
          End-to-end encrypted
        </span>
      </div>

      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          disabled={disabled || sending}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-[#1e1e1e] bg-[#111111] px-4 py-3 text-sm leading-relaxed text-[#f5f5f5] placeholder-[#3a3a3a] outline-none transition-colors focus:border-[#22c55e] disabled:opacity-40"
        />
        <button
          onClick={() => void handleSend()}
          disabled={!content.trim() || sending || disabled}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#22c55e] transition-all hover:bg-[#16a34a] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent" />
          ) : (
            <Send className="h-4 w-4 text-[#0a0a0a]" />
          )}
        </button>
      </div>
    </div>
  );
}
