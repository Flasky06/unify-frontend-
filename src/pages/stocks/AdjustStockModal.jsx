import { useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

/**
 * Modal for Adjusting Stock (Add/Remove) with a reason.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onConfirm - (quantityChange, reason) => Promise
 * @param {object} stock - Stock object (for context)
 */
const AdjustStockModal = ({ isOpen, onClose, onConfirm, stock }) => {
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("ADD"); // ADD or REMOVE
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || !reason) return;

    setSubmitting(true);
    try {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty <= 0) {
        alert("Please enter a valid positive quantity");
        setSubmitting(false);
        return;
      }

      const change = type === "ADD" ? qty : -qty;
      await onConfirm(change, reason);
      handleClose();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuantity("");
    setReason("");
    setType("ADD");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={stock ? `Adjust Stock - ${stock.productName}` : "Adjust Stock"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {stock && (
          <div className="bg-gray-50 p-3 rounded-md mb-2">
            <span className="text-sm text-gray-500">Current Qty:</span>{" "}
            <span className="font-bold text-gray-800">{stock.quantity}</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-sm text-gray-500">Shop:</span>{" "}
            <span className="font-medium text-gray-800">{stock.shopName}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === "ADD"}
                onChange={() => setType("ADD")}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              Add Stock (+ Inward)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === "REMOVE"}
                onChange={() => setType("REMOVE")}
                className="mr-2 text-red-600 focus:ring-red-500"
              />
              Remove Stock (- Loss/Return)
            </label>
          </div>
        </div>

        <Input
          label="Quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 5"
          required
        />

        <Input
          label="Reason / Details"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. New Shipment, Damaged Goods, Found in Audit..."
          required
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className={
              type === "REMOVE" ? "bg-red-600 hover:bg-red-700 text-white" : ""
            }
          >
            {submitting
              ? "Confirming..."
              : type === "ADD"
              ? "Confirm Addition"
              : "Confirm Removal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdjustStockModal;
