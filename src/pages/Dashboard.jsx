import { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
import { shopService } from "../services/shopService";
import { productService } from "../services/productService";
import { stockService } from "../services/stockService";
import { saleService } from "../services/saleService";
import { Toast } from "../components/ui/ConfirmDialog";

const Dashboard = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isCartModalOpen, setCartModalOpen] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  // ... [fetch logic]

  const columns = [
    { header: "Product", accessor: "productName" },
    { header: "SKU", accessor: "sku" },
    {
      header: "Stock",
      accessor: "quantity",
      render: (row) => (
        <span
          className={`font-mono ${
            row.quantity < 10 ? "text-red-600 font-bold" : ""
          }`}
        >
          {row.quantity}
        </span>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (row) => `KSH ${row.price.toLocaleString()}`,
    },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={() => addToCart(row)}
          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition"
        >
          Add
        </button>
      ),
    },
  ];

  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // Fetch Shops and Products on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [shopsData, productsData] = await Promise.all([
          shopService.getAll(),
          productService.getAll(),
        ]);
        setShops(shopsData);
        setProducts(productsData);

        // Auto-select first shop if available
        if (shopsData.length > 0) {
          setSelectedShopId(shopsData[0].id);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    init();
  }, []);

  // Clear cart when shop changes
  useEffect(() => {
    setCart([]);
  }, [selectedShopId]);

  // Fetch Inventory when shop or products change
  useEffect(() => {
    if (selectedShopId) {
      fetchInventory(selectedShopId);
    }
  }, [selectedShopId, products]);

  const fetchInventory = async (shopId) => {
    setLoading(true);
    try {
      const stocks = await stockService.getStocksByShop(shopId);

      // Enrich stock with product details
      const enrichedStocks = stocks.map((stock) => {
        const product = products.find((p) => p.id === stock.productId);
        return {
          ...stock,
          productName: product?.name || "Unknown",
          price: product?.sellingPrice || 0,
          sku: product?.sku || "",
        };
      });
      setInventory(enrichedStocks);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (stockItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === stockItem.productId
      );
      if (existing) {
        // Check stock limit
        if (existing.quantity >= stockItem.quantity) {
          setToast({
            isOpen: true,
            message: "Cannot add more than available stock!",
            type: "warning",
          });
          return prev;
        }
        return prev.map((item) =>
          item.productId === stockItem.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: stockItem.productId,
          productName: stockItem.productName,
          price: stockItem.price,
          quantity: 1,
          maxStock: stockItem.quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (newQty > item.maxStock) {
            setToast({
              isOpen: true,
              message: `Only ${item.maxStock} units available`,
              type: "warning",
            });
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const processSale = async () => {
    if (!selectedShopId || cart.length === 0) return;
    setProcessing(true);
    try {
      const saleData = {
        shopId: parseInt(selectedShopId),
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod,
      };

      await saleService.createSale(saleData);
      await saleService.createSale(saleData);
      setToast({
        isOpen: true,
        message: "Sale processed successfully!",
        type: "success",
      });
      setCart([]);
      setCheckoutModalOpen(false);
      fetchInventory(selectedShopId); // Refresh stock
    } catch (err) {
      console.error(" Checkout failed", err);
      setToast({
        isOpen: true,
        message: err.message || "Failed to process sale",
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Deprecated: existing handleCheckout is now processSale or unnecessary
  // But wait, the button 'Checkout' calls handleCheckout in the original code?
  // No, in the HTML update I changed it to open modal.
  // So I can safely remove handleCheckout and replace it with this block.
  // Wait, I need to make sure I am replacing the exact block.

  // Function handleCheckout replacement logic is already in the ReplacementContent above.

  const filteredInventory = inventory.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Shop Inventory</h2>
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-72">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setCartModalOpen(true)}
            className="relative p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="font-semibold">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Full Width Table */}
      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table
            columns={columns}
            data={filteredInventory}
            loading={loading}
            emptyMessage="No stock available. Add items to stock to begin."
          />
        </div>
      </div>

      {/* Cart Modal */}
      <Modal
        isOpen={isCartModalOpen}
        onClose={() => setCartModalOpen(false)}
        title="Current Sale Cart"
      >
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-auto space-y-4 pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-2 text-sm font-medium">Item</th>
                    <th className="py-2 text-sm font-medium">Price</th>
                    <th className="py-2 text-sm font-medium">Qty</th>
                    <th className="py-2 text-sm font-medium text-right">
                      Total
                    </th>
                    <th className="py-2 text-sm font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <tr key={item.productId} className="group">
                      <td className="py-3 font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="py-3 text-gray-600">
                        {item.price.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center w-max bg-white border border-gray-200 rounded-lg">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600 font-bold border-r border-gray-200"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.maxStock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) {
                                updateCartQuantity(item.productId, val);
                              }
                            }}
                            className="w-12 text-center border-none focus:ring-0 p-1 text-sm font-medium remove-arrow"
                          />
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600 font-bold border-l border-gray-200"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium text-gray-600">
                Total Amount
              </span>
              <span className="text-3xl font-bold text-gray-900">
                KSH {calculateTotal().toLocaleString()}
              </span>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCartModalOpen(false)}
                className="flex-1"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => {
                  setCartModalOpen(false);
                  setCheckoutModalOpen(true);
                }}
                disabled={cart.length === 0}
                className="flex-[2] py-3 text-lg"
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="Finalize Sale"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-600 mb-1">Total to Pay</p>
            <p className="text-3xl font-bold text-blue-600">
              KSH {calculateTotal().toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items in Cart
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "CASH", label: "Cash", icon: "💵" },
                { id: "MPESA", label: "M-Pesa", icon: "📱" }, // Assuming Backend maps MOBILE_MONEY
                { id: "CARD", label: "Card", icon: "💳" },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() =>
                    setPaymentMethod(
                      method.id === "MPESA" ? "MOBILE_MONEY" : method.id
                    )
                  }
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${
                    paymentMethod === method.id ||
                    (paymentMethod === "MOBILE_MONEY" && method.id === "MPESA")
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium text-sm">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Placeholder for future customer details */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer (Optional)</label>
            <Input placeholder="Walk-in Customer" />
          </div> */}

          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCheckoutModalOpen(false);
                setCartModalOpen(true);
              }}
              className="flex-1"
            >
              Back to Cart
            </Button>
            <Button
              onClick={processSale}
              disabled={processing}
              className="flex-[2] py-3 text-lg bg-green-600 hover:bg-green-700"
            >
              {processing ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </Modal>

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

export default Dashboard;
