import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService";
import { setGlobalAuthState } from "../lib/authState";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setAuth: (user) => {
        setGlobalAuthState({ user });
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.login(credentials);
          setGlobalAuthState({ user });
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return user;
        } catch (error) {
          set({ isLoading: false, error });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.register(userData);
          // After registration, user needs to verify email
          // Don't auto-login, just return the user data
          set({
            isLoading: false,
            error: null,
          });
          return user;
        } catch (error) {
          set({ isLoading: false, error });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        }
        setGlobalAuthState({ user: null });
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),

      clearError: () => set({ error: null }),

      // Role-based access helpers
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.includes(user?.role);
      },

      isBusinessOwner: () => {
        const { user } = get();
        return user?.role === "BUSINESS_OWNER";
      },

      isSuperAdmin: () => {
        const { user } = get();
        return user?.role === "SUPER_ADMIN";
      },

      isBusinessManager: () => {
        const { user } = get();
        return user?.role === "BUSINESS_MANAGER";
      },

      canManage: () => {
        const { user } = get();
        return ["BUSINESS_OWNER", "BUSINESS_MANAGER"].includes(user?.role);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
