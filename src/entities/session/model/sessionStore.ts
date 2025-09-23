import { create } from 'zustand';
import { User } from 'next-auth'; 

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; 
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, 
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  setLoading: (loading) => set({ isLoading: loading }),
}));