import { apiFetch } from "../lib/api";

export const productCategoryService = {
  // Get all categories
  getAll: async () => {
    return await apiFetch("/product-categories");
  },

  // Get single category
  getById: async (id) => {
    return await apiFetch(`/product-categories/${id}`);
  },

  // Create category
  create: async (data) => {
    return await apiFetch("/product-categories", {
      method: "POST",
      body: data,
    });
  },

  // Update category
  update: async (id, data) => {
    return await apiFetch(`/product-categories/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  // Delete category
  delete: async (id) => {
    return await apiFetch(`/product-categories/${id}`, {
      method: "DELETE",
    });
  },
};
