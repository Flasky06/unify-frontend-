import { useState } from "react";
import Button from "../../components/ui/Button";
import { subscriptionService } from "../../services/subscriptionService";
import Input from "../../components/ui/Input";

export const RecordPaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  subscriptionId,
  currentEndDate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "2000",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "MPESA",
    transactionReference: "",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await subscriptionService.recordPayment(subscriptionId, formData);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to record payment: " + (error.message || "Unknown error"));
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
            Record Subscription Payment
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Recording this payment will automatically extend the subscription
            period.
            {currentEndDate && (
              <span className="block mt-1">
                Current expiry: {new Date(currentEndDate).toLocaleDateString()}
              </span>
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Amount (KES)"
              type="number"
              name="amount"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Payment Date"
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleInputChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                required
              >
                <option value="MPESA">M-Pesa</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Input
              label="Transaction Reference"
              type="text"
              name="transactionReference"
              value={formData.transactionReference}
              onChange={handleInputChange}
              placeholder="e.g. QXJ12345 (M-Pesa Code)"
            />

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
                placeholder="Optional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Record Payment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
