import { apiFetch } from "../lib/api";

export const saleService = {
  /**
   * Create a new sale
   * @param {Object} saleData - { shopId, items: [{ productId, quantity }] }
   */
  createSale: async (saleData) => {
    return await apiFetch("/sales", {
      method: "POST",
      body: saleData,
    });
  },

  /**
   * Get sales history
   */
  getSalesHistory: async () => {
    return await apiFetch("/sales");
  },

  /**
   * Get sale by ID
   */
  getSaleById: async (id) => {
    return await apiFetch(`/sales/${id}`);
  },

  /**
   * Get sales by Shop
   */
  getSalesByShop: async (shopId) => {
    return await apiFetch(`/sales/shop/${shopId}`);
  },

  /**
   * Cancel a sale
   */
  cancelSale: async (saleId) => {
    return await apiFetch(`/sales/${saleId}/cancel`, {
      method: "PUT",
    });
  },

  getLogs: async (id) => {
    return await apiFetch(`/sales/${id}/logs`);
  },

  updateStatus: async (saleId, status, paymentMethodId) => {
    let url = `/sales/${saleId}/status?status=${status}`;
    if (paymentMethodId) {
      url += `&paymentMethodId=${paymentMethodId}`;
    }
    return await apiFetch(url, {
      method: "PUT",
    });
  },
};
