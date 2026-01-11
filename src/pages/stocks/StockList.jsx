import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import AdjustStockModal from "./AdjustStockModal";
import { stockService } from "../../services/stockService";
import { productService } from "../../services/productService";
import { shopService } from "../../services/shopService";
import useAuthStore from "../../store/authStore";

const StockList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // all, byShop
  const [selectedShopId, setSelectedShopId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Audit Log State
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    logs: [],
    loading: false,
    stock: null,
  });
  // Adjust Stock State
  const [adjustModal, setAdjustModal] = useState({
    isOpen: false,
    stock: null,
  });

  const [formData, setFormData] = useState({
    shopId: "",
    productId: "",
    quantity: 0,
    reason: "Manual Update",
  });

  // ... (Effect hooks unchanged) ...

  // Handlers for New Features
  const handleViewLogs = async (stock) => {
    setAuditModal({ isOpen: true, logs: [], loading: true, stock });
    try {
      const logs = await stockService.getLogs(stock.id);
      setAuditModal((prev) => ({ ...prev, logs, loading: false }));
    } catch (error) {
      console.error("Failed to fetch logs", error);
      setAuditModal((prev) => ({ ...prev, loading: false })); // Keep open to show error or empty
    }
  };

  const handleAdjustStock = (stock) => {
    setAdjustModal({ isOpen: true, stock });
  };

  const confirmAdjustment = async (quantityChange, reason) => {
    if (!adjustModal.stock) return;
    try {
      await stockService.adjustStock(
        adjustModal.stock.id,
        quantityChange,
        reason
      );
      fetchStocks(); // Refresh list
    } catch (error) {
      throw error; // Let modal handle alert
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchShops();
    fetchStocks();
  }, []);

  // Fetch stocks based on view mode
  useEffect(() => {
    if (shops.length > 0) {
      fetchStocks();
    }
  }, [viewMode, selectedShopId, shops.length]);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      let data;
      if (viewMode === "byShop" && selectedShopId) {
        // Filter by specific shop
        data = await stockService.getStocksByShop(selectedShopId);
      } else {
        // Default: Show all stocks across all shops
        if (shops.length > 0) {
          const allStocks = await Promise.all(
            shops.map((shop) => stockService.getStocksByShop(shop.id))
          );
          data = allStocks.flat();
        } else {
          data = [];
        }
      }
      setStocks(data || []);
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
      setError(error.message || "Failed to fetch stocks");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (editingStock) {
        await stockService.updateStock(editingStock.id, {
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
        });
      } else {
        await stockService.createStock({
          shopId: parseInt(formData.shopId),
          productId: parseInt(formData.productId),
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
        });
      }
      setIsModalOpen(false);
      setEditingStock(null);
      resetForm();
      fetchStocks();
    } catch (error) {
      console.error("Failed to save stock:", error);
      alert(error.message || "Failed to save stock");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setFormData({
      shopId: stock.shopId,
      productId: stock.productId,
      quantity: stock.quantity,
      reason: "Manual Update",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this stock entry?")) return;
    if (loading) return;

    setLoading(true);
    try {
      await stockService.deleteStock(id);
      fetchStocks();
    } catch (error) {
      console.error("Failed to delete stock:", error);
      alert(error.message || "Failed to delete stock");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      shopId: "",
      productId: "",
      quantity: 0,
      reason: "Manual Update",
    });
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Unknown";
  };

  const getShopName = (shopId) => {
    const shop = shops.find((s) => s.id === shopId);
    return shop ? shop.name : "Unknown";
  };

  const columns = [
    {
      header: "Product",
      accessor: "productName",
      triggerView: true,
      render: (row) => (
        <span className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
          {row.productName}
        </span>
      ),
    },
    { header: "Shop", accessor: "shopName" },
    {
      header: "Quantity",
      render: (row) => (
        <span
          className={`${
            row.quantity < 10
              ? "text-red-600"
              : row.quantity < 50
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {row.quantity}
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
            onClick={() => handleEdit(row._stock)}
            className="text-blue-600 hover:bg-blue-50 font-medium px-3"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row._stock.id)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-3"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const tableData = stocks.map((stock) => {
    const product = products.find((p) => p.id === stock.productId);
    return {
      id: stock.id,
      productName: product ? product.name : "Unknown",
      brandName: product ? product.brandName : "N/A",
      categoryName: product ? product.categoryName : "N/A",
      shopName: getShopName(stock.shopId),
      quantity: stock.quantity,
      _stock: stock,
    };
  });

  const filteredStocks = tableData.filter(
    (stock) =>
      stock.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.shopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedShopName = selectedShopId
    ? shops.find((s) => s.id === parseInt(selectedShopId))?.name || "All Shops"
    : "All Shops";

  const [printModalOpen, setPrintModalOpen] = useState(false);

  const handlePrint = () => {
    setPrintModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="print:hidden flex flex-col h-full">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-1 sm:gap-3">
              <div className="w-full sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Shop
                </label>
                <select
                  value={selectedShopId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedShopId(value);
                    setViewMode(value ? "byShop" : "all");
                  }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Shops</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 w-full sm:max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="py-1.5"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="w-full sm:w-auto whitespace-nowrap py-1.5"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setEditingStock(null);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto whitespace-nowrap py-1.5"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Stock
              </Button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-lg shadow flex-1 flex flex-col min-h-0 overflow-hidden">
            <Table
              columns={columns}
              data={filteredStocks}
              loading={loading}
              showViewAction={false}
              searchable={false}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStock(null);
          resetForm();
        }}
        title={
          editingStock
            ? `Update Stock - ${getProductName(editingStock.productId)}`
            : "Add Stock"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop
            </label>
            <select
              value={formData.shopId}
              onChange={(e) =>
                setFormData({ ...formData, shopId: e.target.value })
              }
              disabled={editingStock}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Shop</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
              disabled={editingStock}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {editingStock && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Current Stock:</span>{" "}
                {editingStock.quantity} units
              </p>
            </div>
          )}

          <Input
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
            min="0"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Change
            </label>
            <select
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Manual Update">Manual Update (Generic)</option>
              <option value="Stock Correction">Stock Correction / Count</option>
              <option value="Damage/Expiry">Damage / Expiry</option>
              <option value="Return">Customer Return</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingStock(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingStock ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Print Stock List Modal */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Stock List"
      >
        <div
          id="printable-stock-list"
          className="print:p-8 print:max-w-[210mm] print:mx-auto print:bg-white print:min-h-[297mm]"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-gray-300 mb-4 print:pb-2 print:mb-2">
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              {user?.businessName || user?.business?.name || "Business"}
            </h1>
            <h2 className="text-lg font-semibold text-gray-700">
              {selectedShopName}
            </h2>
            <h3 className="text-sm font-semibold text-gray-600">Stock List</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stock Table */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-gray-900">
                <th className="py-1 text-left w-[40%]">Product</th>
                <th className="py-1 text-left w-[20%]">Category</th>
                <th className="py-1 text-left w-[20%]">Brand</th>
                <th className="py-1 text-right w-[20%]">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-gray-200">
              {filteredStocks.map((stock) => (
                <tr key={stock.id} className="print:leading-tight">
                  <td className="py-2 pr-1 align-top">
                    <div className="font-medium text-gray-900">
                      {stock.productName}
                    </div>
                  </td>
                  <td className="py-2 pr-1 align-top text-gray-700">
                    {stock.categoryName}
                  </td>
                  <td className="py-2 pr-1 align-top text-gray-700">
                    {stock.brandName}
                  </td>
                  <td className="py-2 text-right align-top font-medium">
                    {stock.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}

          {/* Footer */}
          <div className="text-center pt-6 border-t-2 border-dashed border-gray-200 mt-4 print:mt-2 print:pt-2">
            <p className="text-xs text-gray-500">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions - HIDDEN ON PRINT */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4 print:hidden">
          <Button variant="outline" onClick={() => setPrintModalOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              const originalTitle = document.title;
              document.title = "Stock_List";
              window.print();
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
            Print
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default StockList;
