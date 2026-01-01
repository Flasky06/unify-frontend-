import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
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
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    productId: "",
    type: "CUSTOMER_RETURN",
    quantity: "",
    reason: "",
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      fetchReturns();
      fetchProducts();
    }
  }, [selectedShop]);

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data);
      if (data.length > 0) setSelectedShop(data[0].id);
    } catch (error) {
      showToast("Failed to load shops", "error");
    }
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const data = await stockReturnService.getAll(selectedShop);
      setReturns(data);
    } catch (error) {
      showToast("Failed to load returns", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll(selectedShop); // Assuming productService supports getting by shop or all
      // If productService.getAll takes no args or different, we might need adjustments.
      // Assuming standard filtering or fetching all and filtering.
      // For now, let's assume fetching all products for the business and filtering by shop if needed,
      // or just all products if they are global to business.
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await stockReturnService.create({
        ...formData,
        shopId: selectedShop,
        quantity: parseInt(formData.quantity),
      });
      showToast("Return processed successfully", "success");
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
        error.response?.data?.message || "Failed to process return",
        "error"
      );
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredReturns = returns.filter(
    (item) =>
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Returns</h1>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          >
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Process Return
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <Table
          columns={[
            {
              header: "Date",
              accessor: "date",
              render: (item) => new Date(item.date).toLocaleDateString(),
            },
            {
              header: "Product",
              accessor: "productName",
              render: (item) => (
                <span className="font-medium text-gray-900">
                  {item.productName}
                </span>
              ),
            },
            {
              header: "Type",
              accessor: "type",
              render: (item) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.type === "CUSTOMER_RETURN"
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
          data={filteredReturns}
          loading={loading}
          emptyMessage="No returns found"
          showViewAction={false}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Process Stock Return"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              required
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
              className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Type
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="CUSTOMER_RETURN">Customer Return (Restock)</option>
              <option value="SUPPLIER_RETURN">
                Return to Supplier (Deduct)
              </option>
              <option value="DAMAGED">Damaged (Deduct)</option>
              <option value="EXPIRED">Expired (Deduct)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === "CUSTOMER_RETURN"
                ? "Use this when a customer returns an item. Stock will INCREASE."
                : "Use this for bad stock. Stock will DECREASE."}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
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
              className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
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
