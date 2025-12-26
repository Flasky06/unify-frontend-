import { api } from "../lib/api";

export const userService = {
  /**
   * Get authenticated user's profile
   */
  getMyProfile: async () => {
    const data = await api.get("/users/me");
    return data;
  },

  /**
   * Update authenticated user's profile
   */
  updateMyProfile: async (profileData) => {
    const data = await api.put("/users/me", profileData);
    return data;
  },

  /**
   * Get all business owners (SUPER_ADMIN only)
   */
  getAllBusinessOwners: async () => {
    const data = await api.get("/users/business-owners");
    return data;
  },

  /**
   * Get business owner by ID (SUPER_ADMIN only)
   */
  getBusinessOwnerById: async (id) => {
    const data = await api.get(`/users/business-owners/${id}`);
    return data;
  },

  /**
   * Create business owner (SUPER_ADMIN only)
   */
  createBusinessOwner: async (userData) => {
    const data = await api.post("/users/business-owners", userData);
    return data;
  },

  /**
   * Update business owner (SUPER_ADMIN only)
   */
  updateBusinessOwner: async (id, userData) => {
    const data = await api.put(`/users/business-owners/${id}`, userData);
    return data;
  },

  /**
   * Delete business owner (SUPER_ADMIN only)
   */
  deleteBusinessOwner: async (id) => {
    await api.delete(`/users/business-owners/${id}`);
  },

  /**
   * Get all employees for my business (BUSINESS_OWNER only)
   */
  getEmployees: async () => {
    const data = await api.get("/users/my-business/employees");
    return data;
  },

  /**
   * Create employee for my business (BUSINESS_OWNER only)
   */
  createEmployee: async (userData) => {
    const data = await api.post("/users/my-business/employees", userData);
    return data;
  },
};
