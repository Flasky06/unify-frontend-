import { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { expenseService } from "../../services/expenseService";
import { expenseCategoryService } from "../../services/expenseCategoryService";
import { shopService } from "../../services/shopService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const ExpenseList = () => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    expenseDate: "",
    notes: "",
    categoryId: "",
    shopId: "",
  });
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    expenseId: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData, shopsData] = await Promise.all([
        expenseService.getAll(),
        expenseCategoryService.getAll(),
        shopService.getAll(),
      ]);
      setExpenses(expensesData || []);
      setCategories(categoriesData || []);
      setShops(shopsData || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.shopName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? expense.categoryId.toString() === selectedCategory
      : true;

    const matchesShop = selectedShop
      ? expense.shopId?.toString() === selectedShop
      : true;

    const matchesDateRange =
      (!startDate || expense.expenseDate >= startDate) &&
      (!endDate || expense.expenseDate <= endDate);

    return matchesSearch && matchesCategory && matchesShop && matchesDateRange;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        shopId: formData.shopId ? parseInt(formData.shopId) : null,
      };

      if (editingExpense) {
        await expenseService.update(editingExpense.id, submitData);
      } else {
        await expenseService.create(submitData);
      }
      fetchData();
      closeModal();
      setToast({
        isOpen: true,
        message: editingExpense
          ? "Expense updated successfully"
          : "Expense created successfully",
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
      await expenseService.delete(id);
      fetchData();
      setToast({
        isOpen: true,
        message: "Expense deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete expense",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    setEditingExpense(null);
    setFormData({
      amount: "",
      expenseDate: new Date().toISOString().split("T")[0],
      notes: "",
      categoryId: "",
      shopId: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      expenseDate: expense.expenseDate,
      notes: expense.notes || "",
      categoryId: expense.categoryId.toString(),
      shopId: expense.shopId?.toString() || "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({
      amount: "",
      expenseDate: "",
      notes: "",
      categoryId: "",
      shopId: "",
    });
  };

  const columns = [
    {
      header: "Date",
      accessor: "expenseDate",
    },
    {
      header: "Amount",
      render: (expense) => `KSH ${expense.amount?.toFixed(2) || "0.00"}`,
    },
    { header: "Category", accessor: "categoryName" },
    { header: "Shop", accessor: "shopName" },
    {
      header: "Notes",
      accessor: "notes",
      truncate: true,
      maxWidth: "200px",
    },
    ...(user?.role === "SALES_REP"
      ? []
      : [
          {
            header: "Actions",
            render: (expense) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(expense);
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
                    setConfirmDialog({ isOpen: true, expenseId: expense.id });
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
        <h1 className="text-2xl font-bold text-gray-800">Expense Management</h1>

        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-end">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-1 lg:gap-4">
            <div className="w-full lg:w-64">
              <Input
                placeholder="Search expenses..."
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
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
              >
                <option value="">All Shops</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
          </div>
          {user?.role !== "SALES_REP" && (
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
              Add Expense
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading expenses...
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredExpenses}
              emptyMessage="No expenses found matching your criteria."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingExpense ? "Edit Expense" : "Add New Expense"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (KSH)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              required
            />

            <Input
              label="Date"
              type="date"
              value={formData.expenseDate}
              onChange={(e) =>
                setFormData({ ...formData, expenseDate: e.target.value })
              }
              required
            />
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
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop (Optional)
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={formData.shopId}
              onChange={(e) =>
                setFormData({ ...formData, shopId: e.target.value })
              }
            >
              <option value="">No Shop</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              rows="3"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingExpense ? "Update Expense" : "Create Expense"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, expenseId: null })}
        onConfirm={() => handleDelete(confirmDialog.expenseId)}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This cannot be undone."
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
