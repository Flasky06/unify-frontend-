import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { userService } from "../../services/userService";
import { shopService } from "../../services/shopService";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import Toast from "../../components/ui/Toast";
import useAuthStore from "../../store/authStore";

import UserPermissionsModal from "./UserPermissionsModal";

export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [permissionsModal, setPermissionsModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    // password: "", // Managed via invite flow
    role: "BUSINESS_MANAGER",
    phoneNo: "",
    shopId: null,
  });

  // UI State
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
  });

  const { canManage } = useAuthStore();

  useEffect(() => {
    fetchUsers();
    fetchShops();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getEmployees();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data || []);
    } catch (err) {
      console.error("Failed to fetch shops:", err);
      // Optional: don't block the UI, but maybe show a toast or partial error
      setToast({
        isOpen: true,
        message:
          "Warning: Failed to load shops list. Linking users to shops may not work.",
        type: "warning",
      });
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const isActive = user.isActive || user.active;
      if (isActive) {
        await userService.deactivateEmployee(user.id);
      } else {
        await userService.activateEmployee(user.id);
      }
      setToast({
        isOpen: true,
        message: `User ${isActive ? "deactivated" : "activated"} successfully`,
        type: "success",
      });
      fetchUsers();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to update status",
        type: "error",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update existing user
        await userService.updateEmployee(editingUser.id, formData);
        setToast({
          isOpen: true,
          message:
            "User updated successfully. User must log out and log back in for role changes to take effect.",
          type: "success",
        });
      } else {
        // Create new user
        await userService.createEmployee(formData);
        setToast({
          isOpen: true,
          message: "User created successfully",
          type: "success",
        });
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      setToast({
        isOpen: true,
        message:
          err.message || `Failed to ${editingUser ? "update" : "create"} user`,
        type: "error",
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      email: "",
      // password: "",
      role: "BUSINESS_MANAGER",
      phoneNo: "",
      shopId: null,
    });
  };

  const columns = [
    {
      header: "Email",
      accessor: "email",
      triggerView: true,
    },
    {
      header: "Role",
      render: (user) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {user.role}
        </span>
      ),
    },
    {
      header: "Phone",
      render: (user) => user.phoneNo || "-",
    },
    {
      header: "Status",
      render: (user) => {
        const isActive = user.isActive || user.active;
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {isActive ? "Active" : "Deactivated"}
          </span>
        );
      },
    },
    {
      header: "Assigned Shop",
      render: (user) =>
        user.shopId ? (
          shops.find((s) => s.id === user.shopId)?.name ||
          `Shop #${user.shopId}`
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      header: "Actions",
      render: (user) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingUser(user);
              setFormData({
                email: user.email,
                // password: "",
                role: user.role,
                phoneNo: user.phoneNo || "",
                shopId: user.shopId || null,
              });
              setIsModalOpen(true);
            }}
            className="text-blue-600 hover:bg-blue-50 font-medium px-3"
          >
            Edit
          </Button>
          {canManage() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setPermissionsModal({
                  isOpen: true,
                  userId: user.id,
                  userName: user.email, // or user.name if available
                });
              }}
              className="text-purple-600 hover:bg-purple-50 font-medium px-3"
            >
              Permissions
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(user);
            }}
            className={`font-medium px-3 ${user.isActive || user.active
              ? "text-red-600 hover:bg-red-50 hover:text-red-700"
              : "text-green-600 hover:bg-green-50 hover:text-green-800"
              }`}
          >
            {user.isActive || user.active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full px-2 md:px-0">
      <div className="flex flex-col gap-2 sm:gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5"
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto whitespace-nowrap py-1.5"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add User
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <Table
              columns={columns}
              data={users.filter(
                (u) =>
                  u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (u.phoneNo && u.phoneNo.includes(searchTerm))
              )}
              emptyMessage="No users found."
              showViewAction={false}
              searchable={false}
            />
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? "Edit User" : "Add New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={editingUser !== null}
            required
          />

          {/* Password field removed - users set their own password via invitation link */}

          <Input
            label="Phone"
            type="text"
            name="phoneNo"
            value={formData.phoneNo}
            onChange={handleInputChange}
          />

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="relative group">
                <svg
                  className="w-4 h-4 text-gray-400 cursor-help"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-4 bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-blue-300">
                        Business Manager
                      </p>
                      <p className="text-gray-300">
                        Full access to settings, reports, staff management, and
                        all shops.
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-green-300">Shop Manager</p>
                      <p className="text-gray-300">
                        Manages sales, stock, and staff for their assigned shop
                        only.
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-yellow-300">
                        Sales Representative
                      </p>
                      <p className="text-gray-300">
                        Can only process sales and view product list. No access
                        to reports.
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-8 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="BUSINESS_MANAGER">Business Manager</option>
              <option value="SHOP_MANAGER">Shop Manager</option>
              <option value="CASHIER">Cashier</option>
              <option value="SALES_REP">Sales Representative</option>
              <option value="STOCK_KEEPER">Stock Keeper</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
          </div>

          {(formData.role === "SHOP_MANAGER" ||
            formData.role === "SALES_REP" ||
            formData.role === "CASHIER") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Shop <span className="text-red-500">*</span>
                </label>
                <select
                  name="shopId"
                  value={formData.shopId || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shopId: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select a shop...</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>

      <UserPermissionsModal
        isOpen={permissionsModal.isOpen}
        onClose={() =>
          setPermissionsModal({ ...permissionsModal, isOpen: false })
        }
        userId={permissionsModal.userId}
        userName={permissionsModal.userName}
      />

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, userId: null })}
        onConfirm={() => { }}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
