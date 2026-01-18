import { useState, useEffect, useCallback } from "react";
import Input from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { stockReturnService } from "../../services/stockReturnService";
import { shopService } from "../../services/shopService";
import { productService } from "../../services/productService";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import Table from "../../components/ui/Table";

const StockReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    type: "CUSTOMER_RETURN",
    quantity: "",
    reason: "",
  });
  const [toast, setToast] = useState(null);

  const fetchShops = useCallback(async () => {
    try {
      const data = await shopService.getAll();
      setShops(data);
      if (data.length > 0) setSelectedShop(data[0].id);
    } catch {
      showToast("Failed to load shops", "error");
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stockReturnService.getAll(selectedShop);
      setReturns(data);
    } catch {
      showToast("Failed to load returns", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedShop]);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productService.getAll(selectedShop); // Assuming productService supports getting by shop or all
      // If productService.getAll takes no args or different, we might need adjustments.
      // Assuming standard filtering or fetching all and filtering.
      // For now, let's assume fetching all products for the business and filtering by shop if needed,
      // or just all products if they are global to business.
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  }, [selectedShop]);

  useEffect(() => {
    if (selectedShop) {
      fetchReturns();
      fetchProducts();
    }
  }, [selectedShop, fetchReturns, fetchProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await stockReturnService.create({
        ...formData,
        shopId: selectedShop,
        quantity: parseInt(formData.quantity),
      });
      showToast("Return logged successfully", "success");
      setIsModalOpen(false);
      fetchReturns();
      setFormData({
        productId: "",
        type: "CUSTOMER_RETURN",
        quantity: "",
        reason: "",
      });
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to log return",
        "error"
      );
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-2 -mt-2">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Toolbar: Filters & Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto flex-1 max-w-2xl">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Shop
            </label>
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Returns
            </label>
            <Input
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full lg:w-auto justify-end">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
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
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            Log Return
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          columns={[
            {
              header: "Date",
              accessor: "date",
              render: (item) => {
                try {
                  return item.date
                    ? new Date(item.date).toLocaleDateString()
                    : "-";
                } catch {
                  return "-";
                }
              },
            },
            {
              header: "Product",
              accessor: "productName",
              triggerView: true,
              render: (item) => (
                <span className="text-gray-900">{item.productName}</span>
              ),
            },
            {
              header: "Type",
              accessor: "type",
              render: (item) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === "CUSTOMER_RETURN"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  {item.type.replace("_", " ")}
                </span>
              ),
            },
            {
              header: "Quantity",
              accessor: "quantity",
            },
            {
              header: "Reason",
              accessor: "reason",
              truncate: true,
              maxWidth: "200px",
            },
            {
              header: "Handled By",
              accessor: "userName",
            },
          ]}
          data={(returns || [])
            .filter(
              (r) =>
                r.productName
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                r.type?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)}
          loading={loading}
          emptyMessage="No returns found"
          showViewAction={false}
          searchable={false}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Stock Return"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Product"
            required
            value={formData.productId}
            onChange={(e) =>
              setFormData({ ...formData, productId: e.target.value })
            }
            className="w-full"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <div>
            <Select
              label="Return Type"
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full"
            >
              <option value="CUSTOMER_RETURN">
                Return From Customer (Stock Increases)
              </option>
              <option value="SUPPLIER_RETURN">
                Return To Supplier (Stock Decreases)
              </option>
              <option value="DAMAGED">Damaged Stock (Stock Decreases)</option>
              <option value="EXPIRED">Expired Stock (Stock Decreases)</option>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Select the return type to automatically adjust stock levels.
            </p>
          </div>

          <div>
            <Input
              label="Quantity"
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              required
              rows="3"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Why is it being returned?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Confirm Return</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockReturnList;
