import { useState, useEffect } from "react";
import { subscriptionService } from "../../services/subscriptionService";
import { Toast } from "../../components/ui/ConfirmDialog";
import { RecordPaymentModal } from "../../components/modals/RecordPaymentModal";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";

const SubscriptionsManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  const handlePaymentSuccess = () => {
    showToast("Payment recorded successfully!", "success");
    setShowPaymentModal(false);
    fetchData();
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
      <div className="bg-white rounded-lg shadow flex-1 h-full overflow-y-auto min-h-0">
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

      {/* Record Payment Modal */}
      {showPaymentModal && selectedSubscription && (
        <RecordPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          subscriptionId={selectedSubscription.id}
          currentEndDate={selectedSubscription.subscriptionEndDate}
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

export default SubscriptionsManagement;
