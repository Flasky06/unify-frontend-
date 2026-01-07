import { apiFetch } from "../lib/api";

export const subscriptionService = {
  // ==================== Subscription Plans ====================

  /**
   * Get all subscription plans
   */
  getAllPlans: async () => {
    return await apiFetch("/super-admin/subscription-plans");
  },

  /**
   * Get active subscription plans only
   */
  getActivePlans: async () => {
    return await apiFetch("/super-admin/subscription-plans/active");
  },

  /**
   * Get subscription plan by ID
   */
  getPlanById: async (planId) => {
    return await apiFetch(`/super-admin/subscription-plans/${planId}`);
  },

  // ==================== Business Subscriptions ====================

  /**
   * Get all subscriptions
   */
  getAllSubscriptions: async () => {
    return await apiFetch("/super-admin/subscriptions");
  },

  /**
   * Get subscription by ID
   */
  getSubscriptionById: async (subscriptionId) => {
    return await apiFetch(`/super-admin/subscriptions/${subscriptionId}`);
  },

  /**
   * Get subscription by business ID
   */
  getSubscriptionByBusinessId: async (businessId) => {
    return await apiFetch(`/super-admin/subscriptions/business/${businessId}`);
  },

  /**
   * Get subscriptions by status
   */
  getSubscriptionsByStatus: async (status) => {
    return await apiFetch(`/super-admin/subscriptions/status/${status}`);
  },

  /**
   * Get subscriptions expiring soon
   */
  getExpiringSoon: async (days = 7) => {
    return await apiFetch(
      `/super-admin/subscriptions/expiring-soon?days=${days}`
    );
  },

  /**
   * Create subscription (Super Admin)
   */
  createSubscription: async (data) => {
    return await apiFetch("/super-admin/subscriptions", {
      method: "POST",
      body: data,
    });
  },

  // ----------------------------------------------------
  // User Methods (Business Owner)
  // ----------------------------------------------------

  // Get My Subscription
  getMySubscription: async () => {
    return await apiFetch("/subscriptions/current");
  },

  // Get My Payments
  getMyPayments: async () => {
    return await apiFetch("/subscriptions/payments");
  },

  /**
   * Create trial subscription
   */
  createTrialSubscription: async (businessId, shopLimit = 1) => {
    return await apiFetch(
      `/super-admin/subscriptions/trial?businessId=${businessId}&shopLimit=${shopLimit}`,
      {
        method: "POST",
      }
    );
  },

  /**
   * Update subscription
   */
  updateSubscription: async (subscriptionId, updateData) => {
    return await apiFetch(`/super-admin/subscriptions/${subscriptionId}`, {
      method: "PUT",
      body: updateData,
    });
  },

  /**
   * Suspend subscription
   */
  suspendSubscription: async (subscriptionId) => {
    return await apiFetch(
      `/super-admin/subscriptions/${subscriptionId}/suspend`,
      {
        method: "PUT",
      }
    );
  },

  /**
   * Reactivate subscription
   */
  reactivateSubscription: async (subscriptionId) => {
    return await apiFetch(
      `/super-admin/subscriptions/${subscriptionId}/reactivate`,
      {
        method: "PUT",
      }
    );
  },

  // ==================== Payments ====================

  /**
   * Record payment
   */
  recordPayment: async (subscriptionId, paymentData) => {
    return await apiFetch(
      `/super-admin/subscriptions/${subscriptionId}/payments`,
      {
        method: "POST",
        body: { ...paymentData, subscriptionId },
      }
    );
  },

  /**
   * Get payment history for subscription
   */
  getPaymentHistory: async (subscriptionId) => {
    return await apiFetch(
      `/super-admin/subscriptions/${subscriptionId}/payments`
    );
  },

  /**
   * Get all payments
   */
  getAllPayments: async () => {
    return await apiFetch("/super-admin/payments");
  },

  /**
   * Get payments by date range
   */
  getPaymentsByDateRange: async (startDate, endDate) => {
    return await apiFetch(
      `/super-admin/payments/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  },

  /**
   * Get total revenue
   */
  getTotalRevenue: async (startDate, endDate) => {
    return await apiFetch(
      `/super-admin/revenue?startDate=${startDate}&endDate=${endDate}`
    );
  },
};
