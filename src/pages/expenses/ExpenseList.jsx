import { useState, useEffect, useMemo } from "react";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { expenseService } from "../../services/expenseService";
import { expenseCategoryService } from "../../services/expenseCategoryService";
import { shopService } from "../../services/shopService";
import { paymentMethodService } from "../../services/paymentMethodService"; // Import added
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import Toast from "../../components/ui/Toast";
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
  const itemsPerPage = 20;
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Quick Add State
  const [quickAddCategoryModalOpen, setQuickAddCategoryModalOpen] =
    useState(false);
  const [newQuickCategoryName, setNewQuickCategoryName] = useState("");
  const [quickAddLoading, setQuickAddLoading] = useState(false);

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

  const handleQuickAddCategory = async (e) => {
    e.preventDefault();
    if (!newQuickCategoryName.trim()) return;
    setQuickAddLoading(true);
    try {
      const newCategory = await expenseCategoryService.create({
        name: newQuickCategoryName,
      });
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, categoryId: newCategory.id });
      setQuickAddCategoryModalOpen(false);
      setNewQuickCategoryName("");
      setToast({
        isOpen: true,
        message: "Category created successfully!",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to create category",
        type: "error",
      });
    } finally {
      setQuickAddLoading(false);
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



  return (
    <div className="flex flex-col w-full px-1 md:px-0">
      <div className="flex flex-col gap-3">
        {/* Filters Input Area */}
        {/* Filters Input Area */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="w-full col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              placeholder="Search name or payee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 text-sm w-full"
            />
          </div>
          {/* Category Select */}
          <div className="w-full col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
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
          <div className="w-full col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Shop
            </label>
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
          <div className="w-full col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full py-1.5 text-sm"
            />
          </div>
          <div className="w-full col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full py-1.5 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setPrintModalOpen(true)}
            className="w-full lg:w-auto whitespace-nowrap py-1.5"
          >
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print
          </Button>
          {user?.role !== "SALES_REP" && (
            <Button
              onClick={openCreateModal}
              className="w-full lg:w-auto whitespace-nowrap py-1.5"
            >
              Add Expense
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden">
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <button
                type="button"
                onClick={() => setQuickAddCategoryModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add New
              </button>
            </div>
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

      {/* Quick Add Category Modal */}
      <Modal
        isOpen={quickAddCategoryModalOpen}
        onClose={() => setQuickAddCategoryModalOpen(false)}
        title="Quick Add Category"
      >
        <form onSubmit={handleQuickAddCategory} className="space-y-4">
          <Input
            label="Category Name"
            value={newQuickCategoryName}
            onChange={(e) => setNewQuickCategoryName(e.target.value)}
            placeholder="e.g. Utilities"
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuickAddCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={quickAddLoading}>
              {quickAddLoading ? "Saving..." : "Save Category"}
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



      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />

      {/* Print Expenses Modal */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Expenses List"
      >
        <div
          id="printable-expenses-list"
          className="print:p-8 print:max-w-[210mm] print:mx-auto print:bg-white print:min-h-[297mm]"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-gray-300 mb-4 print:pb-2 print:mb-2">
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              {user?.businessName || user?.business?.name || "Business"}
            </h1>
            <h2 className="text-lg font-semibold text-gray-700">
              Expenses Report
            </h2>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {(selectedCategory || selectedShop || startDate || endDate) && (
                <div className="text-xs mt-2 space-y-0.5">
                  {selectedCategory && (
                    <p>
                      Category:{" "}
                      {
                        categories.find(
                          (c) => c.id.toString() === selectedCategory
                        )?.name
                      }
                    </p>
                  )}
                  {selectedShop && (
                    <p>
                      Shop:{" "}
                      {
                        shops.find((s) => s.id.toString() === selectedShop)
                          ?.name
                      }
                    </p>
                  )}
                  {(startDate || endDate) && (
                    <p>
                      {startDate &&
                        `From: ${new Date(startDate).toLocaleDateString()}`}
                      {startDate && endDate && " | "}
                      {endDate &&
                        `To: ${new Date(endDate).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Expenses Table */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-gray-900">
                <th className="py-1 text-left w-[15%]">Date</th>
                <th className="py-1 text-left w-[25%]">Name</th>
                <th className="py-1 text-left w-[15%]">Payee</th>
                <th className="py-1 text-left w-[15%]">Category</th>
                <th className="py-1 text-left w-[15%]">Shop</th>
                <th className="py-1 text-right w-[15%]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-gray-200">
              {filteredExpenses
                .filter((e) => !e.voided)
                .map((expense) => (
                  <tr key={expense.id} className="print:leading-tight">
                    <td className="py-2 pr-1 align-top text-gray-700">
                      {expense.date
                        ? new Date(expense.date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-2 pr-1 align-top">
                      <div className="font-medium text-gray-900">
                        {expense.name}
                      </div>
                    </td>
                    <td className="py-2 pr-1 align-top text-gray-700">
                      {expense.payee || "-"}
                    </td>
                    <td className="py-2 pr-1 align-top text-gray-700">
                      {expense.categoryName || "-"}
                    </td>
                    <td className="py-2 pr-1 align-top text-gray-700">
                      {expense.shopName || "-"}
                    </td>
                    <td className="py-2 text-right align-top font-medium">
                      KSH {expense.amount?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="border-t-2 border-gray-900 pt-3 border-dashed">
            <div className="flex justify-between items-center text-base font-bold text-gray-900">
              <span className="uppercase">Total Expenses</span>
              <span>
                KSH{" "}
                {filteredExpenses
                  .filter((e) => !e.voided)
                  .reduce((sum, exp) => sum + (exp.amount || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t-2 border-dashed border-gray-200 mt-4 print:mt-2 print:pt-2">
            <p className="text-xs text-gray-500">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions - HIDDEN ON PRINT */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4 print:hidden">
          <Button variant="outline" onClick={() => setPrintModalOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              const originalTitle = document.title;
              document.title = "Expenses_Report";
              window.print();
              setTimeout(() => {
                document.title = originalTitle;
              }, 100);
            }}
            className="gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print
          </Button>
        </div>
      </Modal>
    </div>
  );
};
