import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { userService } from "../../services/userService";
import { shopService } from "../../services/shopService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  const { isBusinessOwner } = useAuthStore();

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
      setShops(data);
    } catch (err) {
      console.error("Failed to fetch shops:", err);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const isActive = user.isActive || user.active;
      await userService.updateEmployee(user.id, {
        active: !isActive,
      });
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
      await userService.createEmployee(formData);
      setToast({
        isOpen: true,
        message: "User created successfully",
        type: "success",
      });
      closeModal();
      fetchUsers();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to create user",
        type: "error",
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      email: "",
      password: "",
      role: "BUSINESS_MANAGER",
      phoneNo: "",
      shopId: null,
    });
  };

  const columns = [
    {
      header: "Email",
      accessor: "email",
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
      render: (user) => (user.isActive || user.active ? "Active" : "Inactive"),
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(user);
          }}
          className={
            user.isActive || user.active
              ? "text-red-600 hover:text-red-800 hover:bg-red-50"
              : "text-green-600 hover:text-green-800 hover:bg-green-50"
          }
        >
          {user.isActive || user.active ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600">Staff Members</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto whitespace-nowrap"
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
              data={users}
              emptyMessage="No users found."
            />
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Add New User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

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
              <option value="SALES_REP">Sales Representative</option>
            </select>
          </div>

          {(formData.role === "SHOP_MANAGER" ||
            formData.role === "SALES_REP") && (
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
                    {shop.name} - {shop.location}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, userId: null })}
        onConfirm={() => {}}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
