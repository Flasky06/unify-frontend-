import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { businessService } from "../../services/businessService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";

export const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    action: null,
  });

  useEffect(() => {
    fetchBusinessStats();
  }, [id]);

  const fetchBusinessStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await businessService.getBusinessStats(id);
      setStats(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching business stats:", err);
      setError(err.message || "Failed to fetch business statistics");
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await businessService.toggleBusinessStatus(id);
      setToast({
        isOpen: true,
        message: `Business ${
          stats.isActive ? "deactivated" : "activated"
        } successfully`,
        type: "success",
      });
      setConfirmDialog({ isOpen: false, action: null });
      fetchBusinessStats();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to update business status",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/super-admin/business-owners")}>
            Back to Business Owners
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/super-admin/business-owners")}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {stats.businessName}
            </h1>
            <p className="text-gray-600 mt-1">{stats.businessType}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                stats.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {stats.isActive ? "Active" : "Inactive"}
            </span>
            <Button
              onClick={() =>
                setConfirmDialog({
                  isOpen: true,
                  action: stats.isActive ? "deactivate" : "activate",
                })
              }
              variant={stats.isActive ? "outline" : "primary"}
              className={
                stats.isActive
                  ? "text-orange-600 border-orange-600 hover:bg-orange-50"
                  : ""
              }
            >
              {stats.isActive ? "Deactivate Business" : "Activate Business"}
            </Button>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Business Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="mt-1 text-sm text-gray-900">{stats.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Owner Email</p>
              <p className="mt-1 text-sm text-gray-900">{stats.ownerEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Owner Phone</p>
              <p className="mt-1 text-sm text-gray-900">
                {stats.ownerPhone || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(stats.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Shops"
            value={stats.totalShops}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="Categories"
            value={stats.totalCategories}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            }
            color="purple"
          />
          <StatCard
            title="Services"
            value={stats.totalServices}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
            color="orange"
          />
          <StatCard
            title="Service Categories"
            value={stats.totalServiceCategories}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            color="pink"
          />
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null })}
        onConfirm={handleToggleStatus}
        title={`${
          confirmDialog.action === "deactivate" ? "Deactivate" : "Activate"
        } Business`}
        message={`Are you sure you want to ${
          confirmDialog.action === "deactivate" ? "deactivate" : "activate"
        } this business? ${
          confirmDialog.action === "deactivate"
            ? "Users will not be able to access this business while it is deactivated."
            : "Users will be able to access this business again."
        }`}
        confirmText={
          confirmDialog.action === "deactivate" ? "Deactivate" : "Activate"
        }
        variant={confirmDialog.action === "deactivate" ? "danger" : "primary"}
      />

      {/* Toast */}
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
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};
