import { api } from "../lib/api";

export const reportService = {
  getDashboardReport: async () => {
    const response = await api.get("/reports/dashboard");
    return response.data;
  },

  getDailySalesReport: async (date, shopId) => {
    const params = {};
    if (date) params.date = date;
    if (shopId) params.shopId = shopId;

    const response = await api.get("/reports/daily-sales", { params });
    return response.data;
  },
};
