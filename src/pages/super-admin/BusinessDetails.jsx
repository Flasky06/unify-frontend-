import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { businessService } from "../../services/businessService";
import { subscriptionService } from "../../services/subscriptionService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";

export const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSubModal, setShowSubModal] = useState(false);

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
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Business Stats
      const statsData = await businessService.getBusinessStats(id);
      setStats(statsData);

      // Fetch Subscription
      try {
        const subData = await subscriptionService.getSubscriptionByBusinessId(
          id
        );
        setSubscription(subData);
      } catch (subErr) {
        // 404 or empty means no subscription
        setSubscription(null);
      }
    } catch (err) {
      console.error("Error fetching business data:", err);
      setError(err.message || "Failed to fetch business details");
    } finally {
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
      loadData();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to update business status",
        type: "error",
      });
    }
  };

  const handleSubscriptionCreated = () => {
    setShowSubModal(false);
    setToast({
      isOpen: true,
      message: "Subscription granted successfully",
      type: "success",
    });
    loadData();
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
          <div className="flex items-center gap-3">
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
            <h1 className="text-xl font-bold text-gray-900">
              {stats.businessName}
            </h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Subscription Card */}
          <SubscriptionCard
            subscription={subscription}
            onAddClick={() => setShowSubModal(true)}
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Shops"
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

      {/* Add Subscription Modal */}
      {showSubModal && (
        <AddSubscriptionModal
          isOpen={showSubModal}
          onClose={() => setShowSubModal(false)}
          onSuccess={handleSubscriptionCreated}
          businessId={id}
        />
      )}

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

// Subscription Card Component
const SubscriptionCard = ({ subscription, onAddClick }) => {
  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription Status
            </h2>
            <p className="mt-1 text-sm text-yellow-700">
              No active subscription found. This business is running in legacy
              mode (Unlimited).
            </p>
          </div>
          <Button onClick={onAddClick} variant="primary">
            + Grant Subscription
          </Button>
        </div>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(subscription.subscriptionEndDate) - new Date()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Subscription Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-24">Plan:</span>
              <span className="font-medium text-gray-900">
                {subscription.planName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-24">Status:</span>
              <StatusBadge status={subscription.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-24">Expires:</span>
              <span className="font-medium text-gray-900">
                {new Date(
                  subscription.subscriptionEndDate
                ).toLocaleDateString()}
                <span
                  className={`ml-2 text-xs ${
                    daysRemaining < 7 ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  (
                  {daysRemaining > 0 ? `${daysRemaining} days left` : "Expired"}
                  )
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-24">Shop Limit:</span>
              <span className="font-medium text-gray-900">
                {subscription.shopLimit} Shops
              </span>
            </div>
          </div>
        </div>
        {/* Future: Add 'Edit' button here */}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-100 text-green-800",
    TRIAL: "bg-blue-100 text-blue-800",
    EXPIRED: "bg-red-100 text-red-800",
    SUSPENDED: "bg-orange-100 text-orange-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${
        styles[status] || styles.CANCELLED
      }`}
    >
      {status}
    </span>
  );
};

// Add Subscription Modal
const AddSubscriptionModal = ({ isOpen, onClose, onSuccess, businessId }) => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    planId: "",
    shopLimit: 1,
    pricePerPeriod: 0,
    billingPeriod: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "ACTIVE",
    notes: "Manual subscription grant",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await subscriptionService.getActivePlans();
      setPlans(data);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    }
  };

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    const plan = plans.find((p) => p.id === parseInt(planId));

    if (plan) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      // Simple calc: Monthly +1mo, Annual +1yr, Quarterly +3mo
      let months = 1;
      if (plan.billingPeriod === "QUARTERLY") months = 3;
      if (plan.billingPeriod === "ANNUALLY") months = 12;

      endDate.setMonth(endDate.getMonth() + months);

      setFormData({
        ...formData,
        planId: planId,
        shopLimit: plan.maxShops,
        pricePerPeriod: plan.pricePerPeriod,
        billingPeriod: plan.billingPeriod,
        endDate: endDate.toISOString().split("T")[0],
      });
    } else {
      setFormData({ ...formData, planId: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        businessId: parseInt(businessId),
        planId: parseInt(formData.planId),
        shopLimit: parseInt(formData.shopLimit),
        billingPeriod: formData.billingPeriod,
        pricePerPeriod: parseFloat(formData.pricePerPeriod),
        status: formData.status,
        subscriptionStartDate: formData.startDate,
        subscriptionEndDate: formData.endDate,
        notes: formData.notes,
      };

      await subscriptionService.createSubscription(payload);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to create subscription: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 z-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Grant Subscription
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Plan
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={formData.planId}
                onChange={handlePlanChange}
              >
                <option value="">-- Choose a Plan --</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.planName} ({p.billingPeriod}) -{" "}
                    {p.pricePerPeriod.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shop Limit
                </label>
                <input
                  type="number"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  value={formData.shopLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, shopLimit: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (Override)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  value={formData.pricePerPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerPeriod: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes (Visible to Admin)
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Grant Subscription
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
