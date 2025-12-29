import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { serviceCategoryService } from "../../services/serviceCategoryService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const ServiceCategoryList = () => {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    categoryId: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const businessId = user?.businessId;
      if (!businessId) {
        throw new Error("Business ID not found");
      }
      const data = await serviceCategoryService.getAll(businessId);
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch service categories", err);
      setToast({
        isOpen: true,
        message: err.message || "Failed to fetch service categories",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const businessId = user?.businessId;
      if (editingCategory) {
        await serviceCategoryService.update(editingCategory.id, formData);
      } else {
        await serviceCategoryService.create(businessId, formData);
      }
      fetchCategories();
      closeModal();
      setToast({
        isOpen: true,
        message: editingCategory
          ? "Service category updated successfully"
          : "Service category created successfully",
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
      await serviceCategoryService.delete(id);
      fetchCategories();
      setToast({
        isOpen: true,
        message: "Service category deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete service category",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "" });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setFormData({
      name: category.name,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "" });
    setError(null);
  };

  const openDeleteDialog = (id) => {
    setConfirmDialog({ isOpen: true, categoryId: id });
  };

  const closeDeleteDialog = () => {
    setConfirmDialog({ isOpen: false, categoryId: null });
  };

  const confirmDelete = () => {
    if (confirmDialog.categoryId) {
      handleDelete(confirmDialog.categoryId);
      closeDeleteDialog();
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    {
      header: "Actions",
      render: (category) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(category)}
            className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-full transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => openDeleteDialog(category.id)}
            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-full transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        <h1 className="text-2xl font-bold text-blue-600">Service Categories</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search service categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {user?.role !== "SALES_REP" && (
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
              Add Service Category
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={filteredCategories}
            loading={loading}
            emptyMessage="No service categories found"
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          editingCategory ? "Edit Service Category" : "Add New Service Category"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g., Laundry Services"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Service Category"
        message="Are you sure you want to delete this service category? This action cannot be undone."
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default ServiceCategoryList;
