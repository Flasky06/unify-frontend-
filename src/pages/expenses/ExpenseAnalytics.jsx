import { useState, useEffect } from "react";
import { analyticsService } from "../../services/analyticsService";
import { shopService } from "../../services/shopService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export const ExpenseAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");

  // Date range state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Analytics data
  const [expenseAnalytics, setExpenseAnalytics] = useState(null);

  useEffect(() => {
    fetchShops();
    // Set default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [startDate, endDate, selectedShop]);

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data || []);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const shopId = selectedShop ? parseInt(selectedShop) : null;
      const expenses = await analyticsService.getExpenseAnalytics(
        startDate,
        endDate,
        shopId
      );
      setExpenseAnalytics(expenses);
    } catch (error) {
      console.error("Failed to fetch expense analytics:", error);
    } finally {
      setLoading(false);
    }
  };

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
      case "year":
        start = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
  };

  const clearFilters = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
    setSelectedShop("");
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-blue-600">Expense Analytics</h1>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickFilter("today")}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickFilter("week")}
          >
            This Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickFilter("month")}
          >
            This Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickFilter("year")}
          >
            This Year
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            Clear Filters
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop (Optional)
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
            >
              <option value="">All Shops</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Expense Metrics */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-red-900">
                  KSH {expenseAnalytics?.totalExpenses?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {expenseAnalytics?.totalTransactions || 0} transactions
                </p>
              </div>
            </div>

            {/* Expenses by Category */}
            {expenseAnalytics?.expensesByCategory &&
              Object.keys(expenseAnalytics.expensesByCategory).length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                    Expenses by Category
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(expenseAnalytics.expensesByCategory).map(
                      ([category, amount]) => (
                        <div
                          key={category}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                        >
                          <span className="text-gray-700 font-medium">
                            {category}
                          </span>
                          <span className="font-bold text-blue-900">
                            KSH {amount.toFixed(2)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Expenses by Shop */}
            {expenseAnalytics?.expensesByShop &&
              Object.keys(expenseAnalytics.expensesByShop).length > 1 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                    Expenses by Shop
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(expenseAnalytics.expensesByShop).map(
                      ([shop, amount]) => (
                        <div
                          key={shop}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                        >
                          <span className="text-gray-700 font-medium">
                            {shop}
                          </span>
                          <span className="font-bold text-blue-900">
                            KSH {amount.toFixed(2)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseAnalytics;
