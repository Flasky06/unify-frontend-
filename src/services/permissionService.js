import { api } from "../lib/api";

const BASE = "/permissions";

export const permissionService = {
  getAllPermissionEnums: async () => {
    const { data } = await api.get(`${BASE}/enums`);
    return data;
  },

  getAllRoleEnums: async () => {
    const { data } = await api.get(`${BASE}/roles`);
    return data;
  },

  getRolePermissions: async (role) => {
    const { data } = await api.get(`${BASE}/role/${role}`);
    return data;
  },

  updateRolePermissions: async (role, permissions) => {
    const { data } = await api.put(`${BASE}/role/${role}`, permissions);
    return data;
  },

  getUserPermissions: async (userId) => {
    const { data } = await api.get(`${BASE}/user/${userId}`);
    return data;
  },

  updateUserPermissions: async (
    userId,
    grantedPermissions,
    revokedPermissions
  ) => {
    const { data } = await api.put(`${BASE}/user/${userId}`, {
      userId,
      grantedPermissions,
      revokedPermissions,
    });
    return data;
  },
};
