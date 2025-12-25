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
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Left: Inventory Section */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800">Shop Inventory</h2>
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-64">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid/Table */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading inventory...
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No stock available in this shop. Add stock to start selling.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all bg-white group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
                      {item.productName}
                    </h3>
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2 truncate">
                    SKU: {item.sku || "N/A"}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-green-600">
                      KSH {item.price.toLocaleString()}
                    </span>
                    <button className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Add +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart Section */}
      <div className="w-96 flex flex-col bg-white rounded-lg shadow overflow-hidden border-l border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Current Sale</h2>
          <p className="text-sm text-gray-500">
            {cart.reduce((a, b) => a + b.quantity, 0)} items
          </p>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center">
              <svg
                className="w-12 h-12 mb-2 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p>Cart is empty</p>
              <p className="text-xs">Select items from the left to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-center border-b border-gray-100 pb-3"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="font-medium text-gray-900 truncate">
                    {item.productName}
                  </h4>
                  <div className="text-xs text-gray-500">
                    KSH {item.price.toLocaleString()} x {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateCartQuantity(item.productId, item.quantity - 1)
                    }
                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateCartQuantity(item.productId, item.quantity + 1)
                    }
                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="ml-2 text-red-400 hover:text-red-600"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">
              KSH {calculateTotal().toLocaleString()}
            </span>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="w-full py-3 text-lg"
          >
            {processing ? "Processing..." : "Complete Sale"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
