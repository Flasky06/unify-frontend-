import { apiFetch } from "../lib/api";

export const platformService = {
  /**
   * Get platform-wide statistics (SUPER_ADMIN only)
   */
  getPlatformStats: async () => {
    return await apiFetch("/platform/stats");
  },
};
