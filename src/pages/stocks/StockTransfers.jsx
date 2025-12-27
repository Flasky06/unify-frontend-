import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { Toast } from "../../components/ui/ConfirmDialog";
import { stockTransferService } from "../../services/stockTransferService";
import { shopService } from "../../services/shopService";
import { stockService } from "../../services/stockService";
import useAuthStore from "../../store/authStore";

const StockTransfers = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("incoming"); // 'incoming' or 'outgoing'
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]); // For creating transfer (target shops)

  // Create Transfer State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [availableStock, setAvailableStock] = useState([]);
  const [formData, setFormData] = useState({
    targetShopId: "",
    productId: "",
    quantity: 1,
    notes: "",
  });

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchTransfers();
  }, [activeTab, user]);

  const fetchTransfers = async () => {
    if (!user.shopId && !user.shop?.id) return;
    const shopId = user.shopId || user.shop?.id;

    setLoading(true);
    try {
      let data = [];
      if (activeTab === "incoming") {
        data = await stockTransferService.getIncomingTransfers(shopId);
      } else {
        data = await stockTransferService.getOutgoingTransfers(shopId);
      }
      setTransfers(data);
    } catch (err) {
      console.error(err);
      setToast({
        isOpen: true,
        message: "Failed to load transfers",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitFetch = async () => {
    try {
      // Load shops and current shop's stock
      const shopId = user.shopId || user.shop?.id;
      const [allShops, stocks] = await Promise.all([
        shopService.getAll(),
        stockService.getStocksByShop(shopId),
      ]);
      setShops(allShops.filter((s) => s.id !== shopId)); // Exclude current shop

      // Enrich stocks with needed details if necessary, but stock object usually has productName
      setAvailableStock(stocks);
    } catch (err) {
      console.error(err);
      setToast({
        isOpen: true,
        message: "Failed to load form data",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    handleInitFetch();
    setCreateModalOpen(true);
  };

  const handleCreateTransfer = async () => {
    try {
      const payload = {
        sourceShopId: user.shopId || user.shop?.id,
        destinationShopId: parseInt(formData.targetShopId),
        productId: parseInt(formData.productId),
        quantity: parseInt(formData.quantity),
      };

      await stockTransferService.initiateTransfer(payload);
      setToast({
        isOpen: true,
        message: "Transfer initiated!",
        type: "success",
      });
      setCreateModalOpen(false);
      if (activeTab === "outgoing") fetchTransfers();
      else setActiveTab("outgoing");
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Transfer failed",
        type: "error",
      });
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await stockTransferService.acknowledgeTransfer(id);
      setToast({ isOpen: true, message: "Transfer accepted", type: "success" });
      fetchTransfers();
    } catch (err) {
      setToast({ isOpen: true, message: "Failed to accept", type: "error" });
    }
  };

  const handleCancel = async (id) => {
    try {
      await stockTransferService.cancelTransfer(id);
      setToast({
        isOpen: true,
        message: "Transfer cancelled",
        type: "success",
      });
      fetchTransfers();
    } catch (err) {
      setToast({ isOpen: true, message: "Failed to cancel", type: "error" });
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Product", accessor: "productName" },
    { header: "Quantity", accessor: "quantity" },
    {
      header: activeTab === "incoming" ? "From Shop" : "To Shop",
      render: (row) =>
        activeTab === "incoming" ? row.sourceShopName : row.targetShopName,
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            row.status === "COMPLETED"
              ? "bg-green-100 text-green-800"
              : row.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Date",
      render: (row) => new Date(row.transferDate).toLocaleDateString(),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {activeTab === "incoming" && row.status === "PENDING" && (
            <Button size="sm" onClick={() => handleAcknowledge(row.id)}>
              Accept
            </Button>
          )}
          {activeTab === "outgoing" && row.status === "PENDING" && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleCancel(row.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Stock Transfers</h1>
        <Button onClick={openCreateModal}>New Transfer</Button>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium border-b-2 transition ${
            activeTab === "incoming"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("incoming")}
        >
          Incoming
        </button>
        <button
          className={`py-2 px-4 font-medium border-b-2 transition ${
            activeTab === "outgoing"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("outgoing")}
        >
          Outgoing
        </button>
      </div>

      <Table
        columns={columns}
        data={transfers}
        loading={loading}
        emptyMessage={`No ${activeTab} transfers found`}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="New Stock Transfer"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Shop
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={formData.targetShopId}
              onChange={(e) =>
                setFormData({ ...formData, targetShopId: e.target.value })
              }
            >
              <option value="">Select Shop</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product (From Stock)
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
            >
              <option value="">Select Product</option>
              {availableStock.map((s) => (
                <option key={s.id} value={s.productId}>
                  {s.productName} (Qty: {s.quantity})
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
            min="1"
          />

          <Input
            label="Notes (Optional)"
            className="w-full border rounded-lg px-3 py-2"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTransfer}>Initiate Transfer</Button>
          </div>
        </div>
      </Modal>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default StockTransfers;
