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

  // Fetch Inventory when selected shop changes
  useEffect(() => {
    if (selectedShopId) {
      fetchInventory(selectedShopId);
      setCart([]); // Clear cart on shop switch for safety
    }
  }, [selectedShopId]);

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
          price: product?.price || 0,
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
          alert("Cannot add more than available stock!");
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
            alert(`Only ${item.maxStock} units available`);
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

  const handleCheckout = async () => {
    if (!selectedShopId || cart.length === 0) return;
    setProcessing(true);
    try {
      const saleData = {
        shopId: parseInt(selectedShopId),
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: "CASH",
      };

      await saleService.createSale(saleData);
      alert("Sale processed successfully!");
      setCart([]);
      fetchInventory(selectedShopId); // Refresh stock
    } catch (err) {
      console.error(" Checkout failed", err);
      alert(err.message || "Failed to process sale");
    } finally {
      setProcessing(false);
    }
  };

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
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {item.productName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      KSH {item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.productId, item.quantity - 1)
                        }
                        className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold border-r border-gray-200"
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
                        className="w-16 text-center border-none focus:ring-0 p-1 text-sm font-medium remove-arrow"
                      />
                      <button
                        onClick={() =>
                          updateCartQuantity(item.productId, item.quantity + 1)
                        }
                        className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold border-l border-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
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
                onClick={handleCheckout}
                disabled={cart.length === 0 || processing}
                className="flex-[2] py-3 text-lg"
              >
                {processing ? "Processing..." : "Complete Sale"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
