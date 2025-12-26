import { apiFetch } from "../lib/api";

export const stockService = {
  /**
   * Get all stocks for the authenticated user's business
   */
  getAllStocks: async () => {
    return await apiFetch("/stocks");
  },

  /**
   * Get stock by ID
   */
  getStockById: async (id) => {
    return await apiFetch(`/stocks/${id}`);
  },

  /**
   * Get stocks for a specific shop
   */
  getStocksByShop: async (shopId) => {
    return await apiFetch(`/stocks/shop/${shopId}`);
  },

  /**
   * Get stocks for a specific product across all shops
   */
  getStocksByProduct: async (productId) => {
    return await apiFetch(`/stocks/product/${productId}`);
  },

  /**
   * Create new stock entry
   */
  createStock: async (stockData) => {
    return await apiFetch("/stocks", {
      method: "POST",
      body: stockData,
    });
  },

  /**
   * Update stock quantity
   */
  updateStock: async (id, stockData) => {
    return await apiFetch(`/stocks/${id}`, {
      method: "PUT",
      body: stockData,
    });
  },

  /**
   * Delete stock entry
   */
  /**
   * Delete stock entry
   */
  deleteStock: async (id) => {
    return await apiFetch(`/stocks/${id}`, {
      method: "DELETE",
    });
  },

  initiateTransfer: async (transferData) => {
    return await apiFetch("/stocks/transfer/initiate", {
      method: "POST",
      body: transferData,
    });
  },

  acknowledgeTransfer: async (transferId) => {
    return await apiFetch(`/stocks/transfer/${transferId}/acknowledge`, {
      method: "POST",
    });
  },

  cancelTransfer: async (transferId) => {
    return await apiFetch(`/stocks/transfer/${transferId}/cancel`, {
      method: "POST",
    });
  },

  getIncomingTransfers: async (shopId) => {
    return await apiFetch(`/stocks/shop/${shopId}/incoming-transfers`);
  },

  getOutgoingTransfers: async (shopId) => {
    return await apiFetch(`/stocks/shop/${shopId}/outgoing-transfers`);
  },
};
