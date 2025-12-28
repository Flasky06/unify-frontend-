import { apiFetch } from "../lib/api";

export const expenseCategoryService = {
  async getAll() {
    return await apiFetch("/expense-categories");
  },

  async getById(id) {
    return await apiFetch(`/expense-categories/${id}`);
  },

  async create(data) {
    return await apiFetch("/expense-categories", {
      method: "POST",
      body: data,
    });
  },

  async update(id, data) {
    return await apiFetch(`/expense-categories/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id) {
    return await apiFetch(`/expense-categories/${id}`, {
      method: "DELETE",
    });
  },
};
