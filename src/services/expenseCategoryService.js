import api from "./api";

const EXPENSE_CATEGORY_BASE_URL = "/expense-categories";

export const expenseCategoryService = {
  async getAll() {
    const response = await api.get(EXPENSE_CATEGORY_BASE_URL);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`${EXPENSE_CATEGORY_BASE_URL}/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post(EXPENSE_CATEGORY_BASE_URL, data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`${EXPENSE_CATEGORY_BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`${EXPENSE_CATEGORY_BASE_URL}/${id}`);
  },
};
