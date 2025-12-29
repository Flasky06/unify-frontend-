import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { shopService } from "../../services/shopService";
import useAuthStore from "../../store/authStore";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";

export const ShopList = () => {
  const { user } = useAuthStore();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    shopId: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch shops on mount
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await shopService.getAll();
      setShops(data || []);
    } catch (err) {
      console.error("Failed to fetch shops", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission

    setError(null);
    setSubmitting(true);
    try {
      if (editingShop) {
        await shopService.update(editingShop.id, formData);
      } else {
        await shopService.create(formData);
      }
      fetchShops();
      closeModal();
      setToast({
        isOpen: true,
        message: editingShop
          ? "Shop updated successfully"
          : "Shop created successfully",
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
      await shopService.delete(id);
      fetchShops();
      setToast({
        isOpen: true,
        message: "Shop deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete shop",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    setEditingShop(null);
    setFormData({
      name: "",
      location: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      location: shop.location || "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShop(null);
    setFormData({
      name: "",
      location: "",
    });
  };

  const columns = [
    { header: "Shop Name", accessor: "name" },
    { header: "Location", accessor: "location" },
    // Hide Actions for SHOP_MANAGER and SALES_REP
    // Assuming SHOP_MANAGER shouldn't manage the shop LIST, only their own shop.
    ...(user?.role === "SHOP_MANAGER" || user?.role === "SALES_REP"
      ? []
      : [
          {
            header: "Actions",
            render: (shop) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(shop);
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
                    setConfirmDialog({ isOpen: true, shopId: shop.id });
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
        <h1 className="text-2xl font-bold text-blue-600">Shop Management</h1>
        {/* Header Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {user?.role !== "SHOP_MANAGER" && user?.role !== "SALES_REP" && (
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
              Add Shop
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading shops...
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredShops}
              emptyMessage="No shops found. Create one to get started."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingShop ? "Edit Shop" : "Add New Shop"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Shop Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Main Branch, Downtown Store"
            required
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="e.g., Nairobi CBD, Westlands"
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingShop
                ? "Update Shop"
                : "Create Shop"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, shopId: null })}
        onConfirm={() => handleDelete(confirmDialog.shopId)}
        title="Delete Shop"
        message="Are you sure you want to delete this shop? This cannot be undone."
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
