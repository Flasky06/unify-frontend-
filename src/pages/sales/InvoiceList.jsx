import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { saleService } from "../../services/saleService";
import { Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";
import { shopService } from "../../services/shopService";
import { paymentMethodService } from "../../services/paymentMethodService";

export const InvoiceList = () => {
  const { user } = useAuthStore();
  const [sales, setSales] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    shopId: null,
  });

  useEffect(() => {
    fetchShops();
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data || []);
    } catch (err) {
      console.error("Failed to fetch shops", err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const data = await paymentMethodService.getAll();
      const activeMethods = (data || []).filter((pm) => pm.isActive);
      setPaymentMethods(activeMethods);
      if (activeMethods.length > 0) {
        setSelectedPaymentMethod(activeMethods[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch payment methods", err);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await saleService.getSales(filters);
      // Filter PENDING and PARTIALLY_PAID invoices (those with outstanding balance)
      const invoices = (data || []).filter(
        (sale) => sale.status === "PENDING" || sale.status === "PARTIALLY_PAID"
      );
      setSales(invoices);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
      setToast({
        isOpen: true,
        message: err.message || "Failed to fetch invoices",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = (sale) => {
    setSelectedSale(sale);
    // Balance should never be null, use it directly (falls back to total if undefined for safety)
    setPaymentAmount(sale.balance ?? sale.total);
    setPaymentModalOpen(true);
  };

  const confirmPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setToast({
        isOpen: true,
        message: "Please enter a valid payment amount",
        type: "error",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      setToast({
        isOpen: true,
        message: "Please select an account",
        type: "error",
      });
      return;
    }

    try {
      await saleService.addPayment(
        selectedSale.id,
        parseFloat(paymentAmount),
        selectedPaymentMethod
      );

      setToast({
        isOpen: true,
        message: "Payment recorded successfully",
        type: "success",
      });

      setPaymentModalOpen(false);
      setSelectedSale(null);
      setPaymentAmount("");
      fetchSales();
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to record payment",
        type: "error",
      });
    }
  };

  const columns = [
    {
      header: "Invoice #",
      accessor: "saleNumber",
      triggerView: true,
      render: (row) => (
        <div>
          <div className="font-medium">{row.saleNumber}</div>
          {row.customerName && (
            <div className="text-xs text-gray-500">{row.customerName}</div>
          )}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: "saleDate",
      render: (row) =>
        new Date(row.saleDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    { header: "Shop", accessor: "shopName" },
    {
      header: "Total",
      accessor: "total",
      render: (row) => `KSH ${(row.total || 0).toLocaleString()}`,
    },
    {
      header: "Paid",
      accessor: "paidAmount",
      render: (row) => `KSH ${(row.paidAmount || 0).toLocaleString()}`,
    },
    {
      header: "Balance",
      accessor: "balance",
      render: (row) => (
        <span className="font-semibold text-orange-600">
          KSH {(row.balance || row.total || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSale(row);
              setDetailsModalOpen(true);
            }}
            className="text-blue-600 hover:bg-blue-50 font-medium px-3"
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handlePayInvoice(row);
            }}
            className="text-green-600 hover:bg-green-50 font-medium px-3"
          >
            Pay
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop
              </label>
              <select
                value={filters.shopId || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    shopId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={sales}
            loading={loading}
            emptyMessage="No pending invoices found"
            showViewAction={false}
            searchable={false}
          />
        </div>
      </div>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedSale(null);
        }}
        title={`Invoice ${selectedSale?.saleNumber || ""}`}
      >
        {selectedSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(selectedSale.saleDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Shop</p>
                <p className="font-medium">{selectedSale.shopName}</p>
              </div>
              {selectedSale.customerName && (
                <>
                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p className="font-medium">{selectedSale.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">
                      {selectedSale.customerPhone || "-"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {selectedSale.saleNote && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">{selectedSale.saleNote}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="space-y-2">
                {selectedSale.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {item.productName || item.serviceName}
                      </p>
                      <p className="text-gray-500">
                        {item.quantity} × KSH{" "}
                        {(item.unitPrice || 0).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-medium">
                      KSH{" "}
                      {(
                        item.quantity *
                        (item.unitPrice - (item.discountAmount || 0))
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>KSH {(selectedSale.subTotal || 0).toLocaleString()}</span>
              </div>
              {selectedSale.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>
                    - KSH {selectedSale.discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>KSH {(selectedSale.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-blue-600">
                <span>Paid</span>
                <span>
                  KSH {(selectedSale.paidAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg text-orange-600">
                <span>Balance Due</span>
                <span>
                  KSH{" "}
                  {(
                    selectedSale.balance ||
                    selectedSale.total ||
                    0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedSale(null);
          setPaymentAmount("");
        }}
        title="Record Payment"
      >
        {selectedSale && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Balance Due</p>
              <p className="text-2xl font-bold text-blue-600">
                KSH{" "}
                {(
                  selectedSale.balance ||
                  selectedSale.total ||
                  0
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account To
              </label>
              <select
                value={selectedPaymentMethod || ""}
                onChange={(e) =>
                  setSelectedPaymentMethod(parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setPaymentModalOpen(false);
                  setSelectedSale(null);
                  setPaymentAmount("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={confirmPayment} className="flex-1">
                Record Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default InvoiceList;
