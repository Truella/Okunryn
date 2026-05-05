import DecryptionError from "@/components/ui/DecryptionError";
import type { DecryptedMessage } from "@/hooks/useWebSocket";

interface MessageBubbleProps {
  message: DecryptedMessage;
  isOwn: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  if (message.decryptFailed) {
    return (
      <div className={`mb-2 flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <DecryptionError compact />
      </div>
    );
  }

  return (
    <div className={`mb-2 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-2xl px-4 py-2.5 lg:max-w-md ${
          isOwn
            ? "rounded-br-sm bg-[#22c55e] text-[#0a0a0a]"
            : "rounded-bl-sm border border-[#2a2a2a] bg-[#1a1a1a] text-[#f5f5f5]"
        }`}
      >
        <p className="break-words text-sm leading-relaxed">{message.content}</p>
        <p
          className={`mt-1 text-right text-[10px] ${
            isOwn ? "text-[#0a0a0a]/60" : "text-[#3a3a3a]"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
