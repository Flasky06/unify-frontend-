import { apiFetch } from "../lib/api";

export const employeeService = {
  async getAll() {
    return await apiFetch("/employees");
  },

  async getActive() {
    return await apiFetch("/employees/active");
  },

  async getByShop(shopId) {
    return await apiFetch(`/employees/shop/${shopId}`);
  },

  async getById(id) {
    return await apiFetch(`/employees/${id}`);
  },

  async create(data) {
    return await apiFetch("/employees", {
      method: "POST",
      body: data,
    });
  },

  async update(id, data) {
    return await apiFetch(`/employees/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id) {
    return await apiFetch(`/employees/${id}`, {
      method: "DELETE",
    });
  },

  async paySalary(id, data) {
    return await apiFetch(`/employees/${id}/pay`, {
      method: "POST",
      body: data,
    });
  },
};
