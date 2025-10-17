import { create } from "zustand";
import type { User as NextAuthUser } from "next-auth";

// Align our session user with backend payload: allow numeric ids while staying compatible with NextAuth
type SessionUser = Omit<NextAuthUser, "id"> & {
  id: number | string;
  token: string;
};

interface SessionState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: SessionUser | null) => void;
  setLoading: (loading: boolean) => void;
  isManager: boolean;
  isEmployee: boolean;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isManager: false,
  isEmployee: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isManager: user?.role === "manager",
      isEmployee: user?.role === "employee",
    }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
