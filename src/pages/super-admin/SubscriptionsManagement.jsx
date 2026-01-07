import { useState, useEffect } from "react";
import { subscriptionService } from "../../services/subscriptionService";
import { Toast } from "../../components/ui/ConfirmDialog";

const SubscriptionsManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [toastState, setToastState] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToastState({ isOpen: true, message, type });
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [subsData, plansData] = await Promise.all([
        filterStatus === "ALL"
          ? subscriptionService.getAllSubscriptions()
          : subscriptionService.getSubscriptionsByStatus(filterStatus),
        subscriptionService.getActivePlans(),
      ]);
      setSubscriptions(subsData);
      setPlans(plansData);
    } catch (error) {
      showToast("Failed to fetch data", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (subscriptionId, paymentData) => {
    try {
      await subscriptionService.recordPayment(subscriptionId, paymentData);
      showToast("Payment recorded successfully!", "success");
      setShowPaymentModal(false);
      fetchData();
    } catch (error) {
      showToast("Failed to record payment", "error");
      console.error(error);
    }
  };

  const handleCreateTrial = async (businessId) => {
    try {
      await subscriptionService.createTrialSubscription(businessId, 1);
      showToast("Trial subscription created!", "success");
      fetchData();
    } catch (error) {
      showToast("Failed to create trial", "error");
      console.error(error);
    }
  };

  const handleSuspend = async (subscriptionId) => {
    if (!confirm("Are you sure you want to suspend this subscription?")) return;
    try {
      await subscriptionService.suspendSubscription(subscriptionId);
      showToast("Subscription suspended", "success");
      fetchData();
    } catch (error) {
      showToast("Failed to suspend subscription", "error");
    }
  };

  const handleReactivate = async (subscriptionId) => {
    try {
      await subscriptionService.reactivateSubscription(subscriptionId);
      showToast("Subscription reactivated", "success");
      fetchData();
    } catch (error) {
      showToast("Failed to reactivate subscription", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Subscription Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage business subscriptions and payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Subscriptions"
          value={subscriptions.length}
          color="blue"
        />
        <StatCard
          title="Active"
          value={subscriptions.filter((s) => s.status === "ACTIVE").length}
          color="green"
        />
        <StatCard
          title="Trial"
          value={subscriptions.filter((s) => s.status === "TRIAL").length}
          color="yellow"
        />
        <StatCard
          title="Expired"
          value={subscriptions.filter((s) => s.status === "EXPIRED").length}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["ALL", "ACTIVE", "TRIAL", "EXPIRED", "SUSPENDED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Shops
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sub.businessName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sub.planName}</div>
                    <div className="text-xs text-gray-500">
                      {sub.billingPeriod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sub.currentShopCount} / {sub.shopLimit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    KSH {sub.pricePerPeriod.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(sub.subscriptionEndDate).toLocaleDateString()}
                    </div>
                    <div
                      className={`text-xs ${
                        sub.daysUntilExpiry < 7
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {sub.daysUntilExpiry} days left
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedSubscription(sub);
                          setShowPaymentModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Pay
                      </button>
                      {sub.status === "ACTIVE" || sub.status === "TRIAL" ? (
                        <button
                          onClick={() => handleSuspend(sub.id)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(sub.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedSubscription && (
        <PaymentModal
          subscription={selectedSubscription}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleRecordPayment}
        />
      )}

      {/* Toast Notification */}
      <Toast
        isOpen={toastState.isOpen}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
        message={toastState.message}
        type={toastState.type}
      />
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE: "bg-green-100 text-green-800",
    TRIAL: "bg-yellow-100 text-yellow-800",
    EXPIRED: "bg-red-100 text-red-800",
    SUSPENDED: "bg-orange-100 text-orange-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}
    >
      {status}
    </span>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ subscription, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: subscription.pricePerPeriod,
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(subscription.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Record Payment</h2>
        <p className="text-sm text-gray-600 mb-4">
          Business: {subscription.businessName}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KSH)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) =>
                setFormData({ ...formData, paymentDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Payment method, reference, etc.)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="e.g., M-Pesa QXY123456, Cash payment, etc."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Record Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionsManagement;
