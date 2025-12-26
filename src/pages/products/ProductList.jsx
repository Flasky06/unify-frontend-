import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { productService } from "../../services/productService";
import { brandService } from "../../services/brandService";
import { categoryService } from "../../services/categoryService";

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    sellingPrice: "",
    costPrice: "",
    brandId: "",
    categoryId: "",
    active: true,
  });
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch products, brands, and categories on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, brandsData, categoriesData] = await Promise.all([
        productService.getAll(),
        brandService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(productsData || []);
      setBrands(brandsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand
      ? product.brandId.toString() === selectedBrand
      : true;
    const matchesCategory = selectedCategory
      ? product.categoryId.toString() === selectedCategory
      : true;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const submitData = {
        ...formData,
        sellingPrice: parseFloat(formData.sellingPrice),
        costPrice: parseFloat(formData.costPrice),
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, submitData);
      } else {
        await productService.create(submitData);
      }
      fetchData();
      closeModal();
    } catch (err) {
      setError(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.delete(id);
        fetchData();
      } catch (err) {
        alert(err.message || "Failed to delete product");
      }
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: "",
      description: "",
      sellingPrice: "",
      costPrice: "",
      brandId: "",
      categoryId: "",
      active: true,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      sellingPrice: product.sellingPrice?.toString() || "",
      costPrice: product.costPrice?.toString() || "",
      brandId: product.brandId?.toString() || "",
      categoryId: product.categoryId?.toString() || "",
      active: product.active ?? true,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: "",
      description: "",
      sellingPrice: "",
      costPrice: "",
      brandId: "",
      categoryId: "",
      active: true,
    });
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "SKU", accessor: "sku" },
    {
      header: "Selling Price",
      render: (product) => `KSH ${product.sellingPrice?.toFixed(2) || "0.00"}`,
    },
    {
      header: "Cost Price",
      render: (product) => `KSH ${product.costPrice?.toFixed(2) || "0.00"}`,
    },
    { header: "Brand", accessor: "brandName" },
    { header: "Category", accessor: "categoryName" },
    {
      header: "Status",
      render: (product) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            product.active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {product.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (product) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(product);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(product.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex flex-col gap-4 flex-1 lg:flex-row">
            <div className="w-full lg:w-64">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full lg:w-48">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full lg:w-48">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={openCreateModal} className="w-full lg:w-auto">
            <svg
              className="w-5 h-5 mr-2"
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
            Add Product
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading products...
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredProducts}
              emptyMessage="No products found matching your criteria."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., iPhone 15 Pro"
            required
          />

          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="e.g., IPH15PRO-256"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Selling Price (KSH)"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({ ...formData, sellingPrice: e.target.value })
              }
              placeholder="0.00"
              required
            />

            <Input
              label="Cost Price (KSH)"
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) =>
                setFormData({ ...formData, costPrice: e.target.value })
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.brandId}
                onChange={(e) =>
                  setFormData({ ...formData, brandId: e.target.value })
                }
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
