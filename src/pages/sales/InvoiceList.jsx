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
  const [searchTerm, setSearchTerm] = useState("");

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
          <div className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
            {row.saleNumber}
          </div>
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
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                placeholder="Invoice # or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
            data={sales.filter(
              (sale) =>
                sale.saleNumber
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                sale.customerName
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase())
            )}
            loading={loading}
            emptyMessage="No pending invoices found"
            showViewAction={false}
            searchable={false}
            onView={(row) => {
              setSelectedSale(row);
              setDetailsModalOpen(true);
            }}
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
          <>
            <div
              id="printable-invoice"
              className="print:w-[80mm] print:mx-auto print:font-mono print:text-xs"
            >
              {/* Invoice Header */}
              <div className="text-center pb-4 border-b-2 border-dashed border-gray-300 mb-4 print:pb-2 print:mb-2">
                <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                  {selectedSale.businessName || "Miale"}
                </h1>
                <h2 className="text-sm font-semibold text-gray-700">
                  {selectedSale.shopName}
                  <div className="text-xs font-normal text-gray-500 mt-1">
                    Main Branch, Nairobi
                  </div>
                </h2>

                <div className="mt-3 flex flex-col gap-0.5 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Invoice #:</span>{" "}
                    {selectedSale.saleNumber}
                  </p>
                  <p>
                    {new Date(selectedSale.saleDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>

                {/* Customer Info */}
                {selectedSale.customerName && (
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200 text-left">
                    <p className="text-xs font-semibold text-gray-700 uppercase">
                      Bill To:
                    </p>
                    <p className="text-sm font-medium text-gray-900">
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

              {/* Items Table */}
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-gray-900">
                    <th className="py-1 text-left w-[55%]">Product</th>
                    <th className="py-1 text-center w-[15%]">Qty</th>
                    <th className="py-1 text-right w-[30%]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-gray-200">
                  {selectedSale.items?.map((item, idx) => {
                    const itemTotal =
                      item.quantity *
                      (item.unitPrice - (item.discountAmount || 0));
                    return (
                      <tr key={idx} className="print:leading-tight">
                        <td className="py-2 pr-1 align-top">
                          <div className="font-medium text-gray-900">
                            {item.productName || item.serviceName}
                          </div>
                          <div className="text-xs text-gray-500">
                            @ KSH {(item.unitPrice || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-2 text-center align-top font-medium">
                          {item.quantity}
                        </td>
                        <td className="py-2 text-right align-top font-bold text-gray-900">
                          {itemTotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="border-t-2 border-gray-900 pt-3 space-y-1 text-sm border-dashed">
                {selectedSale.discountAmount > 0 && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>
                        KSH {(selectedSale.subTotal || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600 print:font-bold">
                      <span>Discount</span>
                      <span>
                        - KSH {selectedSale.discountAmount.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center text-base font-bold text-gray-900 pt-2 border-t border-gray-300 mt-2">
                  <span className="uppercase">Total</span>
                  <span>KSH {selectedSale.total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-blue-600 pt-1">
                  <span>Paid</span>
                  <span>
                    KSH {(selectedSale.paidAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-base font-bold text-orange-600 pt-1 border-t border-gray-200 mt-1">
                  <span className="uppercase">Balance Due</span>
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

              {/* Note */}
              {selectedSale.saleNote && (
                <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <p className="font-semibold text-yellow-800">Note:</p>
                  <p className="text-gray-700">{selectedSale.saleNote}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-8 border-t-2 border-dashed border-gray-200 mt-6 print:mt-4 print:pt-4">
                <p className="font-bold text-gray-900 mb-1">Payment Due</p>
                <p className="text-xs text-gray-500">
                  Please settle this invoice at your earliest convenience.
                </p>
              </div>
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
                Print Invoice
              </Button>

              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handlePayInvoice(selectedSale);
                  }}
                >
                  Pay Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </>
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
