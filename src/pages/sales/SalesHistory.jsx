import { useState, useEffect } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import { saleService } from "../../services/saleService";
import { shopService } from "../../services/shopService";
import { format } from "date-fns";

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
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

  const handleCancelSale = async (saleId) => {
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
        message: "Sale cancelled successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to cancel sale", error);
      setToast({
        isOpen: true,
        message: `Failed to cancel sale: ${error.message}`,
        type: "error",
      });
    }
  };

  const openDetails = (sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const filteredSales = sales.filter((sale) => {
    const search = searchTerm.toLowerCase();
    const searchMatch =
      sale.saleNumber?.toLowerCase().includes(search) ||
      sale.shopName?.toLowerCase().includes(search) ||
      sale.paymentMethod?.toLowerCase().includes(search);

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

    return searchMatch && dateMatch;
  });

  const columns = [
    { header: "Sale No", accessor: "saleNumber" },
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
      render: (row) => `KSH ${row.total.toLocaleString()}`,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <button
            onClick={() => openDetails(row)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          {row.status !== "CANCELLED" && (
            <button
              onClick={() => setConfirmDialog({ isOpen: true, saleId: row.id })}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Cancel
            </button>
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
            Sales History
          </h1>
          <Input
            placeholder="Search by sale no, shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
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
        />
      </div>

      {/* Sale Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={
          selectedSale
            ? `Sale Details - ${selectedSale.saleNumber}`
            : "Sale Details"
        }
      >
        {selectedSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">
                  {format(new Date(selectedSale.saleDate), "PPpp")}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Shop</p>
                <p className="font-medium">{selectedSale.shopName}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="font-medium">
                  {selectedSale.paymentMethod?.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p
                  className={`font-medium ${
                    selectedSale.status === "CANCELLED"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {selectedSale.status}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
              <table className="w-full text-sm text-left">
                <thead className="text-gray-500 bg-gray-50 border-b">
                  <tr>
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedSale.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">{item.productName}</td>
                      <td className="py-2 px-3 text-right">
                        {(item.unitPrice || 0).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-center">{item.quantity}</td>
                      <td className="py-2 px-3 text-right">
                        {(
                          (item.unitPrice || 0) * item.quantity
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t font-semibold bg-gray-50">
                  <tr>
                    <td colSpan="3" className="py-3 px-3 text-right">
                      Grand Total
                    </td>
                    <td className="py-3 px-3 text-right">
                      KSH {selectedSale.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end pt-4 gap-3">
              {selectedSale.status !== "CANCELLED" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirmDialog({ isOpen: true, saleId: selectedSale.id })
                  }
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel Sale
                </Button>
              )}
              <Button onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, saleId: null })}
        onConfirm={() => handleCancelSale(confirmDialog.saleId)}
        title="Cancel Sale"
        message="Are you sure you want to cancel this sale? This action cannot be undone."
        confirmText="Yes, Cancel Sale"
        variant="danger"
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
