import { useState, useEffect, useMemo, useCallback } from "react";
import { analyticsService } from "../../services/analyticsService";
import { shopService } from "../../services/shopService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");

  // Date range state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  const { salesAnalytics, expenseAnalytics } = analyticsData || {};

  useEffect(() => {
    fetchShops();
    // Set default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getAnalyticsForPeriod(
        startDate,
        endDate,
        selectedShop ? parseInt(selectedShop) : null
      );
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedShop]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [fetchAnalytics, startDate, endDate]); // Added startDate, endDate to ensure initial fetch if fetchAnalytics is stable but dates change

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data || []);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  const setQuickFilter = (filter) => {
    const today = new Date();
    let start, end;

    switch (filter) {
      case "today":
        start = end = today.toISOString().split("T")[0];
        break;
      case "week": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        start = weekStart.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
        break;
      }
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

  const netProfit = useMemo(() => {
    if (!salesAnalytics || !expenseAnalytics) return 0;
    return (
      (salesAnalytics.totalSales || 0) - (expenseAnalytics.totalExpenses || 0)
    );
  }, [salesAnalytics, expenseAnalytics]);

  return (
    <div className="p-2 md:p-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-800">Business Analytics</h1>

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
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
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
            {/* Net Profit Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Net Profit</p>
              <p
                className={`text-3xl font-bold ${
                  netProfit >= 0 ? "text-green-900" : "text-red-900"
                }`}
              >
                KSH {netProfit.toFixed(2)}
              </p>
              <p className="text-xs text-purple-600 mt-1">Sales - Expenses</p>
            </div>

            {/* Sales Analytics */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Sales Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    KSH {salesAnalytics?.totalSales?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {salesAnalytics?.totalTransactions || 0} transactions
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-medium">
                    Average Transaction
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    KSH{" "}
                    {salesAnalytics?.averageTransactionValue?.toFixed(2) ||
                      "0.00"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-600 font-medium">
                    Transactions
                  </p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {salesAnalytics?.totalTransactions || 0}
                  </p>
                </div>
              </div>

              {/* Sales by Payment Method */}
              {salesAnalytics?.salesByPaymentMethod &&
                Object.keys(salesAnalytics.salesByPaymentMethod).length > 0 && (
                  <div className="mt-4 bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Sales by Payment Method
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(salesAnalytics.salesByPaymentMethod).map(
                        ([method, amount]) => (
                          <div
                            key={method}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-700">{method}</span>
                            <span className="font-semibold text-gray-900">
                              KSH {amount.toFixed(2)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Sales by Shop */}
              {salesAnalytics?.salesByShop &&
                Object.keys(salesAnalytics.salesByShop).length > 1 && (
                  <div className="mt-4 bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Sales by Shop
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(salesAnalytics.salesByShop).map(
                        ([shop, amount]) => (
                          <div
                            key={shop}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-700">{shop}</span>
                            <span className="font-semibold text-gray-900">
                              KSH {amount.toFixed(2)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Expense Analytics */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Expense Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-600 font-medium">
                    Average Expense
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    KSH{" "}
                    {expenseAnalytics?.totalTransactions > 0
                      ? (
                          expenseAnalytics.totalExpenses /
                          expenseAnalytics.totalTransactions
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>

              {/* Expenses by Category */}
              {expenseAnalytics?.expensesByCategory &&
                Object.keys(expenseAnalytics.expensesByCategory).length > 0 && (
                  <div className="mt-4 bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Expenses by Category
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(expenseAnalytics.expensesByCategory).map(
                        ([category, amount]) => (
                          <div
                            key={category}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-700">{category}</span>
                            <span className="font-semibold text-gray-900">
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
                  <div className="mt-4 bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Expenses by Shop
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(expenseAnalytics.expensesByShop).map(
                        ([shop, amount]) => (
                          <div
                            key={shop}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-700">{shop}</span>
                            <span className="font-semibold text-gray-900">
                              KSH {amount.toFixed(2)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
