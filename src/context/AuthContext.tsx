"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiGetMe, apiRefreshToken, apiLogout } from "@/lib/api";
import {
  getSession,
  clearSession,
  getRefreshToken,
  updateAccessToken,
} from "@/lib/session";
import { loadWrappedPrivateKey } from "@/crypto_utils/storage";

export interface AuthUser {
  userId: string;
  username: string;
  displayName: string;
  publicKey: string;
  privateKey: CryptoKey;
}

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(async () => {
    const session = getSession();
    const refreshToken = getRefreshToken();
    if (session && refreshToken) {
      await apiLogout(session.accessToken, refreshToken).catch(() => {});
    }
    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const existing = getSession();
    if (existing) {
      setUser({
        userId: existing.userId,
        username: existing.username,
        displayName: existing.displayName,
        publicKey: existing.publicKey,
        privateKey: existing.privateKey,
      });
      setInitializing(false);
      return;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      setInitializing(false);
      return;
    }

    async function restore() {
      try {
        const { access_token } = await apiRefreshToken(refreshToken);
        await apiGetMe(access_token);
        const stored = await loadWrappedPrivateKey();
        if (!stored) {
          throw new Error("No key on device");
        }
        updateAccessToken(access_token);
        throw new Error("Password required to unlock keys");
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setInitializing(false);
      }
    }

    void restore();
  }, []);

  function syncUser() {
    const session = getSession();
    if (!session) {
      return;
    }
    setUser({
      userId: session.userId,
      username: session.username,
      displayName: session.displayName,
      publicKey: session.publicKey,
      privateKey: session.privateKey,
    });
  }

  return (
    <AuthContext.Provider value={{ user, initializing, logout }}>
      <SyncBridge onSync={syncUser} />
      {children}
    </AuthContext.Provider>
  );
}

let syncUserRef: (() => void) | null = null;

export function triggerAuthSync() {
  syncUserRef?.();
}

function SyncBridge({ onSync }: { onSync: () => void }) {
  useEffect(() => {
    syncUserRef = onSync;
    return () => {
      syncUserRef = null;
    };
  }, [onSync]);

  return null;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
