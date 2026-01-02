import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { userService } from "../../services/userService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const SuperAdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState({
    isOpen: false,
    user: null,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phoneNo: "",
    businessName: "",
    businessType: "",
    address: "",
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
    action: null,
  });

  const { isSuperAdmin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSuperAdmin()) {
      setError("Access denied. Super admin privileges required.");
      setIsLoading(false);
      return;
    }
    fetchBusinessOwners();
  }, []);

  const fetchBusinessOwners = async () => {
    try {
      console.log("Fetching business owners...");
      setIsLoading(true);
      setError(null);
      const data = await userService.getAllBusinessOwners();
      console.log("Business owners fetched:", data);
      setUsers(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching business owners:", err);
      setError(err.message || "Failed to fetch business owners");
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const isActive = user.business?.isActive ?? true;
      await userService.updateBusinessOwner(user.id, {
        business: {
          ...user.business,
          isActive: !isActive,
        },
      });
      setToast({
        isOpen: true,
        message: `Business ${
          isActive ? "deactivated" : "activated"
        } successfully`,
        type: "success",
      });
      fetchBusinessOwners();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to update status",
        type: "error",
      });
    }
  };

  const handleDelete = async (userId) => {
    try {
      await userService.deleteBusinessOwner(userId);
      setToast({
        isOpen: true,
        message: "Business owner deleted successfully",
        type: "success",
      });
      setConfirmDialog({ isOpen: false, userId: null, action: null });
      fetchBusinessOwners();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete business owner",
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
      await userService.createBusinessOwner(formData);
      setToast({
        isOpen: true,
        message: "Business owner created successfully",
        type: "success",
      });
      closeCreateModal();
      fetchBusinessOwners();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to create business owner",
        type: "error",
      });
    }
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      email: "",
      password: "",
      phoneNo: "",
      businessName: "",
      businessType: "",
      address: "",
    });
  };

  const columns = [
    {
      header: "Email",
      accessor: "email",
      triggerView: true,
    },
    {
      header: "Business Name",
      render: (user) => {
        const businessName = user.business?.businessName || "-";
        const businessId = user.business?.id;

        if (businessId) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/super-admin/business/${businessId}`);
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
            >
              {businessName}
            </button>
          );
        }
        return businessName;
      },
    },
    {
      header: "Business Type",
      render: (user) => user.business?.businessType || "-",
    },
    {
      header: "Phone",
      render: (user) => user.phoneNo || "-",
    },
    {
      header: "Status",
      render: (user) => {
        const isActive = user.business?.isActive ?? true;
        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
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
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(user);
            }}
            className={`font-medium px-3 ${
              user.business?.isActive ?? true
                ? "text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                : "text-green-600 hover:bg-green-50 hover:text-green-800"
            }`}
          >
            {user.business?.isActive ?? true ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDialog({
                isOpen: true,
                userId: user.id,
                action: "delete",
              });
            }}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-3"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

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
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-2 sm:gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
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
            Add Business Owner
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading business owners...
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
                  (user.business?.businessName &&
                    user.business.businessName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()))
              )}
              emptyMessage="No business owners found."
              showViewAction={false}
              searchable={false}
            />
          )}
        </div>
      </div>

      {/* Create Business Owner Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Add New Business Owner"
      >
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
                required
              />

              <Input
                label="Business Type"
                type="text"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                required
                placeholder="e.g., Retail, Restaurant, etc."
              />

              <Input
                label="Address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button type="submit">Create Business Owner</Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={viewDetailsModal.isOpen}
        onClose={() => setViewDetailsModal({ isOpen: false, user: null })}
        title="Business Owner Details"
      >
        {viewDetailsModal.user && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-sm text-gray-900">
                {viewDetailsModal.user.email}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1 text-sm text-gray-900">
                {viewDetailsModal.user.phoneNo || "-"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    viewDetailsModal.user.business?.isActive ?? true
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {viewDetailsModal.user.business?.isActive ?? true
                    ? "Active"
                    : "Inactive"}
                </span>
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Business Information
              </h3>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Business Name
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewDetailsModal.user.business?.businessName || "-"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Business Type
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewDetailsModal.user.business?.businessType || "-"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Address</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewDetailsModal.user.business?.address || "-"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Created At
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewDetailsModal.user.createdAt
                      ? new Date(
                          viewDetailsModal.user.createdAt
                        ).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() =>
                  setViewDetailsModal({ isOpen: false, user: null })
                }
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, userId: null, action: null })
        }
        onConfirm={() => handleDelete(confirmDialog.userId)}
        title="Delete Business Owner"
        message="Are you sure you want to delete this business owner? This action cannot be undone and will delete all associated data including shops, products, and sales."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
