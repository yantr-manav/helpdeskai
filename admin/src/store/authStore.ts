import { create } from "zustand";

interface AuthStore {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (t: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem("admin_token"),
  isAuthenticated: !!localStorage.getItem("admin_token"),
  setToken: (t) => {
    localStorage.setItem("admin_token", t);
    set({ token: t, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("admin_token");
    set({ token: null, isAuthenticated: false });
  },
}));
