import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { purchaseOrderService } from "../../services/purchaseOrderService";
import { supplierService } from "../../services/supplierService";
import { paymentMethodService } from "../../services/paymentMethodService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";

export const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    order: null,
  });
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    order: null,
    amount: "",
    methodId: "",
    notes: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    orderId: null,
    action: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, suppliersData, methodsData] = await Promise.all([
        purchaseOrderService.getAll(),
        supplierService.getAll(),
        paymentMethodService.getAll(),
      ]);
      setOrders(ordersData || []);
      setSuppliers(suppliersData || []);
      setPaymentMethods(methodsData || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (submitting || !paymentModal.amount) return;

    setSubmitting(true);
    try {
      await purchaseOrderService.recordPayment(paymentModal.order.id, {
        amount: parseFloat(paymentModal.amount),
        paymentMethodId: paymentModal.methodId
          ? parseInt(paymentModal.methodId)
          : null,
        notes: paymentModal.notes,
      });
      fetchData();
      setPaymentModal({
        isOpen: false,
        order: null,
        amount: "",
        methodId: "",
        notes: "",
      });
      setToast({
        isOpen: true,
        message: "Payment recorded successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to record payment",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (id) => {
    try {
      await purchaseOrderService.cancel(id);
      fetchData();
      setToast({
        isOpen: true,
        message: "Purchase order cancelled successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to cancel order",
        type: "error",
      });
    }
  };

  const handleReceiveOrder = async (id) => {
    try {
      await purchaseOrderService.receive(id);
      fetchData();
      setToast({
        isOpen: true,
        message: "Purchase order received and stock updated successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to receive order",
        type: "error",
      });
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await purchaseOrderService.delete(id);
      fetchData();
      setToast({
        isOpen: true,
        message: "Purchase order deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete order",
        type: "error",
      });
    }
  };

  const openPaymentModal = (order) => {
    setPaymentModal({
      isOpen: true,
      order,
      amount: order.balance.toString(),
      methodId: paymentMethods.length > 0 ? paymentMethods[0].id : "",
      notes: "",
    });
  };

  const getStatusBadge = (order) => {
    const status = order.status;
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PARTIAL: "bg-blue-100 text-blue-800",
      PAID: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    if (order.received) {
      return (
        <div className="flex flex-col gap-1 items-start">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              styles[status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            Received
          </span>
        </div>
      );
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSupplier = selectedSupplier
      ? order.supplierId.toString() === selectedSupplier
      : true;
    const matchesStatus = selectedStatus
      ? order.status === selectedStatus
      : true;
    const matchesSearch = order.orderNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSupplier && matchesStatus && matchesSearch;
  });

  const columns = [
    { header: "Order #", accessor: "orderNumber", triggerView: true },
    { header: "Supplier", accessor: "supplierName" },
    {
      header: "Date",
      render: (order) =>
        order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "-",
    },
    {
      header: "Total",
      render: (order) => `KES ${(order.total || 0).toLocaleString()}`,
    },
    {
      header: "Paid",
      render: (order) => `KES ${(order.paidAmount || 0).toLocaleString()}`,
    },
    {
      header: "Balance",
      render: (order) => (
        <span
          className={
            order.balance > 0 ? "text-red-600 font-semibold" : "text-green-600"
          }
        >
          KES {(order.balance || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      render: (order) => getStatusBadge(order),
    },
    {
      header: "Actions",
      render: (order) => (
        <div className="flex gap-2">
          {order.status === "PENDING" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:bg-orange-50 font-medium px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDialog({
                    isOpen: true,
                    orderId: order.id,
                    action: "cancel",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 font-medium px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDialog({
                    isOpen: true,
                    orderId: order.id,
                    action: "delete",
                  });
                }}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-end">
          <div className="w-full lg:w-48">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full lg:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full lg:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <Button
            onClick={() => navigate("/purchase-orders/create")}
            className="w-full lg:w-auto whitespace-nowrap"
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
            New Purchase Order
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading purchase orders...
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredOrders}
              emptyMessage="No purchase orders found. Create one to get started."
              showViewAction={false}
              searchable={false}
              onView={(order) => setViewModal({ isOpen: true, order })}
            />
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={paymentModal.isOpen}
        onClose={() =>
          setPaymentModal({
            isOpen: false,
            order: null,
            amount: "",
            methodId: "",
            notes: "",
          })
        }
        title="Record Payment"
      >
        {paymentModal.order && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order:</span>
                <span className="font-semibold">
                  {paymentModal.order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Supplier:</span>
                <span className="font-semibold">
                  {paymentModal.order.supplierName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">
                  KES {paymentModal.order.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid:</span>
                <span className="font-semibold">
                  KES {paymentModal.order.paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-semibold">Balance:</span>
                <span className="font-bold text-red-600">
                  KES {paymentModal.order.balance.toLocaleString()}
                </span>
              </div>
            </div>

            <Input
              label="Payment Amount (KES)"
              type="number"
              step="0.01"
              value={paymentModal.amount}
              onChange={(e) =>
                setPaymentModal({ ...paymentModal, amount: e.target.value })
              }
              placeholder="0.00"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={paymentModal.methodId}
                onChange={(e) =>
                  setPaymentModal({ ...paymentModal, methodId: e.target.value })
                }
                required
              >
                <option value="">Select Method</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                value={paymentModal.notes}
                onChange={(e) =>
                  setPaymentModal({ ...paymentModal, notes: e.target.value })
                }
                placeholder="Add payment notes..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setPaymentModal({
                    isOpen: false,
                    order: null,
                    amount: "",
                    methodId: "",
                    notes: "",
                  })
                }
              >
                Cancel
              </Button>
              <Button onClick={handleRecordPayment} disabled={submitting}>
                {submitting ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, orderId: null, action: null })
        }
        onConfirm={() => {
          if (confirmDialog.action === "cancel") {
            handleCancelOrder(confirmDialog.orderId);
          } else if (confirmDialog.action === "delete") {
            handleDeleteOrder(confirmDialog.orderId);
          } else if (confirmDialog.action === "receive") {
            handleReceiveOrder(confirmDialog.orderId);
          }
          setConfirmDialog({ isOpen: false, orderId: null, action: null });
        }}
        title={
          confirmDialog.action === "cancel"
            ? "Cancel Purchase Order"
            : confirmDialog.action === "delete"
            ? "Delete Purchase Order"
            : "Receive Stock"
        }
        message={
          confirmDialog.action === "cancel"
            ? "Are you sure you want to cancel this purchase order?"
            : confirmDialog.action === "delete"
            ? "Are you sure you want to delete this purchase order? This action cannot be undone."
            : "Are you sure you want to mark this order as received? This will automatically update your stock quantities."
        }
        confirmText={
          confirmDialog.action === "cancel"
            ? "Cancel Order"
            : confirmDialog.action === "delete"
            ? "Delete"
            : "Receive Stock"
        }
        variant="danger"
      />

      {/* View Details Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, order: null })}
        title="Purchase Order Details"
        size="lg"
      >
        {viewModal.order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {viewModal.order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {viewModal.order.supplierName}
                  </p>
                </div>
                {getStatusBadge(viewModal.order)}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <span className="text-xs text-gray-500">Order Date</span>
                  <p className="font-medium">
                    {viewModal.order.orderDate
                      ? new Date(viewModal.order.orderDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                {viewModal.order.deliveryDate && (
                  <div>
                    <span className="text-xs text-gray-500">Delivery Date</span>
                    <p className="font-medium">
                      {new Date(
                        viewModal.order.deliveryDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Item
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {viewModal.order.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.itemName || item.productName || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          KES {(item.unitPrice || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          KES {(item.total || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">
                  KES {(viewModal.order.total || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-semibold text-green-600">
                  KES {(viewModal.order.paidAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-900 font-semibold">Balance:</span>
                <span
                  className={`font-bold ${
                    viewModal.order.balance > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  KES {(viewModal.order.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Notes */}
            {viewModal.order.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {viewModal.order.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setViewModal({ isOpen: false, order: null })}
              >
                Close
              </Button>
              {viewModal.order.balance > 0 &&
                viewModal.order.status !== "CANCELLED" && (
                  <Button
                    onClick={() => {
                      openPaymentModal(viewModal.order);
                      setViewModal({ isOpen: false, order: null });
                    }}
                  >
                    Record Payment
                  </Button>
                )}
            </div>
          </div>
        )}
      </Modal>

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
