import { create } from 'zustand';
import { User } from 'next-auth'; 

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; 
  setUser: (user: User | null) => void;
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
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isManager: user?.role === "manager",
    isEmployee: user?.role === "employee" 
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  
}));