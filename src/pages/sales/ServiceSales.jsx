import { useState, useEffect } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import { saleService } from "../../services/saleService";
import { shopService } from "../../services/shopService";
import { format } from "date-fns";

const ServiceSales = () => {
  const [sales, setSales] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const getSaleType = (sale) => {
    if (!sale.items || sale.items.length === 0) return "unknown";

    const hasProducts = sale.items.some((item) => item.type === "PRODUCT");
    const hasServices = sale.items.some((item) => item.type === "SERVICE");

    if (hasProducts && hasServices) return "mixed";
    if (hasProducts) return "product";
    if (hasServices) return "service";
    return "unknown";
  };

  // Filter for service sales only
  const searchFilteredSales = sales.filter((sale) => {
    const search = searchTerm.toLowerCase();
    return (
      sale.saleNumber?.toLowerCase().includes(search) ||
      sale.shopName?.toLowerCase().includes(search) ||
      sale.paymentMethod?.toLowerCase().includes(search) ||
      sale.status?.toLowerCase().includes(search)
    );
  });

  const filteredSales = searchFilteredSales.filter((sale) => {
    const saleType = getSaleType(sale);
    return saleType === "service";
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
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.status === "COMPLETED"
              ? "bg-green-100 text-green-800"
              : row.status === "CANCELLED"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openDetails(row)}>
            View
          </Button>
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
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:justify-between lg:items-end">
        <div className="w-full lg:flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Service Sales
          </h1>
          <Input
            placeholder="Search by sale no, shop, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full lg:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Shop
          </label>
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={filteredSales}
          loading={loading}
          emptyMessage="No service sales found."
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
                    <th className="py-2 px-3">Service</th>
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

export default ServiceSales;
