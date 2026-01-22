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
import { serviceItemService } from "../services/serviceItemService";
import { paymentMethodService } from "../services/paymentMethodService";
import Toast from "../components/ui/Toast";
import SEO from "../components/common/SEO";

const Dashboard = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [stock, setStock] = useState([]);
  const [services, setServices] = useState([]); // Services list
  const [paymentMethods, setPaymentMethods] = useState([]); // Payment methods
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'services'
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [saleDiscount, setSaleDiscount] = useState(0); // Global discount
  const [isCartModalOpen, setCartModalOpen] = useState(false);

  // Invoice / Customer Details State
  const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    note: "",
  });

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });



  const processSale = async (status = "COMPLETED") => {
    if (!selectedShopId || cart.length === 0) return;

    // For COMPLETED sales, payment method is required
    if (status === "COMPLETED" && !paymentMethod) {
      setToast({
        isOpen: true,
        message: "Please select an account",
        type: "error",
      });
      return;
    }

    setProcessing(true);
    try {
      const saleData = {
        shopId: parseInt(selectedShopId),
        items: cart.map((item) => ({
          productId: item.type === "SERVICE" ? null : item.productId,
          serviceId: item.type === "SERVICE" ? item.serviceId : null,
          quantity: item.quantity,
          unitPrice: item.price,
          discountAmount: item.discount || 0,
        })),
        paymentMethodId: status === "COMPLETED" ? paymentMethod : null,
        discountAmount: saleDiscount,
        status: status,
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        saleNote: customerDetails.note,
      };

      await saleService.createSale(saleData);

      setToast({
        isOpen: true,
        message:
          status === "PENDING"
            ? "Invoice saved successfully!"
            : "Sale processed successfully!",
        type: "success",
      });

      // Reset State
      setCart([]);
      setSaleDiscount(0);
      setCheckoutModalOpen(false);
      setInvoiceModalOpen(false);
      setCustomerDetails({ name: "", phone: "", note: "" });
    } catch (error) {
      console.error("Sale processing error:", error);
      setToast({
        isOpen: true,
        message: error.response?.data?.message || "Failed to process sale",
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  };



  const columns = [
    {
      header: "Product",
      accessor: "productName",
      triggerView: true,
      render: (row) => (
        <span className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
          {row.productName}
        </span>
      ),
    },
    {
      header: "Stock",
      accessor: "quantity",
      render: (row) => (
        <span
          className={`font-mono ${row.quantity < 10 ? "text-red-600" : ""}`}
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
          disabled={row.quantity < 1}
          className={`px-3 py-1 rounded text-sm font-medium transition ${row.quantity < 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
        >
          {row.quantity < 1 ? "Out of Stock" : "Add"}
        </button>
      ),
    },
  ];

  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Fetch Shops and Products on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [shopsData, productsData, paymentMethodsData] = await Promise.all(
          [
            shopService.getAll(),
            productService.getAll(),
            paymentMethodService.getAll(),
          ]
        );

        setShops(shopsData);
        setProducts(productsData);

        // Filter active payment methods and set default
        const activeMethods = (paymentMethodsData || []).filter(
          (pm) => pm.isActive
        );

        setPaymentMethods(activeMethods);
        if (activeMethods.length > 0) {
          setPaymentMethod(activeMethods[0].id);
        } else {
          console.warn("No active payment methods found!");
        }

        // Fetch services if businessId is available
        if (user?.businessId) {
          const servicesData = await serviceItemService.getAll();
          setServices(servicesData || []);
        }

        // Auto-select first shop if available
        if (shopsData.length > 0) {
          setSelectedShopId(shopsData[0].id);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    init();
  }, [user?.businessId]);

  // Clear cart when shop changes
  useEffect(() => {
    setCart([]);
    setSaleDiscount(0);
  }, [selectedShopId]);

  // Fetch Stock when shop or products change
  useEffect(() => {
    const fetchStock = async (shopId) => {
      setLoading(true);
      try {
        const stocks = await stockService.getStocksByShop(shopId);

        // Map ALL products to show availability, even if no stock record exists yet
        const productAvailability = products.map((product) => {
          const stockEntry = stocks.find((s) => s.productId === product.id);
          return {
            id: stockEntry?.id || `temp-${product.id}`,
            productId: product.id,
            productName: product.name,
            price: product.sellingPrice || 0,
            quantity: stockEntry?.quantity || 0,
          };
        });
        setStock(productAvailability);
      } catch (err) {
        console.error("Failed to fetch stock", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedShopId) {
      fetchStock(selectedShopId);
    }
  }, [selectedShopId, products]);

  const addToCart = (item, type = "PRODUCT") => {
    setCart((prev) => {
      const isService = type === "SERVICE";
      const existing = prev.find((cartItem) =>
        isService
          ? cartItem.serviceId === item.id
          : cartItem.productId === item.productId
      );

      if (existing) {
        // Check stock limit for products only
        if (!isService && existing.quantity >= item.quantity) {
          setToast({
            isOpen: true,
            message: "Cannot add more than available stock!",
            type: "warning",
          });
          return prev;
        }
        return prev.map((cartItem) =>
          (
            isService
              ? cartItem.serviceId === item.id
              : cartItem.productId === item.productId
          )
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      // Add new item
      if (isService) {
        return [
          ...prev,
          {
            serviceId: item.id,
            name: item.name,
            price: item.price,
            unit: item.unit,
            quantity: 1,
            discount: 0,
            type: "SERVICE",
          },
        ];
      } else {
        return [
          ...prev,
          {
            productId: item.productId,
            name: item.productName,
            price: item.price,
            quantity: 1,
            maxStock: item.quantity,
            discount: 0,
            type: "PRODUCT",
          },
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.type === "SERVICE") return item.serviceId !== id;
        return item.productId !== id;
      })
    );
  };

  const updateCartQuantity = (id, newQty, type) => {
    // If input is empty string, allow it (user deleting input)
    if (newQty === "" || newQty === undefined) {
      setCart((prev) =>
        prev.map((item) => {
          const isTarget =
            type === "SERVICE" ? item.serviceId === id : item.productId === id;
          return isTarget ? { ...item, quantity: "" } : item;
        })
      );
      return;
    }

    const qtyNum = parseFloat(newQty);
    if (isNaN(qtyNum)) return; // Don't update if invalid number (e.g. text)

    // Only check <= 0 for finished inputs (number type), but for typing, let's allow partials?
    // Actually, sticking to checking limits on the parsed number is safer.
    if (qtyNum <= 0) return;

    setCart((prev) =>
      prev.map((item) => {
        const isTarget =
          type === "SERVICE" ? item.serviceId === id : item.productId === id;

        if (isTarget) {
          if (type !== "SERVICE" && qtyNum > item.maxStock) {
            setToast({
              isOpen: true,
              message: `Only ${item.maxStock} units available`,
              type: "warning",
            });
            return item;
          }
          // Store exactly what was passed (newQty) to preserve typing "1."
          // But ensure we store number if it came from buttons
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const updateCartDiscount = (id, newDiscount, type) => {
    if (newDiscount < 0) return;
    setCart((prev) =>
      prev.map((item) => {
        const isTarget =
          type === "SERVICE" ? item.serviceId === id : item.productId === id;
        if (isTarget) {
          // Ensure discount doesn't exceed price
          if (newDiscount > item.price) {
            setToast({
              isOpen: true,
              message: "Discount cannot exceed item price",
              type: "warning",
            });
            return item;
          }
          return { ...item, discount: newDiscount };
        }
        return item;
      })
    );
  };



  const calculateSubTotal = () => {
    return cart.reduce(
      (sum, item) => sum + (item.price - (item.discount || 0)) * item.quantity,
      0
    );
  };

  const calculateFinalTotal = () => {
    const subTotal = calculateSubTotal();
    const final = subTotal - saleDiscount;
    return final > 0 ? final : 0;
  };

  // processSale is already defined above.

  // Deprecated: existing handleCheckout is now processSale or unnecessary
  // But wait, the button 'Checkout' calls handleCheckout in the original code?
  // No, in the HTML update I changed it to open modal.
  // So I can safely remove handleCheckout and replace it with this block.
  // Wait, I need to make sure I am replacing the exact block.

  // Function handleCheckout replacement logic is already in the ReplacementContent above.

  const filteredStock = stock.filter((item) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const serviceColumns = [
    {
      header: "Service",
      accessor: "name",
      triggerView: true,
      render: (row) => (
        <span className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
          {row.name}
        </span>
      ),
    },
    {
      header: "Category",
      accessor: "categoryName",
      render: (service) => service.categoryName || "-",
    },
    {
      header: "Price",
      accessor: "price",
      render: (service) => (
        <span>
          KSH {service.price.toLocaleString()}{" "}
          <span className="text-xs text-gray-500">{service.unit}</span>
        </span>
      ),
    },
    {
      header: "Action",
      render: (service) => (
        <button
          onClick={() => addToCart(service, "SERVICE")}
          className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium transition"
        >
          Add Service
        </button>
      ),
    },
  ];

  if (!user) return null;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <SEO
        title="Dashboard"
        description="Manage your business operations, sales, and inventory from the mflow pos dashboard."
        url="/dashboard"
      />
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex flex-col gap-3 w-full lg:flex-row lg:items-center lg:w-auto">
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="w-full lg:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 lg:min-w-[200px]"
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === "products"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
                }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === "services"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
                }`}
            >
              Services
            </button>
          </div>

          <div className="flex flex-col gap-3 w-full lg:flex-row lg:items-center lg:w-auto">
            <div className="w-full lg:w-72">
              <Input
                placeholder={
                  activeTab === "products"
                    ? "Search products..."
                    : "Search services..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setCartModalOpen(true)}
              className="relative p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
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
      </div>

      {/* Full Width Table */}
      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table
            columns={activeTab === "products" ? columns : serviceColumns}
            data={activeTab === "products" ? filteredStock : filteredServices}
            loading={loading}
            emptyMessage={
              activeTab === "products"
                ? "No products found"
                : "No services found"
            }
            showViewAction={false}
            searchable={false}
          />
        </div>
      </div>

      {/* Cart Modal */}
      <Modal
        isOpen={isCartModalOpen}
        onClose={() => setCartModalOpen(false)}
        title="Current Sale"
      >
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-auto space-y-4 pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p>No items added.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-1 text-base font-bold text-left w-1/3">
                      Item
                    </th>
                    <th className="py-1 text-base font-bold text-center hidden sm:table-cell">
                      Price
                    </th>
                    <th className="py-1 text-base font-bold text-center">
                      Discount
                    </th>
                    <th className="py-1 text-base font-bold text-center">
                      Qty
                    </th>
                    <th className="py-1 text-base font-bold text-right">
                      Total
                    </th>
                    <th className="py-1 text-base font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <tr
                      key={
                        item.type === "SERVICE"
                          ? `svc-${item.serviceId}`
                          : `prd-${item.productId}`
                      }
                      className="group"
                    >
                      <td className="py-1.5 font-medium text-gray-900">
                        {item.name || item.productName}
                        {item.type === "SERVICE" && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">
                            Service
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 text-center text-gray-600 hidden sm:table-cell">
                        {item.price.toLocaleString()}
                      </td>
                      <td className="py-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max={item.price}
                          value={item.discount || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              updateCartDiscount(
                                item.type === "SERVICE"
                                  ? item.serviceId
                                  : item.productId,
                                val,
                                item.type
                              );
                            } else if (e.target.value === "") {
                              updateCartDiscount(
                                item.type === "SERVICE"
                                  ? item.serviceId
                                  : item.productId,
                                0,
                                item.type
                              );
                            }
                          }}
                          placeholder="0"
                          className="w-20 sm:w-24 text-center border border-gray-300 rounded-lg p-2 text-base focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="py-1.5 justify-center flex">
                        <div className="flex items-center w-max bg-white border border-gray-200 rounded-lg">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.type === "SERVICE"
                                  ? item.serviceId
                                  : item.productId,
                                parseFloat(item.quantity) - 1,
                                item.type
                              )
                            }
                            className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold border-r border-gray-200 text-lg"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            max={item.type === "SERVICE" ? 9999 : item.maxStock}
                            value={item.quantity}
                            onChange={(e) => {
                              updateCartQuantity(
                                item.type === "SERVICE"
                                  ? item.serviceId
                                  : item.productId,
                                e.target.value,
                                item.type
                              );
                            }}
                            className="w-16 sm:w-20 text-center border-none focus:ring-0 p-2 text-base font-medium remove-arrow"
                          />
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.type === "SERVICE"
                                  ? item.serviceId
                                  : item.productId,
                                parseFloat(item.quantity) + 1,
                                item.type
                              )
                            }
                            className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold border-l border-gray-200 text-lg"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-1.5 text-right font-medium text-gray-900">
                        {(
                          (item.price - (item.discount || 0)) *
                          item.quantity
                        ).toLocaleString()}
                        {item.discount > 0 && (
                          <div className="text-xs text-green-600">
                            Discount:{" "}
                            {(item.discount * item.quantity).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 text-right">
                        <button
                          onClick={() =>
                            removeFromCart(
                              item.type === "SERVICE"
                                ? item.serviceId
                                : item.productId,
                              item.type
                            )
                          }
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
                KSH {calculateSubTotal().toLocaleString()}
              </span>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCartModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setCartModalOpen(false);
                  setCheckoutModalOpen(true);
                }}
                disabled={cart.length === 0}
                className="flex-[2] py-3 text-lg"
              >
                Process Sale
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
              KSH {calculateFinalTotal().toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </p>
          </div>

          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Subtotal: KSH {calculateSubTotal().toLocaleString()}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Discount
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0.00"
              value={saleDiscount > 0 ? saleDiscount : ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (isNaN(val)) setSaleDiscount(0);
                else setSaleDiscount(val);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account To
            </label>
            {paymentMethods.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-sm text-yellow-800">
                  No accounts available. Please add accounts in Settings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${paymentMethod === method.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                  >
                    <span className="font-medium text-sm text-center">
                      {method.name}
                    </span>
                    {method.type && (
                      <span className="text-xs text-gray-500">
                        {method.type}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
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
              className="px-4"
            >
              Back
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setCheckoutModalOpen(false);
                setInvoiceModalOpen(true);
              }}
              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Save as Invoice
            </Button>

            <Button
              onClick={() => processSale("COMPLETED")}
              disabled={processing}
              className="flex-[2] py-3 text-lg bg-green-600 hover:bg-green-700"
            >
              {processing ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Invoice Details"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name (Optional)
            </label>
            <Input
              placeholder="Enter customer name"
              value={customerDetails.name}
              onChange={(e) =>
                setCustomerDetails({ ...customerDetails, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <Input
              placeholder="Enter phone number"
              value={customerDetails.phone}
              onChange={(e) =>
                setCustomerDetails({
                  ...customerDetails,
                  phone: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (Optional)
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
              placeholder="Add a note (e.g., Project details)"
              value={customerDetails.note}
              onChange={(e) =>
                setCustomerDetails({ ...customerDetails, note: e.target.value })
              }
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setInvoiceModalOpen(false);
                setCheckoutModalOpen(true);
              }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => processSale("PENDING")}
              disabled={processing}
              className="flex-[2] bg-blue-600 hover:bg-blue-700"
            >
              {processing ? "Saving..." : "Save Invoice"}
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
