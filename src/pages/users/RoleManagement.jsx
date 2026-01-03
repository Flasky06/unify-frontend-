import React, { useState, useEffect } from "react";
import { permissionService } from "../../services/permissionService";
import { Toast } from "../../components/ui/ConfirmDialog";

// Simple Icons
const ShieldIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SaveIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast State
  const [toastState, setToastState] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToastState({ isOpen: true, message, type });
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const loadInitialData = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        permissionService.getAllRoleEnums(),
        permissionService.getAllPermissionEnums(),
      ]);

      // Filter out system roles that shouldn't be edited
      const editableRoles = rolesData.filter(
        (r) => r !== "SUPER_ADMIN" && r !== "BUSINESS_OWNER"
      );
      setRoles(editableRoles);

      // Sort permissions alphabetically or by category if we categorize them later
      setAllPermissions(permissionsData.sort());

      if (editableRoles.length > 0) {
        setSelectedRole(editableRoles[0]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      showToast("Failed to load roles and permissions", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (role) => {
    try {
      setLoading(true);
      const permissions = await permissionService.getRolePermissions(role);
      setRolePermissions(new Set(permissions));
    } catch (error) {
      console.error("Failed to load role permissions:", error);
      showToast(`Failed to load permissions for ${role}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permission) => {
    const newPermissions = new Set(rolePermissions);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    setRolePermissions(newPermissions);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await permissionService.updateRolePermissions(
        selectedRole,
        Array.from(rolePermissions)
      );
      showToast(`Permissions updated for ${selectedRole}`, "success");
    } catch (error) {
      console.error("Failed to update permissions:", error);
      showToast("Failed to update permissions", "error");
    } finally {
      setSaving(false);
    }
  };

  // Helper to format enum strings to readable text
  const formatText = (text) => {
    return text
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Group permissions by category (first word of enum usually)
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const category = permission.split("_")[0]; // e.g., VIEW_PRODUCTS -> VIEW, or we can use suffix?
    // Actually proper categories would be better. Let's try to group by Module.
    let module = "General";
    if (
      permission.includes("PRODUCT") ||
      permission.includes("BRAND") ||
      permission.includes("CATEGORY")
    )
      module = "Products";
    else if (permission.includes("SALE")) module = "Sales";
    else if (
      permission.includes("STOCK") ||
      permission.includes("PURCHASE") ||
      permission.includes("SUPPLIER")
    )
      module = "Inventory";
    else if (permission.includes("EMPLOYEE") || permission.includes("USER"))
      module = "People";
    else if (permission.includes("REPORT") || permission.includes("EXPENSE"))
      module = "Finance & Reports";
    else if (permission.includes("SETTINGS")) module = "Settings";

    if (!acc[module]) acc[module] = [];
    acc[module].push(permission);
    return acc;
  }, {});

  if (loading && !selectedRole) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <SaveIcon className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Role Selector Top Section */}
        <div className="w-full bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2 mb-4">
            Select Role
          </h2>
          <div className="relative">
            <select
              value={selectedRole || ""}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 hover:border-blue-400 text-gray-700 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer font-medium"
            >
              <option value="" disabled>
                Select a role...
              </option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {formatText(role)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 px-1">
            Select a role from the dropdown to view and edit its permissions.
          </p>
        </div>

        {/* Permissions Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Permissions for{" "}
              <span className="text-blue-600">{formatText(selectedRole)}</span>
            </h2>
            <span className="text-sm text-gray-500">
              {rolePermissions.size} permissions enabled
            </span>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedPermissions).map(
              ([category, permissions]) => (
                <div key={category}>
                  <h3 className="text-md font-medium text-gray-700 mb-3 border-l-4 border-blue-500 pl-3">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.map((permission) => (
                      <label
                        key={permission}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          rolePermissions.has(permission)
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                            rolePermissions.has(permission)
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {rolePermissions.has(permission) && (
                            <CheckIcon className="w-3.5 h-3.5 text-white" />
                          )}
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={rolePermissions.has(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                          />
                        </div>
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              rolePermissions.has(permission)
                                ? "text-blue-900"
                                : "text-gray-700"
                            }`}
                          >
                            {formatText(permission)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Allow access to{" "}
                            {permission.toLowerCase().replace(/_/g, " ")}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <Toast
        isOpen={toastState.isOpen}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
        message={toastState.message}
        type={toastState.type}
      />
    </div>
  );
};

export default RoleManagement;
