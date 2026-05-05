"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRefreshToken } from "@/lib/api";
import {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from "@/lib/session";
import { decryptMessage } from "@/crypto_utils/decrypt";
import type { EncryptedMessagePayload } from "@/types";

const WS_URL = "wss://whisperbox.koyeb.app/ws";

export interface DecryptedMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  decryptFailed?: boolean;
}

interface UseWebSocketOptions {
  privateKey: CryptoKey | null;
  currentUserId: string | null;
  onMessage: (msg: DecryptedMessage) => void;
  onPresence: (userId: string, online: boolean) => void;
}

export function useWebSocket({
  privateKey,
  currentUserId,
  onMessage,
  onPresence,
}: UseWebSocketOptions) {
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);
  const [connected, setConnected] = useState(false);

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

        const evtType = frame.event;

        if (evtType === "message.receive") {
          await handleIncoming(frame);
        } else if (evtType === "user.online") {
          onPresence(frame.user_id as string, true);
        } else if (evtType === "user.offline") {
          onPresence(frame.user_id as string, false);
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
            const token = getAccessToken();
            if (token) {
              void connect(token);
            }
          }, 3000);
        }
      };

      ws.onerror = () => {
        setConnected(false);
      };
    },
    [currentUserId, onPresence, privateKey, router],
  );

  async function handleIncoming(frame: Record<string, unknown>) {
    const raw = frame as {
      id: string;
      from_user_id: string;
      to_user_id: string;
      payload: EncryptedMessagePayload;
      created_at: string;
    };

    const isSender = raw.from_user_id === currentUserId;

    if (!privateKey) {
      onMessage({
        id: raw.id,
        fromUserId: raw.from_user_id,
        toUserId: raw.to_user_id,
        content: "",
        createdAt: raw.created_at,
        decryptFailed: true,
      });
      return;
    }

    try {
      const content = await decryptMessage(raw.payload, privateKey, isSender);
      onMessage({
        id: raw.id,
        fromUserId: raw.from_user_id,
        toUserId: raw.to_user_id,
        content,
        createdAt: raw.created_at,
      });
    } catch {
      onMessage({
        id: raw.id,
        fromUserId: raw.from_user_id,
        toUserId: raw.to_user_id,
        content: "",
        createdAt: raw.created_at,
        decryptFailed: true,
      });
    }
  }

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

  return { connected, sendMessage };
}
