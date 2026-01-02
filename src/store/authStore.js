import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

      hasPermission: (permission) => {
        const { user } = get();
        // Super/Business Owner always has access
        if (["SUPER_ADMIN", "BUSINESS_OWNER"].includes(user?.role)) return true;

        // Implicit grants for other roles (to avoid database migration for sidebar visibility)
        if (
          user?.role === "SHOP_MANAGER" &&
          [
            "VIEW_PRODUCTS",
            "MANAGE_EMPLOYEES",
            "MANAGE_SHOPS",
            "VIEW_SALES",
            "VIEW_STOCK",
            "MANAGE_STOCK",
            "PROCESS_RETURNS",
            "VIEW_REPORTS",
            "CREATE_EXPENSES",
            "VIEW_EXPENSES",
            "MANAGE_PRODUCT_CATEGORIES",
          ].includes(permission)
        ) {
          return true;
        }

        if (
          user?.role === "SALES_REP" &&
          [
            "VIEW_PRODUCTS",
            "CREATE_SALES",
            "VIEW_SALES",
            "VIEW_STOCK",
          ].includes(permission)
        ) {
          return true;
        }

        // Check granted permissions from backend
        return user?.permissions?.includes(permission);
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

      isShopManager: () => {
        const { user } = get();
        return user?.role === "SHOP_MANAGER";
      },

      canManage: () => {
        const { user } = get();
        return ["BUSINESS_OWNER", "BUSINESS_MANAGER"].includes(user?.role);
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user, // User object now contains permissions
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
