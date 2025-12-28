import api from "./api";

const EXPENSE_BASE_URL = "/expenses";

export const expenseService = {
  async getAll() {
    const response = await api.get(EXPENSE_BASE_URL);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`${EXPENSE_BASE_URL}/${id}`);
    return response.data;
  },

  async getByDateRange(startDate, endDate) {
    const response = await api.get(`${EXPENSE_BASE_URL}/date-range`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getByCategory(categoryId) {
    const response = await api.get(
      `${EXPENSE_BASE_URL}/category/${categoryId}`
    );
    return response.data;
  },

  async getByShop(shopId) {
    const response = await api.get(`${EXPENSE_BASE_URL}/shop/${shopId}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post(EXPENSE_BASE_URL, data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`${EXPENSE_BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`${EXPENSE_BASE_URL}/${id}`);
  },
};
