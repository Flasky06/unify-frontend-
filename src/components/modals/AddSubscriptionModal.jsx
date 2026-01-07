import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { subscriptionService } from "../../services/subscriptionService";

export const AddSubscriptionModal = ({
  isOpen,
  onClose,
  onSuccess,
  businessId,
}) => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopLimit: 1,
    pricePerPeriod: 1500,
    billingPeriod: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "ACTIVE",
    notes: "Manual subscription grant",
  });

  useEffect(() => {
    fetchPlans();
    // Calculate initial end date
    calculateAndSetEndDate("MONTHLY", new Date().toISOString().split("T")[0]);
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await subscriptionService.getActivePlans();
      setPlans(data);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    }
  };

  const calculateEndDate = (period, startDate) => {
    const start = new Date(startDate);
    const end = new Date(start);

    switch (period) {
      case "MONTHLY":
        end.setMonth(end.getMonth() + 1);
        break;
      case "QUARTERLY":
        end.setMonth(end.getMonth() + 3);
        break;
      case "ANNUALLY":
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }

    return end.toISOString().split("T")[0];
  };

  const calculateAndSetEndDate = (period, startDate) => {
    const endDate = calculateEndDate(period, startDate);
    setFormData((prev) => ({ ...prev, endDate }));
  };

  const calculatePrice = (period, shops) => {
    const rates = {
      MONTHLY: 1500,
      QUARTERLY: 4000,
      ANNUALLY: 15000,
    };
    const rate = rates[period] || 0;
    return rate * (parseInt(shops) || 0);
  };

  const handleBillingPeriodChange = (e) => {
    const period = e.target.value;
    const endDate = calculateEndDate(period, formData.startDate);
    const newPrice = calculatePrice(period, formData.shopLimit);

    setFormData({
      ...formData,
      billingPeriod: period,
      endDate: endDate,
      pricePerPeriod: newPrice,
    });
  };

  const handleShopLimitChange = (e) => {
    const limit = e.target.value;
    const newPrice = calculatePrice(formData.billingPeriod, limit);
    setFormData({ ...formData, shopLimit: limit, pricePerPeriod: newPrice });
  };

  const handleStartDateChange = (e) => {
    const startDate = e.target.value;
    const endDate = calculateEndDate(formData.billingPeriod, startDate);
    setFormData({
      ...formData,
      startDate: startDate,
      endDate: endDate,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Use first available plan as reference (required by backend)
      const referencePlan = plans.length > 0 ? plans[0] : null;
      if (!referencePlan) {
        throw new Error(
          "No subscription plans available. Please create a plan first."
        );
      }

      const payload = {
        businessId: parseInt(businessId),
        planId: referencePlan.id, // Use reference plan
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
                Billing Period
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={formData.billingPeriod}
                onChange={handleBillingPeriodChange}
              >
                <option value="MONTHLY">Monthly (1 month)</option>
                <option value="QUARTERLY">Quarterly (3 months)</option>
                <option value="ANNUALLY">Yearly (12 months)</option>
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
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  value={formData.shopLimit}
                  onChange={handleShopLimitChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (KES)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  value={formData.pricePerPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerPeriod: e.target.value })
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  Set to 0 for complimentary
                </p>
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
                  onChange={handleStartDateChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-2 border"
                  value={formData.endDate}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-calculated based on period
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="e.g., Legacy business - complimentary 1-year subscription"
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
