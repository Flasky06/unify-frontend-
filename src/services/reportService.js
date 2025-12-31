import { api } from "../lib/api";

export const reportService = {
  getDashboardReport: async () => {
    const response = await api.get("/reports/dashboard");
    return response.data;
  },
};
