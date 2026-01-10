import { apiFetch } from "../lib/api";

export const salaryService = {
  async getAll() {
    return await apiFetch("/salary-records");
  },

  async getById(id) {
    return await apiFetch(`/salary-records/${id}`);
  },

  async getByEmployee(employeeId) {
    return await apiFetch(`/salary-records/employee/${employeeId}`);
  },

  async create(data) {
    return await apiFetch("/salary-records", {
      method: "POST",
      body: data,
    });
  },

  async update(id, data) {
    return await apiFetch(`/salary-records/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async void(id) {
    return await apiFetch(`/salary-records/${id}/void`, {
      method: "POST",
    });
  },

  async delete(id) {
    return await apiFetch(`/salary-records/${id}`, {
      method: "DELETE",
    });
  },
};
