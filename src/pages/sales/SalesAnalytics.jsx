import { useState, useEffect } from "react";
import { analyticsService } from "../../services/analyticsService";
import { shopService } from "../../services/shopService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export const SalesAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");

  // Date range state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Analytics data
  const [salesAnalytics, setSalesAnalytics] = useState(null);

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
      const sales = await analyticsService.getSalesAnalytics(
        startDate,
        endDate,
        shopId
      );
      setSalesAnalytics(sales);
    } catch (error) {
      console.error("Failed to fetch sales analytics:", error);
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
        <h1 className="text-2xl font-bold text-blue-600">Sales Analytics</h1>

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
            {/* Sales Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-blue-900">
                  KSH {salesAnalytics?.totalSales?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {salesAnalytics?.totalTransactions || 0} transactions
                </p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-600 font-medium">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-indigo-900">
                  {salesAnalytics?.totalTransactions || 0}
                </p>
              </div>
            </div>

            {/* Sales by Payment Method */}
            {salesAnalytics?.salesByPaymentMethod &&
              Object.keys(salesAnalytics.salesByPaymentMethod).length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
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
                <div className="bg-white p-4 rounded-lg shadow">
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
          </>
        )}
      </div>
    </div>
  );
};

export default SalesAnalytics;
