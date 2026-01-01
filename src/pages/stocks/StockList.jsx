import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import AuditLogModal from "../../components/ui/AuditLogModal";
import AdjustStockModal from "./AdjustStockModal";
import { stockService } from "../../services/stockService";
import { productService } from "../../services/productService";
import { shopService } from "../../services/shopService";

const StockList = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // all, byShop
  const [selectedShopId, setSelectedShopId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
      setStocks(data);
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
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
        });
      } else {
        await stockService.createStock({
          shopId: parseInt(formData.shopId),
          productId: parseInt(formData.productId),
          quantity: parseInt(formData.quantity),
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

  const filteredStocks = stocks.filter((stock) => {
    const productName = getProductName(stock.productId).toLowerCase();
    const shopName = getShopName(stock.shopId).toLowerCase();
    const search = searchTerm.toLowerCase();
    return productName.includes(search) || shopName.includes(search);
  });

  const columns = [
    { header: "Product", accessor: "productName" },
    { header: "Shop", accessor: "shopName" },
    {
      header: "Quantity",
      render: (row) => (
        <span
          className={`font-semibold ${
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              row._stock && setAdjustModal({ isOpen: true, stock: row._stock })
            }
            className="text-purple-600 hover:bg-purple-50 font-medium px-3"
          >
            Adjust
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewLogs(row._stock)}
            className="text-gray-600 hover:bg-gray-100 font-medium px-3"
          >
            History
          </Button>
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

  const tableData = filteredStocks.map((stock) => ({
    id: stock.id,
    productName: getProductName(stock.productId),
    shopName: getShopName(stock.shopId),
    quantity: stock.quantity,
    _stock: stock, // Store full stock object for actions
  }));

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        <h1 className="text-2xl font-bold text-blue-600">Stock Management</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-1 sm:gap-4">
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Shop
              </label>
              <select
                value={selectedShopId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedShopId(value);
                  setViewMode(value ? "byShop" : "all");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Shops</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                placeholder="Search by product or shop name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={() => navigate("/stocks/add")}
            className="w-full sm:w-auto whitespace-nowrap"
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

        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={tableData}
            loading={loading}
            showViewAction={false}
          />
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
    </div>
  );
};

export default StockList;
