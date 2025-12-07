// app/components/AuthProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type AuthState = {
  user: any | null;
};

type LoginResult = {
  ok: boolean;
  error?: string;
};

type HydrateInput = {
  user: any;
};

type AuthContextValue = {
  user: any | null;
  loading: boolean;      // login in-flight
  initialized: boolean;  // auth loaded from device
  logout: () => void;
  hydrate: (data: HydrateInput) => void; // set auth from an existing payload (e.g. KingsChat)
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "nmt_rsvp";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
  });

  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;

      if (raw) {
        const parsed = JSON.parse(raw);
        setState({
          user: parsed.user ?? null,
        });
      }
    } catch (e) {
      console.error("Failed to load auth from storage", e);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Persist to localStorage whenever auth changes
  useEffect(() => {
    if (!initialized) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save auth to storage", e);
    }
  }, [state, initialized]);

  // Hydrate from an already-normalized payload
  // e.g. response from /api/kingschat/user
  function hydrate(data: HydrateInput) {
    setState({
      user: data.user,
    });
  }

  function logout() {
    setState({
      user: null,
    });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    router.push("/menu/dec7th");
  }

  const value: AuthContextValue = {
    user: state.user,
    loading,
    initialized,
    logout,
    hydrate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
