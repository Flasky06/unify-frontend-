import { useState, useEffect, useMemo } from "react";
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
    name: "",
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
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Quick date filter functions
  const setQuickFilter = (filter) => {
    const today = new Date();
    let start, end;

    switch (filter) {
      case "today":
        start = end = today.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        start = weekStart.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        end = today.toISOString().split("T")[0];
        break;
      default:
        start = end = "";
    }

    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedShop("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.categoryName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
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

      return (
        matchesSearch && matchesCategory && matchesShop && matchesDateRange
      );
    });
  }, [
    expenses,
    searchTerm,
    selectedCategory,
    selectedShop,
    startDate,
    endDate,
  ]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = filteredExpenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );
    const count = filteredExpenses.length;
    const byCategory = {};

    filteredExpenses.forEach((exp) => {
      if (!byCategory[exp.categoryName]) {
        byCategory[exp.categoryName] = 0;
      }
      byCategory[exp.categoryName] += exp.amount || 0;
    });

    return { total, count, byCategory };
  }, [filteredExpenses]);

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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
      name: "",
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
      name: expense.name || "",
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
      name: "",
      amount: "",
      expenseDate: "",
      notes: "",
      categoryId: "",
      shopId: "",
    });
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Date",
      accessor: "expenseDate",
    },
    {
      header: "Amount",
      render: (expense) => (
        <span
          className={expense.amount > 10000 ? "text-red-600 font-semibold" : ""}
        >
          KSH {expense.amount?.toFixed(2) || "0.00"}
        </span>
      ),
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

  const hasActiveFilters =
    searchTerm || selectedCategory || selectedShop || startDate || endDate;

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        <h1 className="text-2xl font-bold text-blue-600">Expense Management</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Expenses</p>
            <p className="text-2xl font-bold text-blue-900">
              KSH {summary.total.toFixed(2)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {summary.count} transactions
            </p>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickFilter("today")}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickFilter("week")}
            className="text-xs"
          >
            This Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickFilter("month")}
            className="text-xs"
          >
            This Month
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-start lg:flex-wrap">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-1 lg:gap-4 lg:flex-wrap">
            <div className="w-full lg:w-64 lg:max-w-xs">
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="w-full lg:w-48 lg:max-w-xs">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full lg:w-48 lg:max-w-xs">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedShop}
                onChange={(e) => {
                  setSelectedShop(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Shops</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 w-full lg:w-auto lg:max-w-md">
              <div className="flex-1 lg:flex-none lg:w-40">
                <label className="block text-xs font-medium text-gray-700 mb-1 px-1">
                  From
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Start Date"
                />
              </div>
              <div className="flex-1 lg:flex-none lg:w-40">
                <label className="block text-xs font-medium text-gray-700 mb-1 px-1">
                  To
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>
          {user?.role !== "SALES_REP" && (
            <Button
              onClick={openCreateModal}
              className="w-full lg:w-auto whitespace-nowrap"
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
              Add Expense
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading expenses...
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={paginatedExpenses}
                emptyMessage="No expenses found matching your criteria."
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredExpenses.length
                    )}{" "}
                    of {filteredExpenses.length} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={
                            currentPage === i + 1 ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(i + 1)}
                          className="min-w-[2.5rem]"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
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

          <Input
            label="Expense Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Electricity, 30 units of tokens"
            required
          />

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
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingExpense
                ? "Update Expense"
                : "Create Expense"}
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
