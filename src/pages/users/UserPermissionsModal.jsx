import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { permissionService } from "../../services/permissionService";
import { userService } from "../../services/userService";
import Toast from "../../components/ui/Toast";

const UserPermissionsModal = ({ isOpen, onClose, userId, userName }) => {
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState(new Set());
  const [granted, setGranted] = useState(new Set());
  const [revoked, setRevoked] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user details to get their role
        const user = await userService
          .getEmployees()
          .then((employees) => employees.find((emp) => emp.id === userId));

        if (!user) {
          throw new Error("User not found");
        }

        // setUserRole(user.role); // Removed unused

        const [enums, userPerms, rolePerms] = await Promise.all([
          permissionService.getAllPermissionEnums(),
          permissionService.getUserPermissions(userId),
          permissionService.getRolePermissions(user.role),
        ]);

        setAllPermissions(enums);
        setRolePermissions(new Set(rolePerms || []));
        setGranted(new Set(userPerms.grantedPermissions || []));
        setRevoked(new Set(userPerms.revokedPermissions || []));
      } catch (error) {
        console.error("Failed to fetch permissions", error);
        showToast("Failed to load permissions", "error");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && userId) {
      fetchData();
    }
  }, [isOpen, userId]);

  const handleToggle = (permission, type) => {
    if (type === "grant") {
      const newGranted = new Set(granted);
      const newRevoked = new Set(revoked);

      if (newGranted.has(permission)) {
        newGranted.delete(permission);
      } else {
        newGranted.add(permission);
        newRevoked.delete(permission); // Cannot be both granted and revoked
      }
      setGranted(newGranted);
      setRevoked(newRevoked);
    } else if (type === "revoke") {
      const newGranted = new Set(granted);
      const newRevoked = new Set(revoked);

      if (newRevoked.has(permission)) {
        newRevoked.delete(permission);
      } else {
        newRevoked.add(permission);
        newGranted.delete(permission); // Cannot be both granted and revoked
      }
      setRevoked(newRevoked);
      setGranted(newGranted);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await permissionService.updateUserPermissions(
        userId,
        Array.from(granted),
        Array.from(revoked)
      );
      showToast(
        "Permissions updated successfully. User must log out and log back in for changes to take effect.",
        "success"
      );
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      showToast("Failed to update permissions", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Group permissions by module (e.g., VIEW_PRODUCTS -> PRODUCTS)
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const module = perm.split("_")[1] || "OTHER"; // heuristic
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Permissions for ${userName || "User"}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
          <p className="font-semibold">Override Instructions:</p>
          <ul className="list-disc ml-5 space-y-1 mt-1">
            <li>
              <span className="font-bold text-green-700">Grant</span>:
              Explicitly give this permission, even if the role doesn't have it.
            </li>
            <li>
              <span className="font-bold text-red-700">Revoke</span>: Explicitly
              remove this permission, even if the role has it.
            </li>
            <li>
              If neither is selected, the user inherits the permission from
              their Role.
            </li>
          </ul>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading permissions...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto p-2">
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">
                    {module}
                  </h3>
                  <div className="space-y-3">
                    {perms.map((perm) => {
                      const isGranted = granted.has(perm);
                      const isRevoked = revoked.has(perm);
                      const hasFromRole = rolePermissions.has(perm);
                      const effectivelyHas =
                        (hasFromRole && !isRevoked) || isGranted;

                      return (
                        <div
                          key={perm}
                          className="flex flex-col justify-between text-xs sm:text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800">
                              {perm.replace(/_/g, " ")}
                            </span>
                            {hasFromRole && !isGranted && !isRevoked && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                From Role
                              </span>
                            )}
                            {effectivelyHas && (
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <label
                              className={`flex-1 flex items-center justify-center gap-1 p-1 rounded cursor-pointer border ${
                                isGranted
                                  ? "bg-green-100 border-green-300 text-green-800"
                                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isGranted}
                                onChange={() => handleToggle(perm, "grant")}
                              />
                              <span className="text-xs font-bold">GRANT</span>
                            </label>

                            <label
                              className={`flex-1 flex items-center justify-center gap-1 p-1 rounded cursor-pointer border ${
                                isRevoked
                                  ? "bg-red-100 border-red-300 text-red-800"
                                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isRevoked}
                                onChange={() => handleToggle(perm, "revoke")}
                              />
                              <span className="text-xs font-bold">REVOKE</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default UserPermissionsModal;
