import { useState, useEffect, useMemo } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AuditLogModal from "../../components/ui/AuditLogModal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { expenseService } from "../../services/expenseService";
import { expenseCategoryService } from "../../services/expenseCategoryService";
import { shopService } from "../../services/shopService";
import { paymentMethodService } from "../../services/paymentMethodService"; // Import added
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const ExpenseList = () => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]); // New State
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    logs: [],
    loading: false,
    expense: null,
  });

  // Updated Form Data Structure
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    expenseDate: "",
    categoryId: "",
    shopId: "",
    payee: "",
    paymentMethodId: "",
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

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
      const [expensesData, categoriesData, shopsData, paymentMethodsData] =
        await Promise.all([
          expenseService.getAll(),
          expenseCategoryService.getAll(),
          shopService.getAll(),
          paymentMethodService.getAll(), // Fetch PMs
        ]);
      setExpenses(expensesData || []);
      setCategories(categoriesData || []);
      setShops(shopsData || []);
      setPaymentMethods(paymentMethodsData || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  // Quick date filter functions (unchanged)
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
    setSelectedCategory("");
    setSelectedShop("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const matchesCategory = selectedCategory
          ? expense.categoryId.toString() === selectedCategory
          : true;

        const matchesShop = selectedShop
          ? expense.shopId?.toString() === selectedShop
          : true;

        const matchesDateRange =
          (!startDate || expense.date >= startDate) && // expenseDate -> date (DTO)
          (!endDate || expense.date <= endDate);

        const matchesSearch =
          expense.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.payee?.toLowerCase().includes(searchTerm.toLowerCase());

        return (
          matchesCategory && matchesShop && matchesDateRange && matchesSearch
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA || b.id - a.id;
      });
  }, [
    expenses,
    selectedCategory,
    selectedShop,
    startDate,
    endDate,
    searchTerm,
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

  // Extract unique expense names for autocomplete
  const uniqueExpenseNames = useMemo(() => {
    const names = expenses.map((e) => e.name).filter(Boolean);
    return [...new Set(names)].sort();
  }, [expenses]);

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
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: formData.expenseDate
          ? new Date(formData.expenseDate).toISOString()
          : new Date().toISOString(), // DTO expects LocalDateTime, generic ISO string usually works or backend parses
        categoryId: parseInt(formData.categoryId),
        shopId: formData.shopId ? parseInt(formData.shopId) : null,
        payee: formData.payee,
        paymentMethodId: formData.paymentMethodId
          ? parseInt(formData.paymentMethodId)
          : null,
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

  const handleVoid = async (id) => {
    try {
      await expenseService.void(id);
      fetchData();
      setToast({
        isOpen: true,
        message: "Expense voided successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to void expense",
        type: "error",
      });
    }
  };

  const handleViewLogs = async (expense) => {
    setAuditModal({ isOpen: true, logs: [], loading: true, expense });
    try {
      const logs = await expenseService.getLogs(expense.id);
      setAuditModal((prev) => ({ ...prev, logs, loading: false }));
    } catch (error) {
      console.error("Failed to fetch logs", error);
      setAuditModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDuplicate = (expense) => {
    setEditingExpense(null);
    setFormData({
      name: expense.name || "",
      amount: expense.amount.toString(),
      expenseDate: new Date().toISOString().split("T")[0],
      categoryId: expense.categoryId?.toString() || "",
      shopId: expense.shopId?.toString() || "",
      payee: expense.payee || "",
      paymentMethodId: expense.paymentMethodId?.toString() || "",
    });
    setIsModalOpen(true);
    setError(null);
    setToast({
      isOpen: true,
      message: "Expense duplicated. Please review and save.",
      type: "success", // Using success or info
    });
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;

    // 1. Always update the name field first
    setFormData((prev) => ({ ...prev, name: newName }));

    // 2. If in "Create" mode (not editing), try to autofill
    if (!editingExpense && newName) {
      // Find all expenses that match the name
      const matches = expenses.filter(
        (exp) => exp.name.toLowerCase() === newName.toLowerCase()
      );

      if (matches.length > 0) {
        // Sort by date descending (newest first) to get the latest amount/details
        // If dates are equal, fallback to ID which usually correlates with time
        matches.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA || b.id - a.id;
        });

        const match = matches[0];

        // Found the latest match! Autofill other fields
        setFormData((prev) => ({
          ...prev,
          name: newName,
          amount: match.amount?.toString() || prev.amount,
          categoryId: match.categoryId?.toString() || prev.categoryId,
          shopId: match.shopId?.toString() || prev.shopId,
          payee: match.payee || prev.payee,
          paymentMethodId:
            match.paymentMethodId?.toString() || prev.paymentMethodId,
        }));
      }
    }
  };

  const openCreateModal = () => {
    setEditingExpense(null);
    setFormData({
      name: "",
      amount: "",
      expenseDate: new Date().toISOString().split("T")[0],
      categoryId: "",
      shopId: "",
      payee: "",
      paymentMethodId: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name || "",
      amount: expense.amount.toString(),
      expenseDate: expense.date ? expense.date.split("T")[0] : "", // date in DTO
      categoryId: expense.categoryId?.toString() || "",
      shopId: expense.shopId?.toString() || "",
      payee: expense.payee || "",
      paymentMethodId: expense.paymentMethodId?.toString() || "",
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
      categoryId: "",
      shopId: "",
      payee: "",
      paymentMethodId: "",
    });
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
      triggerView: true,
      render: (row) => (
        <span className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
          {row.name}
        </span>
      ),
    },
    {
      header: "Date",
      render: (expense) =>
        expense.date ? new Date(expense.date).toLocaleDateString() : "-",
    },
    {
      header: "Payee",
      accessor: "payee",
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
      header: "Status",
      render: (expense) =>
        expense.voided ? (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
            VOIDED
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
            ACTIVE
          </span>
        ),
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
                  className="text-blue-600 hover:bg-blue-50 font-medium px-3"
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
                  className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-medium px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({ isOpen: true, expenseId: expense.id });
                  }}
                >
                  Void
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
      <div className="flex flex-col gap-3">
        {/* Filters Input Area */}
        <div className="flex flex-col gap-1.5 lg:flex-row lg:justify-between lg:items-end lg:flex-wrap">
          <div className="w-full lg:w-48 lg:max-w-xs">
            <Input
              placeholder="Search name or payee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 text-sm"
            />
          </div>
          {/* Category Select */}
          <div className="w-full lg:w-48 lg:max-w-xs">
            <select
              className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          {/* Shop Select */}
          <div className="w-full lg:w-48 lg:max-w-xs">
            <select
              className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          {/* Dates */}
          <div className="flex flex-row gap-2 items-end">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto py-1.5 text-sm"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
        {user?.role !== "SALES_REP" && (
          <Button
            onClick={openCreateModal}
            className="w-full lg:w-auto whitespace-nowrap py-1.5"
          >
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
              showViewAction={false}
              searchable={false}
              onView={(expense) => openEditModal(expense)}
              getRowClassName={(expense) =>
                expense.voided
                  ? "opacity-60 bg-gray-50 line-through text-gray-500"
                  : ""
              }
            />
            {/* Pagination Controls Reuse */}
            {/* ... Simplified pagination render ... */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
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
            onChange={handleNameChange} // Use the new handler
            placeholder="e.g., Shop Rent, Vehicle Fuel"
            required
            list="expense-names-list"
            autoComplete="off"
          />
          <datalist id="expense-names-list">
            {uniqueExpenseNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Payee (Who?)"
              value={formData.payee}
              onChange={(e) =>
                setFormData({ ...formData, payee: e.target.value })
              }
              placeholder="e.g. KPLC"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account From
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.paymentMethodId}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethodId: e.target.value })
                }
              >
                <option value="">Select Account</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
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
        onConfirm={() => handleVoid(confirmDialog.expenseId)}
        title="Void Expense"
        message="Are you sure you want to void this expense? This will mark it as cancelled but maintain the record for audit purposes."
        confirmText="Void"
        variant="warning"
      />

      <AuditLogModal
        isOpen={auditModal.isOpen}
        onClose={() => setAuditModal({ ...auditModal, isOpen: false })}
        title={
          auditModal.expense
            ? `Expense History - ${auditModal.expense.name}`
            : "Expense History"
        }
        logs={auditModal.logs}
        loading={auditModal.loading}
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
