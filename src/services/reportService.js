import { api } from "../lib/api";

export const reportService = {
  getDashboardReport: async () => {
    const response = await api.get("/reports/dashboard");
    return response;
  },

  getDailySalesReport: async (date, shopId) => {
    const params = {};
    if (date) params.date = date;
    if (shopId) params.shopId = shopId;

    const response = await api.get("/reports/daily-sales", { params });
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
