import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { supplierService } from "../../services/supplierService";
import { productService } from "../../services/productService";
import { purchaseOrderService } from "../../services/purchaseOrderService";
import { paymentMethodService } from "../../services/paymentMethodService";
import Toast from "../../components/ui/Toast";
import { shopService } from "../../services/shopService";

export const PurchaseOrderCreate = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [formData, setFormData] = useState({
    supplierId: "",
    shopId: "",
    orderDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    notes: "",
    status: "PENDING", // PENDING or PAID
    paymentMethodId: "",
    paidAmount: "",
    received: false, // User must consciously check this
    items: [],
  });

  // Start with one empty item row
  const [items, setItems] = useState([
    {
      productId: "",
      itemName: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      notes: "",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, productsData, shopsData, methodsData] =
          await Promise.all([
            supplierService.getAll(),
            productService.getAll(), // Should ideally be paginated or optimized
            shopService.getAll(),
            paymentMethodService.getAll(),
          ]);
        setSuppliers(suppliersData || []);
        setProducts(productsData || []);

        // Handle potentially different shop API response structures
        if (Array.isArray(shopsData)) {
          setShops(shopsData);
        } else if (shopsData && Array.isArray(shopsData.content)) {
          setShops(shopsData.content);
        } else {
          setShops([]);
        }

        setPaymentMethods(methodsData || []);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === "productId") {
      const product = products.find(
        (p) => p.id.toString() === value.toString()
      );
      if (product) {
        item.productId = value;
        item.itemName = product.name;
        // Use cost price (buying price) as default unit price
        item.unitPrice = product.costPrice || 0;
      } else {
        item.productId = "";
        item.itemName = "";
        item.unitPrice = 0;
      }
    } else {
      item[field] = value;
    }

    // Recalculate total
    item.total = item.quantity * item.unitPrice;

    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        productId: "",
        itemName: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        notes: "",
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!formData.supplierId || !formData.shopId) {
      setToast({
        isOpen: true,
        message: "Please select a supplier and shop",
        type: "error",
      });
      return;
    }

    if (items.some((item) => !item.productId || item.quantity <= 0)) {
      setToast({
        isOpen: true,
        message: "Please remove invalid items rows",
        type: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        supplierId: parseInt(formData.supplierId),
        shopId: parseInt(formData.shopId),
        orderDate: formData.orderDate,
        deliveryDate: formData.deliveryDate || null,
        notes: formData.notes,
        items: items.map((item) => ({
          productId: parseInt(item.productId),
          itemName: item.itemName,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          notes: item.notes,
        })),
        // Immediate payment fields
        status: formData.status,
        paymentMethodId:
          formData.status === "PAID"
            ? parseInt(formData.paymentMethodId)
            : null,
        paidAmount: formData.status === "PAID" ? calculateGrandTotal() : null,
        received: formData.received,
      };

      await purchaseOrderService.create(payload);

      setToast({
        isOpen: true,
        message: "Purchase Order created successfully!",
        type: "success",
      });

      // Navigate back after short delay
      setTimeout(() => {
        navigate("/purchase-orders");
      }, 1500);
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to create order",
        type: "error",
      });
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-0 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 p-2 md:p-0">
        <h1 className="text-2xl font-bold text-gray-900">Record Purchase</h1>
        <Button variant="outline" onClick={() => navigate("/purchase-orders")}>
          Cancel
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-none md:rounded-lg shadow-none md:shadow-md p-2 md:p-6 space-y-6"
      >
        {/* Simplified Header Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
              value={formData.supplierId}
              onChange={(e) =>
                setFormData({ ...formData, supplierId: e.target.value })
              }
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Select "General Vendor" for ad-hoc purchases.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Shop
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
              value={formData.shopId}
              onChange={(e) =>
                setFormData({ ...formData, shopId: e.target.value })
              }
              required
            >
              <option value="">Select Shop</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Notes Toggle */}
        <div className="text-sm">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            onClick={() => {
              const el = document.getElementById("advanced-options");
              if (el) el.classList.toggle("hidden");
            }}
          >
            <span>Show Specific Dates & Notes</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="advanced-options"
            className="hidden mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg"
          >
            <div>
              <Input
                label="Date"
                type="date"
                value={formData.orderDate}
                onChange={(e) =>
                  setFormData({ ...formData, orderDate: e.target.value })
                }
                required
              />
            </div>

            {/* Show Due Date if Credit (Pending) */}
            {formData.status === "PENDING" && (
              <div>
                <Input
                  label="Payment Due Date"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDate: e.target.value })
                  }
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                rows="2"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              ></textarea>
            </div>
          </div>
        </div>

        {/* Payment & Receipt - Simplified Flow */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
          {/* 1. Payment Status */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-600 rounded"
                checked={formData.status === "PAID"}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    status: e.target.checked ? "PAID" : "PENDING",
                    // If unchecking paid, clear method
                    paymentMethodId: e.target.checked
                      ? formData.paymentMethodId
                      : "",
                  });
                }}
              />
              I have already paid (Cash Purchase)
            </label>
          </div>

          {/* Payment Method Dropdown (Only if Paid) */}
          {formData.status === "PAID" && (
            <div className="ml-7 animate-fadeIn">
              <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                Account from *
              </label>
              <select
                className="w-full md:w-1/2 px-3 py-2 border border-blue-300 rounded-lg bg-white"
                value={formData.paymentMethodId}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethodId: e.target.value })
                }
                required={formData.status === "PAID"}
              >
                <option value="">Select Payment Method...</option>
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-800">Items</h3>
            <div className="w-64">
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-1 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-1 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20 md:w-24">
                    Qty
                  </th>
                  <th className="px-1 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32 md:w-32">
                    Unit Price
                  </th>
                  <th className="hidden md:table-cell px-1 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">
                    Total
                  </th>
                  <th className="w-8 md:w-10"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => {
                  const filteredProducts = products.filter((p) =>
                    p.name?.toLowerCase().includes(productSearch.toLowerCase())
                  );

                  return (
                    <tr key={index}>
                      <td className="px-1 md:px-3 py-2">
                        <select
                          className="w-full text-sm border border-gray-400 rounded focus:ring-blue-500 p-1"
                          value={item.productId}
                          onChange={(e) =>
                            handleItemChange(index, "productId", e.target.value)
                          }
                          required
                        >
                          <option value="">Select...</option>
                          {filteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-1 md:px-3 py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          className="h-8 text-sm w-full p-1 border-gray-300"
                        />
                      </td>
                      <td className="px-1 md:px-3 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, "unitPrice", e.target.value)
                          }
                          className="h-8 text-sm w-full p-1 border-gray-300"
                        />
                        {/* Mobile-only total display under price */}
                        <div className="md:hidden text-xs text-gray-500 mt-1 font-medium">
                          {item.total.toLocaleString()}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-1 md:px-3 py-2 text-right font-medium text-gray-700">
                        {item.total.toLocaleString()}
                      </td>
                      <td className="px-1 md:px-3 py-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                          >
                            &times;
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="px-3 py-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItemRow}
                    >
                      + Add Item
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex justify-end border-t pt-4">
          <div className="text-right">
            <span className="text-gray-600 block text-sm">Grand Total</span>
            <span className="text-2xl font-bold text-gray-900">
              KES {calculateGrandTotal().toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate("/purchase-orders")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Record"}
          </Button>
        </div>
      </form>

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};
