import { apiFetch } from "../lib/api";

export const expenseService = {
  async getAll() {
    return await apiFetch("/expenses");
  },

  async getById(id) {
    return await apiFetch(`/expenses/${id}`);
  },

  async getByDateRange(startDate, endDate) {
    return await apiFetch(
      `/expenses/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  },

  async getByCategory(categoryId) {
    return await apiFetch(`/expenses/category/${categoryId}`);
  },

  async getByShop(shopId) {
    return await apiFetch(`/expenses/shop/${shopId}`);
  },

  async create(data) {
    return await apiFetch("/expenses", {
      method: "POST",
      body: data,
    });
  },

  async update(id, data) {
    return await apiFetch(`/expenses/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id) {
    return await apiFetch(`/expenses/${id}`, {
      method: "DELETE",
    });
  },

  async void(id) {
    return await apiFetch(`/expenses/${id}/void`, {
      method: "POST",
    });
  },

  async getLogs(id) {
    return await apiFetch(`/expenses/${id}/logs`);
  },
};
