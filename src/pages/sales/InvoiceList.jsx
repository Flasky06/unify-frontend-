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
    startDate: "",
    endDate: "",
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
              className="print:p-8 print:max-w-[210mm] print:mx-auto"
            >
              {/* Invoice Header */}
              <div className="mb-8 print:mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 print:text-2xl">
                      {selectedSale.businessName || "Miale"}
                    </h1>
                    <p className="text-gray-600">{selectedSale.shopName}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-blue-600 mb-2 print:text-xl">
                      INVOICE
                    </h2>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Invoice #:</span>{" "}
                      {selectedSale.saleNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(selectedSale.saleDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                {selectedSale.customerName && (
                  <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:border print:border-gray-300">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Bill To:
                    </p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {selectedSale.customerName}
                    </p>
                    {selectedSale.customerPhone && (
                      <p className="text-sm text-gray-600">
                        {selectedSale.customerPhone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="py-3 text-left font-bold text-gray-700">
                        Description
                      </th>
                      <th className="py-3 text-center font-bold text-gray-700 w-24">
                        Quantity
                      </th>
                      <th className="py-3 text-right font-bold text-gray-700 w-32">
                        Unit Price
                      </th>
                      <th className="py-3 text-right font-bold text-gray-700 w-32">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSale.items?.map((item, idx) => {
                      const itemTotal =
                        item.quantity *
                        (item.unitPrice - (item.discountAmount || 0));
                      return (
                        <tr key={idx}>
                          <td className="py-3 text-gray-900">
                            {item.productName || item.serviceName}
                          </td>
                          <td className="py-3 text-center text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="py-3 text-right text-gray-700">
                            KSH {(item.unitPrice || 0).toLocaleString()}
                          </td>
                          <td className="py-3 text-right font-semibold text-gray-900">
                            KSH {itemTotal.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  {selectedSale.discountAmount > 0 && (
                    <>
                      <div className="flex justify-between py-2 text-gray-700">
                        <span>Subtotal:</span>
                        <span>
                          KSH {(selectedSale.subTotal || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 text-green-600">
                        <span>Discount:</span>
                        <span>
                          - KSH {selectedSale.discountAmount.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between py-3 text-lg font-bold text-gray-900 border-t-2 border-gray-900">
                    <span>Total:</span>
                    <span>KSH {selectedSale.total.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between py-2 text-blue-600 border-t border-gray-200">
                    <span>Amount Paid:</span>
                    <span>
                      KSH {(selectedSale.paidAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between py-3 text-xl font-bold text-orange-600 border-t-2 border-orange-200 bg-orange-50 px-3 rounded print:bg-transparent">
                    <span>Balance Due:</span>
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

              {/* Note */}
              {selectedSale.saleNote && (
                <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 print:bg-white print:border print:border-yellow-400">
                  <p className="font-semibold text-yellow-800 mb-1">Note:</p>
                  <p className="text-gray-700">{selectedSale.saleNote}</p>
                </div>
              )}

              {/* Payment Terms / Footer */}
              <div className="border-t-2 border-gray-200 pt-6 mt-8 print:mt-12">
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">
                      Payment Terms:
                    </p>
                    <p className="text-gray-600">
                      Payment is due upon receipt of this invoice.
                    </p>
                    <p className="text-gray-600">
                      Please reference the invoice number when making payment.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 mb-2">
                      Thank You For Your Business!
                    </p>
                    <p className="text-gray-600">
                      For any queries, please contact us.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - HIDDEN ON PRINT */}
            <div className="flex justify-between pt-6 border-t border-gray-100 print:hidden">
              <Button
                variant="outline"
                onClick={() => {
                  // Set document title for print filename
                  const originalTitle = document.title;
                  document.title = `Invoice-${selectedSale.saleNumber}`;
                  window.print();
                  // Restore original title after print dialog
                  setTimeout(() => {
                    document.title = originalTitle;
                  }, 100);
                }}
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
