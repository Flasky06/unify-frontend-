import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import { ConfirmDialog, Toast } from "../components/ui/ConfirmDialog";
import useAuthStore from "../store/authStore";
import { stockService } from "../services/stockService";
import { productService } from "../services/productService";
import { shopService } from "../services/shopService";

const StockList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stocks, setStocks] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // 'all', 'byShop', 'transfers'
  const [transferTab, setTransferTab] = useState("incoming"); // 'incoming', 'outgoing'
  const [selectedShopId, setSelectedShopId] = useState("");

  // Transfer Logic States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    sourceShopId: "",
    destinationShopId: "",
    productId: "",
    quantity: 0,
  });

  const [formData, setFormData] = useState({
    shopId: "",
    productId: "",
    quantity: 0,
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    stockId: null,
    action: "delete", // 'delete', 'cancelTransfer'
  });

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchShops();
    fetchStocks();

    // Set default shop for Shop Manager
    if (user?.role === "SHOP_MANAGER" && user?.shop) {
      setSelectedShopId(user.shop.id);
      // Also set source shop for transfer default
      setTransferData((prev) => ({ ...prev, sourceShopId: user.shop.id }));
    }
  }, []);

  // Fetch stocks based on view mode
  useEffect(() => {
    if (viewMode === "transfers") {
      fetchTransfers();
    } else {
      if (shops.length > 0) {
        fetchStocks();
      }
    }
  }, [viewMode, selectedShopId, shops.length, transferTab]);

  const fetchTransfers = async () => {
    // Need a selected shop context for transfers usually, or load all for owner?
    // For now, let's assume if Owner selects "All Shops", we might need to iterate.
    // Or we force selecting a shop to view transfers.
    // Let's force shop selection for Transfers view if not Shop Manager.

    const shopIdToUse = selectedShopId || (user.shop ? user.shop.id : null);
    if (!shopIdToUse) {
      if (user.role === "BUSINESS_OWNER" || user.role === "BUSINESS_MANAGER") {
        // Maybe alert or show empty if no shop selected
        // Better: Show transfers for ALL shops? Backend doesn't support "getAllTransfers" yet.
        // We'll require shop selection.
        return;
      }
      return;
    }

    setLoading(true);
    try {
      let data = [];
      if (transferTab === "incoming") {
        data = await stockService.getIncomingTransfers(shopIdToUse);
      } else {
        data = await stockService.getOutgoingTransfers(shopIdToUse);
      }
      setTransfers(data);
    } catch (err) {
      console.error("Failed to fetch transfers", err);
    } finally {
      setLoading(false);
    }
  };

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

  const resetForm = () => {
    setFormData({
      shopId: "",
      productId: "",
      quantity: 0,
      buyingPrice: "",
    });
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
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
          buyingPrice: formData.buyingPrice
            ? parseFloat(formData.buyingPrice)
            : null,
        });
      }
      setIsModalOpen(false);
      setEditingStock(null);
      resetForm();
      fetchStocks();
      setToast({
        isOpen: true,
        message: editingStock ? "Stock updated" : "Stock added",
        type: "success",
      });
    } catch (error) {
      setToast({ isOpen: true, message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await stockService.initiateTransfer({
        sourceShopId: parseInt(transferData.sourceShopId),
        destinationShopId: parseInt(transferData.destinationShopId),
        productId: parseInt(transferData.productId),
        quantity: parseInt(transferData.quantity),
      });
      setIsTransferModalOpen(false);
      setTransferData({
        sourceShopId: user.shop ? user.shop.id : "",
        destinationShopId: "",
        productId: "",
        quantity: 0,
      });

      setToast({
        isOpen: true,
        message: "Transfer Initiated",
        type: "success",
      });

      // Switch to transfers view if not already
      if (viewMode === "transfers" && transferTab === "outgoing") {
        fetchTransfers();
      } else {
        setViewMode("transfers");
        setTransferTab("outgoing");
      }
    } catch (err) {
      setToast({ isOpen: true, message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await stockService.acknowledgeTransfer(id);
      setToast({
        isOpen: true,
        message: "Transfer Acknowledged",
        type: "success",
      });
      fetchTransfers();
    } catch (err) {
      setToast({ isOpen: true, message: err.message, type: "error" });
    }
  };

  const handleCancelTransfer = async (id) => {
    try {
      await stockService.cancelTransfer(id);
      setToast({
        isOpen: true,
        message: "Transfer Cancelled",
        type: "success",
      });
      fetchTransfers();
    } catch (err) {
      setToast({ isOpen: true, message: err.message, type: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await stockService.deleteStock(id);
      setToast({ isOpen: true, message: "Stock deleted", type: "success" });
      setConfirmDialog({ isOpen: false, stockId: null });
      fetchStocks();
    } catch (err) {
      setToast({ isOpen: true, message: err.message, type: "error" });
    }
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
    ...(user?.role === "SALES_REP"
      ? []
      : [
          {
            header: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setEditingStock(row._stock);
                    setFormData({
                      shopId: row.shopId,
                      productId: row.productId,
                      quantity: row.quantity,
                    });
                    setIsModalOpen(true);
                  }}
                >
                  Update
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() =>
                    setConfirmDialog({
                      isOpen: true,
                      stockId: row.id,
                      action: "delete",
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]),
  ];

  const transferColumns = [
    { header: "Product", accessor: "productName" },
    { header: "From", accessor: "sourceShopName" },
    { header: "To", accessor: "destinationShopName" },
    { header: "Qty", accessor: "quantity" },
    {
      header: "Status",
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          {row.status}
        </span>
      ),
    },
    {
      header: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {transferTab === "incoming" && (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleAcknowledge(row.id)}
            >
              Receive
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleCancelTransfer(row.id)}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  const tableData =
    viewMode === "transfers"
      ? transfers
      : stocks.map((stock) => ({
          id: stock.id,
          productName: getProductName(stock.productId),
          shopName: getShopName(stock.shopId),
          quantity: stock.quantity,
          shopId: stock.shopId,
          productId: stock.productId,
          _stock: stock,
        }));

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={
              viewMode === "all" || viewMode === "byShop"
                ? "primary"
                : "outline"
            }
            onClick={() => setViewMode("all")}
          >
            Stock List
          </Button>
          <Button
            variant={viewMode === "transfers" ? "primary" : "outline"}
            onClick={() => setViewMode("transfers")}
          >
            Transfers
          </Button>
        </div>

        <div className="flex gap-2">
          {user?.role !== "SALES_REP" && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsTransferModalOpen(true)}
              >
                Initiate Transfer
              </Button>
              <Button variant="success" onClick={() => setIsModalOpen(true)}>
                Add Stock
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="w-full lg:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Shop
          </label>
          <select
            value={selectedShopId}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedShopId(value);
              if (viewMode !== "transfers") {
                setViewMode(value ? "byShop" : "all");
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">
              {user.role === "SHOP_MANAGER" ? user.shop?.name : "All Shops"}
            </option>
            {user.role !== "SHOP_MANAGER" &&
              shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {viewMode === "transfers" && (
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 font-medium ${
              transferTab === "incoming"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTransferTab("incoming")}
          >
            Incoming
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              transferTab === "outgoing"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTransferTab("outgoing")}
          >
            Outgoing
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={viewMode === "transfers" ? transferColumns : columns}
          data={tableData}
          loading={loading}
        />
        {viewMode === "transfers" && tableData.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            {!selectedShopId
              ? "Please select a shop to view transfers"
              : "No transfers found"}
          </div>
        )}
      </div>

      {/* Add/Edit Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStock(null);
          resetForm();
        }}
        title={editingStock ? "Update Stock" : "Add Stock"}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop
            </label>
            <select
              value={formData.shopId}
              onChange={(e) =>
                setFormData({ ...formData, shopId: e.target.value })
              }
              disabled={editingStock || user.role === "SHOP_MANAGER"}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
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
          {!editingStock && (
            <Input
              label="Buying Price (Cost Price) - Optional"
              type="number"
              placeholder="Update product cost price"
              value={formData.buyingPrice || ""}
              onChange={(e) =>
                setFormData({ ...formData, buyingPrice: e.target.value })
              }
              min="0"
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Initiate Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Initiate Stock Transfer"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Shop (From)
            </label>
            <select
              value={transferData.sourceShopId}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  sourceShopId: e.target.value,
                })
              }
              disabled={user.role === "SHOP_MANAGER"}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            >
              <option value="">Select Source Shop</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Shop (To)
            </label>
            <select
              value={transferData.destinationShopId}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  destinationShopId: e.target.value,
                })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Destination Shop</option>
              {shops
                .filter((s) => s.id !== parseInt(transferData.sourceShopId))
                .map((shop) => (
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
              value={transferData.productId}
              onChange={(e) =>
                setTransferData({ ...transferData, productId: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Quantity"
            type="number"
            value={transferData.quantity}
            onChange={(e) =>
              setTransferData({ ...transferData, quantity: e.target.value })
            }
            required
            min="1"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTransferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Transfer"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.action === "delete") {
            handleDelete(confirmDialog.stockId);
          }
        }}
        title="Delete Stock"
        message="Are you sure?"
        confirmText="Delete"
        variant="danger"
      />

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default StockList;
