import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { supplierService } from "../../services/supplierService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";

export const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    supplierId: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data || []);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, formData);
      } else {
        await supplierService.create(formData);
      }
      fetchSuppliers();
      closeModal();
      setToast({
        isOpen: true,
        message: editingSupplier
          ? "Supplier updated successfully"
          : "Supplier created successfully",
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
      await supplierService.delete(id);
      fetchSuppliers();
      setToast({
        isOpen: true,
        message: "Supplier deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete supplier",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      phoneNumber: "",
      address: "",
      notes: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phoneNumber: supplier.phoneNumber || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFormData({
      name: "",
      phoneNumber: "",
      address: "",
      notes: "",
    });
  };

  const columns = [
    { header: "Name", accessor: "name", triggerView: true },
    { header: "Phone", accessor: "phoneNumber" },
    {
      header: "Total Debt",
      render: (supplier) => `KES ${(supplier.totalDebt || 0).toLocaleString()}`,
    },
    {
      header: "Status",
      render: (supplier) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            supplier.active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {supplier.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (supplier) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:bg-blue-50 font-medium px-3"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(supplier);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-3"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDialog({ isOpen: true, supplierId: supplier.id });
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
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
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
            Add Supplier
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading suppliers...
            </div>
          ) : (
            <Table
              columns={columns}
              data={(suppliers || []).filter((supplier) =>
                supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              emptyMessage="No suppliers found. Create one to get started."
              showViewAction={false}
              searchable={false}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Supplier Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Nairobi Wholesalers Ltd"
            required
          />

          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            placeholder="e.g., 0712345678"
          />

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="e.g., Gikomba Market, Nairobi"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Payment terms, delivery schedule, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingSupplier
                ? "Update Supplier"
                : "Create Supplier"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, supplierId: null })}
        onConfirm={() => handleDelete(confirmDialog.supplierId)}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier?"
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
