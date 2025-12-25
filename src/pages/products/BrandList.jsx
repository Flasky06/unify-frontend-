import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { brandService } from "../../services/brandService";

export const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await brandService.getAll();
      setBrands(data || []);
    } catch (err) {
      console.error("Failed to fetch brands", err);
      // Don't show error to user if it's just empty
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.description &&
        brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingBrand) {
        await brandService.update(editingBrand.id, formData);
      } else {
        await brandService.create(formData);
      }
      fetchBrands();
      closeModal();
    } catch (err) {
      setError(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await brandService.delete(id);
        fetchBrands();
      } catch (err) {
        alert(err.message || "Failed to delete brand");
      }
    }
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, description: brand.description || "" });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({ name: "", description: "" });
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Description", accessor: "description" },
    {
      header: "Actions",
      render: (brand) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(brand);
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
              handleDelete(brand.id);
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
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openCreateModal}>
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
            Add Brand
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading brands...
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredBrands}
              emptyMessage="No brands found. Create one to get started."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBrand ? "Edit Brand" : "Add New Brand"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Brand Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Nike, Coca-Cola"
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingBrand ? "Update Brand" : "Create Brand"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
