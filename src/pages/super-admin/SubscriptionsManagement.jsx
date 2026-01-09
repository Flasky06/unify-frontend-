import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subscriptionService } from "../../services/subscriptionService";
import { Toast } from "../../components/ui/ConfirmDialog";
import { RecordPaymentModal } from "../../components/modals/RecordPaymentModal";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import Table from "../../components/ui/Table";
import Input from "../../components/ui/Input";

const SubscriptionsManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastState, setToastState] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToastState({ isOpen: true, message, type });
  };

  const navigate = useNavigate();

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

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: "Business",
      accessor: "businessName",
      render: (row) => (
        <div
          className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
          onClick={() => navigate(`/super-admin/business/${row.businessId}`)}
        >
          {row.businessName}
        </div>
      ),
    },
    {
      header: "Plan",
      accessor: "planName",
    },
    {
      header: "Billing",
      accessor: "billingPeriod",
    },
    {
      header: "Shops",
      render: (row) => (
        <span>
          {row.currentShopCount} / {row.shopLimit}
        </span>
      ),
    },
    {
      header: "Amount",
      render: (row) => `KSH ${(row.subscriptionPrice || 0).toLocaleString()}`,
    },
    {
      header: "Start Date",
      render: (row) =>
        new Date(row.subscriptionStartDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      header: "End Date",
      render: (row) =>
        new Date(row.subscriptionEndDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "ACTIVE" && (
            <button
              onClick={() => handleSuspend(row.id)}
              className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              Suspend
            </button>
          )}
          {row.status === "SUSPENDED" && (
            <button
              onClick={() => handleReactivate(row.id)}
              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Reactivate
            </button>
          )}
          <button
            onClick={() => {
              setSelectedSubscription(row);
              setShowPaymentModal(true);
            }}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Payment
          </button>
        </div>
      ),
    },
  ];

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
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Subscription Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage business subscriptions and payments
        </p>
      </div>

      {/* Stats Cards - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex gap-2 flex-wrap">
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
        <div className="md:ml-auto md:w-64">
          <Input
            placeholder="Search business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredSubscriptions}
          loading={isLoading}
          emptyMessage="No subscriptions found"
          searchable={false}
          showViewAction={false}
        />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedSubscription && (
        <RecordPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedSubscription(null);
          }}
          subscription={selectedSubscription}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Toast */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
      />
    </div>
  );
};

export default SubscriptionsManagement;
