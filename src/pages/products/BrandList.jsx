import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { brandService } from "../../services/brandService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";

export const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    brandId: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [submitting, setSubmitting] = useState(false);

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

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      if (editingBrand) {
        await brandService.update(editingBrand.id, formData);
      } else {
        await brandService.create(formData);
      }
      fetchBrands();
      closeModal();
      setToast({
        isOpen: true,
        message: editingBrand
          ? "Brand updated successfully"
          : "Brand created successfully",
        type: "success",
      });
    } catch (err) {
      setError(err.message || "Operation failed");
      setToast({
        isOpen: true,
        message: err.message || "Operation failed",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await brandService.delete(id);
      fetchBrands();
      setToast({
        isOpen: true,
        message: "Brand deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete brand",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({ name: "" });
  };

  const columns = [
    { header: "Name", accessor: "name" },
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
              setConfirmDialog({ isOpen: true, brandId: brand.id });
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        <h1 className="text-2xl font-bold text-blue-600">Brand Management</h1>
        {/* Header Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={openCreateModal}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
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

        <div className="bg-white rounded-lg shadow overflow-hidden">
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingBrand
                ? "Update Brand"
                : "Create Brand"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, brandId: null })}
        onConfirm={() => handleDelete(confirmDialog.brandId)}
        title="Delete Brand"
        message="Are you sure you want to delete this brand?"
        confirmText="Delete"
        variant="danger"
      />

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
