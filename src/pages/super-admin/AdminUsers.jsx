import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { userService } from "../../services/userService";
import { Toast, ConfirmDialog } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "SUPER_ADMIN",
    phoneNo: "",
    businessName: "",
    businessType: "",
    address: "",
    active: true,
  });

  // UI State
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    user: null,
  });

  const navigate = useNavigate();

  const { isSuperAdmin } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({
      email: "",
      password: "",
      role: "SUPER_ADMIN",
      phoneNo: "",
      businessName: "",
      businessType: "",
      address: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "", // Password not editable directly here usually
      role: user.role,
      phoneNo: user.phoneNo || "",
      businessName: user.businessName || "",
      businessType: "", // Not available in basic UserDTO usually unless business owner
      address: "",
      active: user.active,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Edit Logic
        const updateData = {
          phoneNo: formData.phoneNo,
          role: formData.role,
          active: formData.active,
        };
        await userService.updateUser(selectedUser.id, updateData);
        setToast({
          isOpen: true,
          message: "User updated successfully",
          type: "success",
        });
      } else {
        // Create Logic
        await userService.createUser(formData);
        setToast({
          isOpen: true,
          message: "User created successfully",
          type: "success",
        });
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setToast({
        isOpen: true,
        message:
          err.message || `Failed to ${isEditing ? "update" : "create"} user`,
        type: "error",
      });
    }
  };

  const initiateDelete = (user) => {
    setConfirmDialog({
      isOpen: true,
      user: user,
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.user) return;
    try {
      await userService.deleteUser(confirmDialog.user.id);
      setToast({
        isOpen: true,
        message: "User deleted successfully",
        type: "success",
      });
      fetchUsers();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete user",
        type: "error",
      });
    } finally {
      setConfirmDialog({ isOpen: false, user: null });
    }
  };

  const columns = [
    {
      header: "Email",
      accessor: "email",
      render: (user) => (
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => openEditModal(user)}
        >
          {user.email}
        </span>
      ),
    },
    {
      header: "Role",
      render: (user) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.role === "SUPER_ADMIN"
              ? "bg-purple-100 text-purple-800"
              : user.role === "BUSINESS_OWNER"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.role}
        </span>
      ),
    },
    {
      header: "Business",
      render: (user) => {
        if (user.businessName || user.business?.businessName) {
          const name = user.businessName || user.business?.businessName;
          const businessId = user.businessId || user.business?.id;

          if (businessId) {
            return (
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => navigate(`/super-admin/business/${businessId}`)}
              >
                {name}
              </span>
            );
          }
          return name;
        }
        return "-";
      },
    },
    {
      header: "Phone",
      accessor: "phoneNo",
      render: (user) => user.phoneNo || "-",
    },
    {
      header: "Status",
      render: (user) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Created",
      render: (user) =>
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-",
    },
    {
      header: "Actions",
      render: (user) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(user);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger" // Assuming Button supports 'danger' or fallback to a className
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              initiateDelete(user);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Calculate Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    verified: users.filter((u) => u.verified).length,
    businessOwners: users.filter((u) => u.role === "BUSINESS_OWNER").length,
  };

  if (!isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You need super admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden p-2 md:p-6">
      <div className="flex flex-col gap-2 sm:gap-4">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.total} color="blue" />
          <StatCard title="Active Users" value={stats.active} color="green" />
          <StatCard title="Verified" value={stats.verified} color="purple" />
          <StatCard
            title="Business Owners"
            value={stats.businessOwners}
            color="orange"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mt-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">System Users</h3>
            <p className="text-sm text-gray-500">
              Manage all users across the platform.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button
              onClick={openCreateModal}
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
                (user) =>
                  user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (user.phoneNo && user.phoneNo.includes(searchTerm)) ||
                  (user.role &&
                    user.role.toLowerCase().includes(searchTerm.toLowerCase()))
              )}
              emptyMessage="No users found."
              showViewAction={false}
              searchable={false}
            />
          )}
        </div>
      </div>

      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? "Edit User" : "Add New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isEditing} // Email cannot be changed
          />

          {!isEditing && (
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          )}

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="BUSINESS_OWNER">Business Owner</option>
              {/* Add other roles if needed, though usually these are top level */}
            </select>
          </div>

          <Input
            label="Phone"
            type="text"
            name="phoneNo"
            value={formData.phoneNo}
            onChange={handleInputChange}
          />

          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="active"
                className="text-sm font-medium text-gray-700"
              >
                Active Account
              </label>
            </div>
          )}

          {!isEditing && formData.role === "BUSINESS_OWNER" && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Business Information
              </h3>

              <div className="space-y-4">
                <Input
                  label="Business Name"
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required={formData.role === "BUSINESS_OWNER"}
                />

                <Input
                  label="Business Type"
                  type="text"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required={formData.role === "BUSINESS_OWNER"}
                  placeholder="e.g., Retail, Restaurant, etc."
                />

                <Input
                  label="Address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required={formData.role === "BUSINESS_OWNER"}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, user: null })}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user ${confirmDialog.user?.email}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

export default AdminUsers;
