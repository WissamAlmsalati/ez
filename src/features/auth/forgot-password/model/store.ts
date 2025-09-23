import { create } from "zustand";

interface ForgotPasswordState {
  email: string;
  expiresAt?: string; // ISO string from API
  setEmail: (email: string) => void;
  setExpiresAt: (iso?: string) => void;
  reset: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>((set) => ({
  email: "",
  expiresAt: undefined,
  setEmail: (email) => set({ email }),
  setExpiresAt: (iso) => set({ expiresAt: iso }),
  reset: () => set({ email: "", expiresAt: undefined }),
}));
