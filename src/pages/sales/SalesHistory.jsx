import { useState, useEffect } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AuditLogModal from "../../components/ui/AuditLogModal";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import { saleService } from "../../services/saleService";
import { shopService } from "../../services/shopService";
import { paymentMethodService } from "../../services/paymentMethodService";
import { format } from "date-fns";

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [shops, setShops] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, COMPLETED, PENDING, CANCELLED

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    logs: [],
    loading: false,
    sale: null,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    saleId: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchShops();
    fetchSales();
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (selectedShopId) {
      fetchSalesByShop(selectedShopId);
    } else {
      fetchSales();
    }
  }, [selectedShopId]);

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data);
    } catch (error) {
      console.error("Failed to fetch shops", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const data = await paymentMethodService.getAll();
      setPaymentMethods(data?.filter((pm) => pm.isActive) || []);
    } catch (error) {
      console.error("Failed to fetch payment methods");
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await saleService.getSalesHistory();
      // Sort by date desc
      const sorted = data.sort(
        (a, b) => new Date(b.saleDate) - new Date(a.saleDate)
      );
      setSales(sorted);
    } catch (error) {
      console.error("Failed to fetch sales history", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesByShop = async (shopId) => {
    setLoading(true);
    try {
      const data = await saleService.getSalesByShop(shopId);
      const sorted = data.sort(
        (a, b) => new Date(b.saleDate) - new Date(a.saleDate)
      );
      setSales(sorted);
    } catch (error) {
      console.error("Failed to fetch shop sales", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoidSale = async (saleId) => {
    try {
      await saleService.cancelSale(saleId);
      // Refresh list
      if (selectedShopId) fetchSalesByShop(selectedShopId);
      else fetchSales();

      if (selectedSale && selectedSale.id === saleId) {
        setIsDetailsModalOpen(false);
      }
      setToast({
        isOpen: true,
        message: "Sale voided successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to void sale", error);
      setToast({
        isOpen: true,
        message: `Failed to void sale: ${error.message}`,
        type: "error",
      });
    }
  };

  const handlePayInvoice = (sale) => {
    setSelectedSale(sale);
    if (paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
    setPaymentAmount(
      sale.balance !== undefined && sale.balance !== null
        ? sale.balance
        : sale.total
    );
    setIsPayModalOpen(true);
  };

  const confirmPayment = async () => {
    if (!selectedPaymentMethod || !paymentAmount) return;
    setProcessingPayment(true);
    try {
      await saleService.addPayment(
        selectedSale.id,
        paymentAmount,
        selectedPaymentMethod
      );
      setToast({
        isOpen: true,
        message: "Payment processed successfully!",
        type: "success",
      });
      setIsPayModalOpen(false);
      // Refresh
      if (selectedShopId) fetchSalesByShop(selectedShopId);
      else fetchSales();
    } catch (error) {
      setToast({
        isOpen: true,
        message: "Failed to process payment",
        type: "error",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const openDetails = (sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const handleViewLogs = async (sale) => {
    setAuditModal({ isOpen: true, logs: [], loading: true, sale });
    try {
      const logs = await saleService.getLogs(sale.id);
      setAuditModal((prev) => ({ ...prev, logs, loading: false }));
    } catch (error) {
      console.error("Failed to fetch logs", error);
      setAuditModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const filteredSales = sales.filter((sale) => {
    // Text search
    const matchesSearch =
      sale.saleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.saleNote?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status Filter
    let matchesStatus = true;
    if (statusFilter !== "ALL") {
      matchesStatus = sale.status === statusFilter;
    }

    // Date filtering
    let dateMatch = true;
    if (startDate || endDate) {
      const saleDate = new Date(sale.saleDate);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (saleDate < start) dateMatch = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (saleDate > end) dateMatch = false;
      }
    }

    return dateMatch && matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: "Sale No",
      accessor: "saleNumber",
      triggerView: true,
      render: (row) => (
        <div>
          <button
            onClick={() => openDetails(row)}
            className="text-blue-600 hover:text-blue-800 hover:underline block"
          >
            {row.saleNumber}
          </button>
          {row.customerName && (
            <div className="text-xs text-gray-500">{row.customerName}</div>
          )}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: "saleDate",
      render: (row) => format(new Date(row.saleDate), "MMM dd, yyyy HH:mm"),
    },
    { header: "Shop", accessor: "shopName" },
    {
      header: "Items",
      render: (row) => (row.items ? row.items.length : 0),
    },
    {
      header: "Total",
      accessor: "total",
      render: (row) => `KSH ${(row.total || 0).toLocaleString()}`,
    },
    {
      header: "Status",
      render: (row) => {
        if (row.status === "CANCELLED")
          return (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
              VOIDED
            </span>
          );
        if (row.status === "PENDING")
          return (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
              PENDING
            </span>
          );
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
            COMPLETED
          </span>
        );
      },
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {row.status !== "CANCELLED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDialog({ isOpen: true, saleId: row.id });
              }}
              className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-medium px-3"
            >
              Void
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:justify-between lg:items-end">
        <div className="w-full lg:flex-1">
          <h1 className="text-2xl font-bold text-blue-600 mb-3">
            Sales & Invoices
          </h1>

          <div className="flex gap-2 mb-3">
            {["ALL", "COMPLETED", "PENDING", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status === "ALL"
                  ? "All"
                  : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="w-full lg:max-w-xs">
            <Input
              placeholder="Search Sale No, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop
            </label>
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Shops</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow w-full overflow-x-auto">
        <Table
          columns={columns}
          data={filteredSales}
          loading={loading}
          emptyMessage="No sales found."
          showViewAction={false}
          searchable={false}
          getRowClassName={(sale) =>
            sale.status === "CANCELLED"
              ? "opacity-60 bg-gray-50 line-through text-gray-500"
              : ""
          }
        />
      </div>

      {/* Sale Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={
          selectedSale?.status === "PENDING"
            ? "Invoice Details"
            : "Sale Receipt"
        }
      >
        {selectedSale && (
          <div className="space-y-6" id="printable-receipt">
            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedSale.businessName || "Business Name"}
              </h1>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                {selectedSale.shopName}
              </h2>
              <p className="text-sm text-gray-500 font-mono mb-1">
                {selectedSale.status === "PENDING" ? "Invoice #" : "Receipt #"}
                {selectedSale.saleNumber}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(selectedSale.saleDate), "MMM d, yyyy, h:mm a")}
              </p>

              {/* Customer Details in Receipt */}
              {selectedSale.customerName && (
                <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                  <p className="text-sm font-medium text-gray-800">Bill To:</p>
                  <p className="text-sm text-gray-600">
                    {selectedSale.customerName}
                  </p>
                  {selectedSale.customerPhone && (
                    <p className="text-xs text-gray-500">
                      {selectedSale.customerPhone}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Metadata Badges */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-lg print:bg-gray-50">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  Payment
                </span>
                <span className="font-medium text-gray-900">
                  {selectedSale.paymentMethod
                    ? selectedSale.paymentMethod.replace("_", " ")
                    : selectedSale.status === "PENDING"
                    ? "Unpaid"
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                  Status
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedSale.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : selectedSale.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  } print:border print:border-gray-300`}
                >
                  {selectedSale.status}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-1.5 text-left font-bold text-gray-700 w-1/2">
                      Product
                    </th>
                    <th className="py-1.5 text-center font-bold text-gray-700">
                      Qty
                    </th>
                    <th className="py-1.5 text-right font-bold text-gray-700">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-gray-100">
                  {selectedSale.items?.map((item, idx) => {
                    const hasDiscount =
                      item.discountAmount && item.discountAmount > 0;
                    const finalPrice =
                      item.finalPrice ||
                      item.unitPrice - (item.discountAmount || 0);
                    const itemTotal = finalPrice * item.quantity;

                    return (
                      <tr key={idx}>
                        <td className="py-1.5 pr-2">
                          <div className="font-medium text-gray-900">
                            {item.productName || item.serviceName}
                          </div>
                          <div className="text-gray-500 text-xs mt-0.5">
                            @ KSH {(finalPrice || 0).toLocaleString()}
                            {hasDiscount && (
                              <span className="text-gray-400 line-through ml-1">
                                {(item.unitPrice || 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 text-center align-top pt-2">
                          {item.quantity}
                        </td>
                        <td className="py-1.5 text-right align-top pt-2 font-medium text-gray-900">
                          KSH {(itemTotal || 0).toLocaleString()}
                          {hasDiscount && (
                            <div className="text-xs text-gray-500 line-through">
                              {(
                                (item.unitPrice || 0) * item.quantity
                              ).toLocaleString()}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="border-t-2 border-gray-900 pt-4 space-y-3">
              {(() => {
                const subtotal =
                  selectedSale.items?.reduce(
                    (sum, item) => sum + (item.unitPrice || 0) * item.quantity,
                    0
                  ) || 0;
                const totalDiscount =
                  selectedSale.items?.reduce(
                    (sum, item) =>
                      sum + (item.discountAmount || 0) * item.quantity,
                    0
                  ) || 0;

                return (
                  <>
                    {totalDiscount > 0 && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="text-gray-900">
                            KSH {(subtotal || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-600 font-medium">
                            Discount
                          </span>
                          <span className="text-green-600 font-medium">
                            - KSH {(totalDiscount || 0).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    {selectedSale.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 font-medium">
                          Sale Discount
                        </span>
                        <span className="text-green-600 font-medium">
                          - KSH{" "}
                          {(selectedSale.discountAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Grand Total
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        KSH {(selectedSale.total || 0).toLocaleString()}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Note Display */}
            {selectedSale.saleNote && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-4">
                <p className="text-xs font-bold text-yellow-800 uppercase">
                  Note
                </p>
                <p className="text-sm text-gray-700">{selectedSale.saleNote}</p>
              </div>
            )}

            {/* Thank You Footer */}
            <div className="text-center pt-6 pb-2">
              <p className="text-gray-400 text-sm font-medium italic">
                {selectedSale.status === "PENDING"
                  ? "Invoice due for payment."
                  : "Thank you for your business!"}
              </p>
            </div>

            {/* Actions - HIDDEN ON PRINT */}
            <div className="flex justify-between pt-6 border-t border-gray-100 print:hidden">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print{" "}
                {selectedSale.status === "PENDING" ? "Invoice" : "Receipt"}
              </Button>

              <div className="flex gap-2">
                {selectedSale.status === "PENDING" && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handlePayInvoice(selectedSale);
                    }}
                  >
                    Pay
                  </Button>
                )}
                {selectedSale.status !== "CANCELLED" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setConfirmDialog({
                        isOpen: true,
                        saleId: selectedSale.id,
                      })
                    }
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    Void Sale
                  </Button>
                )}
                <Button onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Pay Invoice Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Collect Payment"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Total Due</p>
              <p className="text-xl font-bold text-gray-800">
                KSH {(selectedSale?.total || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Balance</p>
              <p className="text-xl font-bold text-green-600">
                KSH{" "}
                {(
                  (selectedSale?.balance !== undefined &&
                  selectedSale?.balance !== null
                    ? selectedSale.balance
                    : selectedSale?.total) || 0
                ).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter amount"
              max={selectedSale?.balance || selectedSale?.total}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPaymentMethod(pm.id)}
                  className={`p-3 rounded-lg border text-sm font-medium transition ${
                    selectedPaymentMethod === pm.id
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {pm.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPayModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPayment}
              disabled={
                processingPayment || !selectedPaymentMethod || !paymentAmount
              }
              className="flex-[2] bg-green-600 hover:bg-green-700"
            >
              {processingPayment ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, saleId: null })}
        onConfirm={() => handleVoidSale(confirmDialog.saleId)}
        title="Void Sale"
        message="Are you sure you want to void this sale? This will mark it as cancelled but maintain the record for audit purposes."
        confirmText="Void"
        variant="warning"
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={auditModal.isOpen}
        onClose={() => setAuditModal({ ...auditModal, isOpen: false })}
        title={
          auditModal.sale
            ? `Sale History - ${auditModal.sale.saleNumber}`
            : "Sale History"
        }
        logs={auditModal.logs}
        loading={auditModal.loading}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default SalesHistory;
