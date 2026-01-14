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

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await shopService.getAll();
      setShops(data);
      setError(null);
    } catch (err) {
      setError("Failed to load shops");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

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

  return (
    <div className="flex flex-col w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          {user?.role !== "SHOP_MANAGER" && user?.role !== "SALES_REP" && (
            <Button
              onClick={openCreateModal}
              className="w-full sm:w-auto whitespace-nowrap py-1.5 px-4"
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

        <Table
          columns={[
            {
              header: "Name",
              accessor: "name",
              triggerView: true,
              render: (shop) => (
                <span className="text-gray-900">{shop.name}</span>
              ),
            },
            {
              header: "Status",
              render: (shop) => (
                <span
                  className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                    shop.isActive !== false
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {shop.isActive !== false ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "Actions",
              render: (shop) => (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(shop);
                    }}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </Button>

                  {user?.role !== "SHOP_MANAGER" &&
                    user?.role !== "SALES_REP" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            shop.isActive !== false
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await shopService.toggleStatus(shop.id);
                              fetchShops(); // Refresh list to update counts
                              setToast({
                                isOpen: true,
                                message:
                                  shop.isActive !== false
                                    ? "Shop deactivated"
                                    : "Shop activated",
                                type: "success",
                              });
                            } catch (err) {
                              setToast({
                                isOpen: true,
                                message:
                                  err.message || "Failed to update status",
                                type: "error",
                              });
                            }
                          }}
                        >
                          {shop.isActive !== false ? "Deactivate" : "Activate"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDialog({ isOpen: true, shopId: shop.id });
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                </div>
              ),
            },
          ]}
          data={shops.filter((shop) =>
            shop.name.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          loading={loading}
          emptyMessage="No shops found"
          showViewAction={false}
          searchable={false}
        />
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
            placeholder="e.g., Nairobi CBD Branch"
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
