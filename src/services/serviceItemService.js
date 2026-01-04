import { api } from "../lib/api";

export const serviceItemService = {
  getAll: (categoryId = null) => {
    let url = "/services";
    if (categoryId) {
      url += `?categoryId=${categoryId}`;
    }
    return api.get(url);
  },
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post("/services", data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};
