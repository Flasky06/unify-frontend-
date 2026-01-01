import { api } from "../lib/api";

const BASE = "/permissions";

export const permissionService = {
  getAllPermissionEnums,
  getAllRoleEnums,
  getRolePermissions,
  updateRolePermissions,
};

function getAllPermissionEnums() {
  return api.get(`${BASE}/enums`);
}

function getAllRoleEnums() {
  return api.get(`${BASE}/roles`);
}

function getRolePermissions(role) {
  return api.get(`${BASE}/role/${role}`);
}

function updateRolePermissions(role, permissions) {
  return api.put(`${BASE}/role/${role}`, permissions);
}
