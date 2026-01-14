import { useState, useEffect } from "react";
import { subscriptionService } from "../services/subscriptionService";
import { Card } from "../components/ui/Card";
import Table from "../components/ui/Table";

export const MySubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subData, paymentsData] = await Promise.all([
        subscriptionService.getMySubscription().catch(() => null),
        subscriptionService.getMyPayments().catch(() => []),
      ]);
      setSubscription(subData);
      setPayments(paymentsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "TRIAL":
        return "bg-blue-100 text-blue-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "SUSPENDED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading subscription details...
      </div>
    );

  if (!subscription) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <svg
              className="w-16 h-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-2">
            No Active Subscription
          </h3>
          <p className="text-red-700 mb-4 font-medium">
            Your business account is currently blocked from all operations.
          </p>
          <p className="text-red-600 text-sm">
            Please contact your system administrator to set up a subscription
            plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Subscription</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your plan and billing
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
            subscription.status
          )}`}
        >
          {subscription.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {subscription.planName}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {subscription.billingPeriod}
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
          </p>
          <p
            className={`text-sm mt-1 font-medium ${
              subscription.daysUntilExpiry < 7
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {subscription.daysUntilExpiry} days remaining
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Shop Usage</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">
              {subscription.currentShopCount}
            </p>
            <p className="text-sm text-gray-500">
              / {subscription.shopLimit} Shops
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div
              className={`h-1.5 rounded-full ${
                subscription.currentShopCount >= subscription.shopLimit
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min(
                  (subscription.currentShopCount / subscription.shopLimit) *
                    100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Rate</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            KES {subscription.pricePerPeriod?.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            per {subscription.billingPeriod?.toLowerCase()}
          </p>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Payment History
        </h2>
        <Table
          columns={[
            {
              header: "Date",
              render: (p) => new Date(p.paymentDate).toLocaleDateString(),
            },
            {
              header: "Amount",
              render: (p) => `KES ${p.amount.toLocaleString()}`,
            },
            {
              header: "Period Covered",
              render: (p) =>
                `${new Date(p.periodStart).toLocaleDateString()} - ${new Date(
                  p.periodEnd
                ).toLocaleDateString()}`,
            },
            { header: "Notes", accessor: "notes" },
          ]}
          data={payments}
          loading={false}
          emptyMessage="No payments recorded"
        />
      </div>
    </div>
  );
};
