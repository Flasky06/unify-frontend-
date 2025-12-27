import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { serviceProductService } from "../../services/serviceProductService";
import { serviceCategoryService } from "../../services/serviceCategoryService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const ServiceList = () => {
  const { user } = useAuthStore();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    minimumQuantity: 1,
    categoryId: "",
    active: true,
  });
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    serviceId: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const businessId = user?.businessId;
      if (!businessId) {
        throw new Error("Business ID not found");
      }

      const [servicesData, categoriesData] = await Promise.all([
        serviceProductService.getAll(businessId, selectedCategory || null),
        serviceCategoryService.getAll(businessId),
      ]);

      setServices(servicesData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
      setToast({
        isOpen: true,
        message: err.message || "Failed to fetch data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const businessId = user?.businessId;
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        minimumQuantity: parseInt(formData.minimumQuantity),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      };

      if (editingService) {
        await serviceProductService.update(editingService.id, dataToSubmit);
      } else {
        await serviceProductService.create(businessId, dataToSubmit);
      }
      fetchData();
      closeModal();
      setToast({
        isOpen: true,
        message: editingService
          ? "Service updated successfully"
          : "Service created successfully",
        type: "success",
      });
    } catch (err) {
      setError(err.message || "Operation failed");
      setToast({
        isOpen: true,
        message: err.message || "Operation failed",
        type: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await serviceProductService.delete(id);
      fetchData();
      setToast({
        isOpen: true,
        message: "Service deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete service",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      unit: "per service",
      minimumQuantity: 1,
      categoryId: "",
      active: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      unit: service.unit,
      minimumQuantity: service.minimumQuantity,
      categoryId: service.categoryId || "",
      active: service.active,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      unit: "",
      minimumQuantity: 1,
      categoryId: "",
      active: true,
    });
    setError(null);
  };

  const openDeleteDialog = (id) => {
    setConfirmDialog({ isOpen: true, serviceId: id });
  };

  const closeDeleteDialog = () => {
    setConfirmDialog({ isOpen: false, serviceId: null });
  };

  const confirmDelete = () => {
    if (confirmDialog.serviceId) {
      handleDelete(confirmDialog.serviceId);
      closeDeleteDialog();
    }
  };

  const columns = [
    { header: "Name", accessor: "name", truncate: true, maxWidth: "200px" },
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
          {service.price} KSh{" "}
          <span className="text-xs text-gray-500">{service.unit}</span>
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "active",
      render: (service) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            service.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {service.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (service) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(service)}
            className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-full transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => openDeleteDialog(service.id)}
            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-full transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Services</h1>
        {user?.role !== "SALES_REP" && (
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
            Add Service
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredServices}
        loading={loading}
        emptyMessage="No services found"
        showViewAction={true}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingService ? "Edit Service" : "Add New Service"}
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
              placeholder="e.g., Shoe Cleaning"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (KSh) *
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <Input
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                required
                placeholder="e.g., per pair"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
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
            <label
              htmlFor="active"
              className="ml-2 block text-sm text-gray-900"
            >
              Active Service
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingService ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
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

export default ServiceList;
