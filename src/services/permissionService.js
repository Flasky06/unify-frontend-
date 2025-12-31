import { fetchWrapper } from "../utils/fetchWrapper";

const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/permissions`;

export const permissionService = {
  getAllPermissionEnums,
  getAllRoleEnums,
  getRolePermissions,
  updateRolePermissions,
};

function getAllPermissionEnums() {
  return fetchWrapper.get(`${baseUrl}/enums`);
}

function getAllRoleEnums() {
  return fetchWrapper.get(`${baseUrl}/roles`);
}

function getRolePermissions(role) {
  return fetchWrapper.get(`${baseUrl}/role/${role}`);
}

function updateRolePermissions(role, permissions) {
  return fetchWrapper.put(`${baseUrl}/role/${role}`, permissions);
}
