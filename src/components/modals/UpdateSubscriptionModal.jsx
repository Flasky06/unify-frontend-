import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { subscriptionService } from "../../services/subscriptionService";
import Input from "../../components/ui/Input";

export const UpdateSubscriptionModal = ({
  isOpen,
  onClose,
  onSuccess,
  subscription,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopLimit: 1,
    monthlyRate: 0,
    notes: "",
  });

  useEffect(() => {
    if (subscription) {
      setFormData({
        shopLimit: subscription.shopLimit,
        monthlyRate: subscription.monthlyRate,
        notes: subscription.notes || "",
      });
    }
  }, [subscription]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await subscriptionService.updateSubscription(subscription.id, formData);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert(
        "Failed to update subscription: " + (error.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Update Subscription Details
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Shop Limit"
              type="number"
              name="shopLimit"
              min="1"
              value={formData.shopLimit}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Monthly Rate (KES)"
              type="number"
              name="monthlyRate"
              min="0"
              step="0.01"
              value={formData.monthlyRate}
              onChange={handleInputChange}
              required
            />
            <p className="text-xs text-gray-500 -mt-3">
              This is the custom rate for this business.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Reason for update..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Update Subscription
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
