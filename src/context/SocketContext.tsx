"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiRefreshToken } from "@/lib/api";
import { getAccessToken, getRefreshToken, updateAccessToken } from "@/lib/session";
import { decryptMessage } from "@/crypto_utils/decrypt";
import type { EncryptedMessagePayload } from "@/types";
import type { AuthUser } from "@/context/AuthContext";

export interface DecryptedMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  decryptFailed?: boolean;
}

interface SocketContextValue {
  connected: boolean;
  sendMessage: (to: string, payload: EncryptedMessagePayload) => boolean;
  threads: Record<string, DecryptedMessage[]>;
  addToThread: (msg: DecryptedMessage) => void;
  loadThread: (userId: string, messages: DecryptedMessage[]) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

const WS_URL = "wss://whisperbox.koyeb.app/ws";

export function SocketProvider({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const isMounted = useRef(true);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);
  const [threads, setThreads] = useState<Record<string, DecryptedMessage[]>>({});

  const addToThread = useCallback(
    (msg: DecryptedMessage) => {
      const threadId = msg.fromUserId === user.userId ? msg.toUserId : msg.fromUserId;
      setThreads((prev) => {
        const existing = prev[threadId] ?? [];
        if (existing.some((m) => m.id === msg.id)) {
          return prev;
        }
        return { ...prev, [threadId]: [...existing, msg] };
      });
    },
    [user.userId],
  );

  const loadThread = useCallback((userId: string, messages: DecryptedMessage[]) => {
    setThreads((prev) => ({ ...prev, [userId]: messages }));
  }, []);

  const connect = useCallback(
    async (token: string) => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }

      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted.current) {
          return;
        }
        setConnected(true);
      };

      ws.onmessage = async (event) => {
        if (!isMounted.current) {
          return;
        }

        let frame: Record<string, unknown>;
        try {
          frame = JSON.parse(event.data as string) as Record<string, unknown>;
        } catch {
          return;
        }

        if (frame.event !== "message.receive") {
          return;
        }

        const raw = frame as {
          id: string;
          from_user_id: string;
          to_user_id: string;
          payload: EncryptedMessagePayload;
          created_at: string;
        };

        const isSender = raw.from_user_id === user.userId;
        try {
          const content = await decryptMessage(raw.payload, user.privateKey, isSender);
          addToThread({
            id: raw.id,
            fromUserId: raw.from_user_id,
            toUserId: raw.to_user_id,
            content,
            createdAt: raw.created_at,
          });
        } catch {
          addToThread({
            id: raw.id,
            fromUserId: raw.from_user_id,
            toUserId: raw.to_user_id,
            content: "",
            createdAt: raw.created_at,
            decryptFailed: true,
          });
        }
      };

      ws.onclose = async (event) => {
        if (!isMounted.current) {
          return;
        }
        setConnected(false);

        if (event.code === 4001) {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            router.replace("/login");
            return;
          }
          try {
            const { access_token } = await apiRefreshToken(refreshToken);
            updateAccessToken(access_token);
            await connect(access_token);
          } catch {
            router.replace("/login");
          }
        } else if (event.code === 4003) {
          router.replace("/login");
        } else {
          reconnectTimer.current = setTimeout(() => {
            const nextToken = getAccessToken();
            if (nextToken) {
              void connect(nextToken);
            }
          }, 3000);
        }
      };

      ws.onerror = () => {
        setConnected(false);
      };
    },
    [addToThread, router, user.privateKey, user.userId],
  );

  const sendMessage = useCallback((to: string, payload: EncryptedMessagePayload) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    wsRef.current.send(JSON.stringify({ event: "message.send", to, payload }));
    return true;
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const token = getAccessToken();
    if (token) {
      void connect(token);
    }

    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return (
    <SocketContext.Provider value={{ connected, sendMessage, threads, addToThread, loadThread }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return ctx;
}
