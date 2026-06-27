import { create } from "zustand";

export const useAppStore = create((set) => ({
  token: "",
  cart: [],
  user: null,
  setCart: (cart) => set({ cart }),
  login: ({ user, token }) => {
    localStorage.setItem("token", token),
      localStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.clear();
    set({ token: "", user: null });
  },
  setTokenUser: ({ token, user }) => set({ token, user }),
}));
