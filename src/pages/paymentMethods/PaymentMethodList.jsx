import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { paymentMethodService } from "../../services/paymentMethodService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const PaymentMethodList = () => {
  const { user } = useAuthStore();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    isActive: true,
  });
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    methodId: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodService.getAll();
      setPaymentMethods(data || []);
    } catch (err) {
      console.error("Failed to fetch payment methods", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMethods = paymentMethods.filter((method) =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      // Sanitize data - convert empty strings to null for optional fields
      const sanitizedData = {
        name: formData.name.trim(),
        type: formData.type?.trim() || null,
        isActive: formData.isActive,
      };

      if (editingMethod) {
        await paymentMethodService.update(editingMethod.id, sanitizedData);
      } else {
        await paymentMethodService.create(sanitizedData);
      }
      fetchPaymentMethods();
      closeModal();
      setToast({
        isOpen: true,
        message: editingMethod
          ? "Payment method updated successfully"
          : "Payment method created successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Payment method operation error:", err);
      setError(err.message || "Operation failed");
      setToast({
        isOpen: true,
        message: err.message || "Operation failed",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await paymentMethodService.delete(id);
      fetchPaymentMethods();
      setToast({
        isOpen: true,
        message: "Payment method deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete payment method",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    setEditingMethod(null);
    setFormData({ name: "", type: "", isActive: true });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type || "",
      isActive: method.isActive,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
    setFormData({ name: "", type: "", isActive: true });
  };

  const columns = [
    { header: "Name", accessor: "name" },
    {
      header: "Type",
      accessor: "type",
      render: (method) => method.type || "-",
    },
    {
      header: "Status",
      render: (method) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            method.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {method.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    ...(user?.role === "SALES_REP"
      ? []
      : [
          {
            header: "Actions",
            render: (method) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(method);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({ isOpen: true, methodId: method.id });
                  }}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]),
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        <h1 className="text-2xl font-bold text-blue-600">Payment Types</h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search payment methods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {user?.role !== "SALES_REP" && (
            <Button
              onClick={openCreateModal}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Payment Method
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading payment methods...
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredMethods}
              emptyMessage="No payment methods found. Create one to get started."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingMethod ? "Edit Payment Method" : "Add New Payment Method"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Payment Method Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Cash, BUY GOODS 20647, Paybill Equity 0707051128"
            required
          />

          <Input
            label="Type (Optional)"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            placeholder="e.g., CASH, MOBILE_MONEY, CARD"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingMethod
                ? "Update Method"
                : "Create Method"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, methodId: null })}
        onConfirm={() => handleDelete(confirmDialog.methodId)}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? It will be marked as inactive and hidden from new sales."
        confirmText="Delete"
        variant="danger"
      />

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};
