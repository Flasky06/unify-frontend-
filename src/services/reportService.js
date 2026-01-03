import { api } from "../lib/api";

export const reportService = {
  getDashboardReport: async () => {
    const response = await api.get("/reports/dashboard");
    return response;
  },

  getSalesReport: async (startDate, endDate, shopId) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (shopId) params.shopId = shopId;

    const response = await api.get("/reports/sales", { params });
    return response;
  },

  getStockMovementReport: async (startDate, endDate, shopId) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (shopId) params.shopId = shopId;

    const response = await api.get("/reports/stock-movement", { params });
    return response;
  },
};
