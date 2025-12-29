import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { expenseCategoryService } from "../../services/expenseCategoryService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const ExpenseCategoryList = () => {
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
      const data = await expenseCategoryService.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch expense categories", err);
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
      if (editingCategory) {
        await expenseCategoryService.update(editingCategory.id, formData);
      } else {
        await expenseCategoryService.create(formData);
      }
      fetchCategories();
      closeModal();
      setToast({
        isOpen: true,
        message: editingCategory
          ? "Expense category updated successfully"
          : "Expense category created successfully",
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
      await expenseCategoryService.delete(id);
      fetchCategories();
      setToast({
        isOpen: true,
        message: "Expense category deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete expense category",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "" });
  };

  const columns = [
    { header: "Name", accessor: "name" },
    ...(user?.role === "SALES_REP"
      ? []
      : [
          {
            header: "Actions",
            render: (category) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(category);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({ isOpen: true, categoryId: category.id });
                  }}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]),
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        <h1 className="text-2xl font-bold text-blue-600">Expense Categories</h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search expense categories..."
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
              Add Expense Category
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading expense categories...
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredCategories}
              emptyMessage="No expense categories found. Create one to get started."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          editingCategory ? "Edit Expense Category" : "Add New Expense Category"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Rent, Utilities, Salaries"
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingCategory
                ? "Update Category"
                : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, categoryId: null })}
        onConfirm={() => handleDelete(confirmDialog.categoryId)}
        title="Delete Expense Category"
        message="Are you sure you want to delete this expense category? This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};
