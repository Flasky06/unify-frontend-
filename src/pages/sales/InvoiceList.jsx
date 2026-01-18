import { useState, useEffect, useCallback } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { saleService } from "../../services/saleService";
import Toast from "../../components/ui/Toast";
import { shopService } from "../../services/shopService";
import { paymentMethodService } from "../../services/paymentMethodService";

export const InvoiceList = () => {
  const [sales, setSales] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod]
    = useState(null);
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

  // Fetch shops - wrapped in useCallback
  const fetchShops = useCallback(async () => {
    try {
      const data = await shopService.getAll();
      setShops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch shops", err);
      setShops([]);
    }
  }, []);

  // Fetch payment methods - wrapped in useCallback
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const data = await paymentMethodService.getAll();
      const activeMethods = Array.isArray(data)
        ? data.filter((pm) => pm?.isActive)
        : [];
      setPaymentMethods(activeMethods);
      if (activeMethods.length > 0 && !selectedPaymentMethod) {
        setSelectedPaymentMethod(activeMethods[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch payment methods", err);
      setPaymentMethods([]);
    }
  }, [selectedPaymentMethod]);

  // Fetch sales - wrapped in useCallback with proper dependencies
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const data = await saleService.getSales(filters);

      // Ensure data is array and filter safely
      const invoices = Array.isArray(data)
        ? data
          .filter(
            (sale) =>
              sale &&
              (sale.status === "PENDING" || sale.status === "PARTIALLY_PAID")
          )
          .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
        : [];

      setSales(invoices);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
      setSales([]);
      setToast({
        isOpen: true,
        message: err?.message || "Failed to fetch invoices",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial data fetch
  useEffect(() => {
    fetchShops();
    fetchPaymentMethods();
  }, [fetchShops, fetchPaymentMethods]);

  // Fetch sales when filters change
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handlePayInvoice = (sale) => {
    if (!sale) return;

    setSelectedSale(sale);
    const balance = sale.balance ?? sale.total ?? 0;
    setPaymentAmount(balance.toString());
    setPaymentModalOpen(true);
  };

  const confirmPayment = async () => {
    const amount = parseFloat(paymentAmount);

    if (!paymentAmount || isNaN(amount) || amount <= 0) {
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

    if (!selectedSale?.id) {
      setToast({
        isOpen: true,
        message: "Invalid sale selected",
        type: "error",
      });
      return;
    }

    try {
      await saleService.addPayment(
        selectedSale.id,
        amount,
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

      // Refresh sales list
      await fetchSales();
    } catch (err) {
      console.error("Payment error:", err);
      setToast({
        isOpen: true,
        message: err?.message || "Failed to record payment",
        type: "error",
      });
    }
  };

  const handlePrint = () => {
    if (!selectedSale) return;

    const originalTitle = document.title;
    document.title = `Invoice-${selectedSale.saleNumber}`;

    try {
      window.print();
    } catch (err) {
      console.error("Print error:", err);
    } finally {
      // Restore original title
      setTimeout(() => {
        document.title = originalTitle;
      }, 100);
    }
  };

  const columns = [
    {
      header: "Invoice #",
      accessor: "saleNumber",
      triggerView: true,
      render: (row) => (
        <div>
          <div className="font-medium text-blue-600">{row.saleNumber}</div>
          {row.customerName && (
            <div className="text-sm text-gray-500">{row.customerName}</div>
          )}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: "saleDate",
      render: (row) => {
        try {
          return new Date(row.saleDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        } catch {
          return "Invalid Date";
        }
      },
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
        <span className="font-semibold text-red-600">
          KSH {(row.balance || row.total || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  // Safe filter for search
  const filteredSales = sales.filter((sale) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const saleNumber = sale.saleNumber?.toLowerCase() || "";
    const customerName = sale.customerName?.toLowerCase() || "";

    return saleNumber.includes(searchLower) || customerName.includes(searchLower);
  });

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <Input
            type="text"
            placeholder="Invoice # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="w-full"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="w-full"
          />
        </div>

        <div className="col-span-2 md:col-span-1">
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={filteredSales}
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
            <div id="printable-invoice" className="print:p-8">
              {/* Invoice Header */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">
                  {selectedSale.businessName}
                </h1>
                <p className="text-gray-600">{selectedSale.shopName}</p>
              </div>

              <div className="flex justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                  <p className="text-gray-600">
                    Invoice #: <span className="font-semibold">{selectedSale.saleNumber}</span>
                  </p>
                  <p className="text-gray-600">
                    Date:{" "}
                    <span className="font-semibold">
                      {new Date(selectedSale.saleDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              {selectedSale.customerName && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
                  <p className="text-gray-800">{selectedSale.customerName}</p>
                  {selectedSale.customerPhone && (
                    <p className="text-gray-600">{selectedSale.customerPhone}</p>
                  )}
                </div>
              )}

              {/* Items Table */}
              <table className="w-full mb-8">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 font-semibold">Description</th>
                    <th className="text-right p-3 font-semibold">Quantity</th>
                    <th className="text-right p-3 font-semibold">Unit Price</th>
                    <th className="text-right p-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedSale.items || []).map((item, idx) => {
                    const quantity = item?.quantity || 0;
                    const unitPrice = item?.unitPrice || 0;
                    const discountAmount = item?.discountAmount || 0;
                    const itemTotal = quantity * (unitPrice - discountAmount);

                    return (
                      <tr key={idx} className="border-b">
                        <td className="p-3">{item?.productName || item?.serviceName || "Unknown Item"}</td>
                        <td className="text-right p-3">{quantity}</td>
                        <td className="text-right p-3">KSH {unitPrice.toLocaleString()}</td>
                        <td className="text-right p-3">KSH {itemTotal.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  {(selectedSale.discountAmount || 0) > 0 && (
                    <>
                      <div className="flex justify-between py-2">
                        <span>Subtotal:</span>
                        <span>KSH {(selectedSale.subTotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 text-red-600">
                        <span>Discount:</span>
                        <span>- KSH {(selectedSale.discountAmount || 0).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">KSH {(selectedSale.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Amount Paid:</span>
                    <span>KSH {(selectedSale.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t font-bold text-red-600">
                    <span>Balance Due:</span>
                    <span>
                      KSH {(selectedSale.balance || selectedSale.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {selectedSale.saleNote && (
                <div className="mb-8 p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2">Note:</h3>
                  <p className="text-gray-700">{selectedSale.saleNote}</p>
                </div>
              )}

              {/* Payment Terms */}
              <div className="text-center text-sm text-gray-600 border-t pt-4">
                <p className="font-semibold mb-2">Payment Terms:</p>
                <p>Payment is due upon receipt of this invoice.</p>
                <p>Please reference the invoice number when making payment.</p>
                <p className="mt-4 font-semibold">Thank You For Your Business!</p>
                <p>For any queries, please contact us.</p>
              </div>
            </div>

            {/* Actions - HIDDEN ON PRINT */}
            <div className="mt-6 flex gap-3 print:hidden">
              <Button onClick={handlePrint} className="gap-2">
                Print Invoice
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setDetailsModalOpen(false);
                  handlePayInvoice(selectedSale);
                }}
              >
                Record Payment
              </Button>
              <Button variant="secondary" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
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
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Balance Due</div>
              <div className="text-2xl font-bold text-blue-600">
                KSH {(selectedSale.balance || selectedSale.total || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount
              </label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account To
              </label>
              <select
                value={selectedPaymentMethod || ""}
                onChange={(e) => setSelectedPaymentMethod(parseInt(e.target.value))}
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
              <Button variant="primary" onClick={confirmPayment} className="flex-1">
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