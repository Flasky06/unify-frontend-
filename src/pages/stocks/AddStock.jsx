import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import Input from "../../components/ui/Input";
import { stockService } from "../../services/stockService";
import { productService } from "../../services/productService";
import { shopService } from "../../services/shopService";

const AddStock = () => {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    shopId: "",
    quantity: 0,
  });

  useEffect(() => {
    console.log("AddStock component mounted");
    fetchProducts();
    fetchShops();
  }, []);

  const fetchProducts = async () => {
    console.log("Fetching products...");
    setLoading(true);
    try {
      const data = await productService.getAll();
      console.log("Products fetched:", data);
      console.log("Number of products:", data?.length);
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
      console.log("Loading complete");
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

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setFormData({ shopId: "", quantity: 0 });
    setIsModalOpen(true);
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shopId) {
      setError("Please select a shop");
      return;
    }

    if (formData.quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Creating stock:", {
        shopId: parseInt(formData.shopId),
        productId: selectedProduct.id,
        quantity: parseInt(formData.quantity),
      });

      await stockService.createStock({
        shopId: parseInt(formData.shopId),
        productId: selectedProduct.id,
        quantity: parseInt(formData.quantity),
      });

      const shopName = shops.find(
        (s) => s.id === parseInt(formData.shopId)
      )?.name;
      setSuccess(
        `Successfully added ${formData.quantity} units of "${selectedProduct.name}" to ${shopName}!`
      );

      console.log("Stock created successfully!");

      // Close modal and reset
      setIsModalOpen(false);
      setSelectedProduct(null);
      setFormData({ shopId: "", quantity: 0 });
    } catch (err) {
      console.error("Failed to add stock:", err);

      // Show error but close modal
      setError(
        err.message ||
          "Failed to add stock. This product may already exist in the selected shop."
      );
      setIsModalOpen(false);
      setSelectedProduct(null);
      setFormData({ shopId: "", quantity: 0 });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Product Name",
      accessor: "name",
      truncate: true,
      triggerView: true,
    },
    { header: "Category", accessor: "category" },
    { header: "Brand", accessor: "brand" },
    { header: "Price (KSH)", accessor: "price" },
    {
      header: "Actions",
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectProduct(row._product);
          }}
          className={
            selectedProduct?.id === row._product?.id
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "text-blue-600 hover:bg-blue-50 font-medium px-3"
          }
        >
          Select
        </Button>
      ),
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableData = filteredProducts.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.categoryName || "N/A",
    brand: product.brandName || "N/A",
    price: product.price?.toLocaleString() || "0",
    _product: product, // Store full product object for the button
  }));

  console.log("Table data:", tableData);
  console.log("Products state:", products);

  return (
    <div className="p-2 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search products to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              // Open product creation modal
              window.open("/products", "_blank");
            }}
            variant="outline"
          >
            + Create New Product
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            data={tableData}
            loading={loading}
            emptyMessage="No products found matching your search."
            showViewAction={false}
            searchable={false}
          />
        </div>
      </div>

      {/* Add Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
          setFormData({ shopId: "", quantity: 0 });
          setError(null);
        }}
        title={`Add Stock: ${selectedProduct?.name || ""}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedProduct && (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Product Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Name:</div>
                <div className="font-medium">{selectedProduct.name}</div>
                <div className="text-gray-600">Price:</div>
                <div className="font-medium">
                  KSH {selectedProduct.price?.toLocaleString()}
                </div>
                <div className="text-gray-600">Category:</div>
                <div className="font-medium">
                  {selectedProduct.categoryName || "N/A"}
                </div>
                <div className="text-gray-600">Brand:</div>
                <div className="font-medium">
                  {selectedProduct.brandName || "N/A"}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Shop *
            </label>
            <select
              value={formData.shopId}
              onChange={(e) =>
                setFormData({ ...formData, shopId: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a shop...</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                </option>
              ))}
            </select>
            {shops.length === 0 && (
              <p className="mt-1 text-sm text-red-600">
                No shops available. Please create a shop first.
              </p>
            )}
          </div>

          <Input
            label="Quantity *"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
            min="1"
            placeholder="Enter quantity"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedProduct(null);
                setFormData({ shopId: "", quantity: 0 });
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || shops.length === 0}>
              {loading ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddStock;
