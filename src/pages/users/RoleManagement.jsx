import React, { useState, useEffect } from "react";
import { permissionService } from "../../services/permissionService";
import { toast } from "react-hot-toast";
import { Shield, Save, Check, X, AlertCircle } from "lucide-react";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      toast.error("Failed to load roles and permissions");
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
      toast.error(`Failed to load permissions for ${role}`);
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
      toast.success(`Permissions updated for ${selectedRole}`);
    } catch (error) {
      console.error("Failed to update permissions:", error);
      toast.error("Failed to update permissions");
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Role Permissions
          </h1>
          <p className="text-gray-500 mt-1">
            Customize what each staff member can do
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Role Selector Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-sm border p-2 h-fit">
          <h2 className="font-semibold px-4 py-3 text-gray-700 border-b mb-2">
            Select Role
          </h2>
          <div className="space-y-1">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  selectedRole === role
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {formatText(role)}
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border p-6">
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
                            <Check className="w-3.5 h-3.5 text-white" />
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
    </div>
  );
};

export default RoleManagement;
