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
  const [searchTerm, setSearchTerm] = useState("");
  const [shops, setShops] = useState([]); // All shops
  const [selectedShopId, setSelectedShopId] = useState(""); // For Business Owner shop selection

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
  const [submitting, setSubmitting] = useState(false);
  const [viewTransfer, setViewTransfer] = useState(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    // Load shops for Business Owner
    if (user?.role === "BUSINESS_OWNER") {
      loadShops();
    } else {
      // For Shop Manager/Sales Rep, set their shop automatically
      const shopId = user?.shopId || user?.shop?.id;
      if (shopId) setSelectedShopId(shopId);
    }
  }, [user]);

  useEffect(() => {
    if (selectedShopId) {
      fetchTransfers();
    }
  }, [activeTab, selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data);
      // Auto-select first shop for Business Owner
      if (data.length > 0 && !selectedShopId) {
        setSelectedShopId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setToast({
        isOpen: true,
        message: "Failed to load shops",
        type: "error",
      });
    }
  };

  const fetchTransfers = async () => {
    if (!selectedShopId) return;

    setLoading(true);
    try {
      let data = [];
      if (activeTab === "incoming") {
        data = await stockTransferService.getIncomingTransfers(selectedShopId);
      } else {
        data = await stockTransferService.getOutgoingTransfers(selectedShopId);
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
      if (!selectedShopId) {
        setToast({
          isOpen: true,
          message: "Please select a shop first",
          type: "warning",
        });
        return;
      }
      // Load shops and current shop's stock
      const [allShops, stocks] = await Promise.all([
        shopService.getAll(),
        stockService.getStocksByShop(selectedShopId),
      ]);
      setShops(allShops.filter((s) => s.id !== selectedShopId)); // Exclude current shop

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
      if (!selectedShopId) {
        setToast({
          isOpen: true,
          message: "Please select a shop first",
          type: "warning",
        });
        return;
      }

      if (submitting) return;
      setSubmitting(true);

      const payload = {
        sourceShopId: selectedShopId,
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      if (submitting) return;
      setSubmitting(true);
      await stockTransferService.acknowledgeTransfer(id);
      setToast({ isOpen: true, message: "Transfer accepted", type: "success" });
      fetchTransfers();
    } catch (err) {
      setToast({ isOpen: true, message: "Failed to accept", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoidTransfer = async (id) => {
    try {
      if (submitting) return;
      setSubmitting(true);
      await stockTransferService.cancelTransfer(id);
      setToast({
        isOpen: true,
        message: "Transfer voided",
        type: "success",
      });
      fetchTransfers();
    } catch (err) {
      setToast({
        isOpen: true,
        message: "Failed to void transfer",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
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
    { header: "Quantity", accessor: "quantity" },
    // For Business Owner/Manager, show both From and To shops
    // For Shop Manager, only show From shop (they know it's coming to their shop)
    ...(user?.role === "BUSINESS_OWNER" || user?.role === "BUSINESS_MANAGER"
      ? [
          { header: "From Shop", accessor: "sourceShopName" },
          { header: "To Shop", accessor: "destinationShopName" },
        ]
      : [{ header: "From Shop", accessor: "sourceShopName" }]),
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
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A",
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {activeTab === "incoming" && row.status === "PENDING" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAcknowledge(row.id)}
              className="text-green-600 hover:bg-green-50 font-medium px-3"
            >
              Accept
            </Button>
          )}
          {activeTab === "outgoing" && row.status === "PENDING" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-3"
              onClick={() => handleVoidTransfer(row.id)}
            >
              Void Transfer
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden bg-gray-50 p-2 md:p-4">
      <div className="flex flex-col gap-4 sm:gap-6 flex-1 min-h-0">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Stock Transfers</h1>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {user?.role === "BUSINESS_OWNER" && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
              >
                <option value="">Select Shop</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={openCreateModal}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Move Stock (Inter-Branch)
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex gap-4 border-b border-gray-200 px-4 pt-2">
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
            data={(transfers || []).filter(
              (t) =>
                t.productName
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                t.sourceShopName
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                t.destinationShopName
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase())
            )}
            loading={loading}
            emptyMessage={`No ${activeTab} transfers found`}
            showViewAction={false}
            searchable={false}
            onView={(row) => {
              setViewTransfer(row);
              setViewModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Transfer Details"
      >
        {viewTransfer && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Transaction ID</p>
                <p className="font-medium">{viewTransfer.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">
                  {viewTransfer.createdAt
                    ? new Date(viewTransfer.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">From Shop</p>
                <p className="font-medium">{viewTransfer.sourceShopName}</p>
              </div>
              <div>
                <p className="text-gray-500">To Shop</p>
                <p className="font-medium">
                  {viewTransfer.destinationShopName}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Product</p>
                <p className="font-medium text-blue-600">
                  {viewTransfer.productName}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Quantity</p>
                <p className="font-bold">{viewTransfer.quantity}</p>
              </div>
            </div>

            {viewTransfer.notes && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Notes
                </p>
                <p className="text-gray-700">{viewTransfer.notes}</p>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  viewTransfer.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : viewTransfer.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {viewTransfer.status}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
            <Button onClick={handleCreateTransfer} disabled={submitting}>
              {submitting ? "Initiating..." : "Initiate Transfer"}
            </Button>
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
