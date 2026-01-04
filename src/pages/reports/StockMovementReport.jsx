import { useState, useEffect } from "react";
import { reportService } from "../../services/reportService";
import { shopService } from "../../services/shopService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Toast } from "../../components/ui/ConfirmDialog";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import useAuthStore from "../../store/authStore";

// SummaryCard Component
const SummaryCard = ({ title, value, icon, isProfit }) => (
  <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <h3
          className={`text-lg font-bold ${
            isProfit ? "text-emerald-600" : "text-gray-800"
          }`}
        >
          {value}
        </h3>
      </div>
      <div>{icon}</div>
    </div>
  </div>
);

const StockMovementReport = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [period, setPeriod] = useState("daily"); // daily, weekly, monthly, custom
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedShopId, setSelectedShopId] = useState("");
  const [shops, setShops] = useState([]);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (user?.role === "BUSINESS_OWNER" || user?.role === "BUSINESS_MANAGER") {
      loadShops();
    }
  }, [user]);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data);
    } catch (err) {
      console.error("Failed to load shops", err);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();

    switch (newPeriod) {
      case "daily":
        setStartDate(format(today, "yyyy-MM-dd"));
        setEndDate(format(today, "yyyy-MM-dd"));
        break;
      case "weekly":
        setStartDate(format(subDays(today, 6), "yyyy-MM-dd"));
        setEndDate(format(today, "yyyy-MM-dd"));
        break;
      case "monthly":
        setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(today), "yyyy-MM-dd"));
        break;
      case "custom":
        // Keep current dates
        break;
      default:
        break;
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getStockMovementReport(
        startDate,
        endDate,
        selectedShopId || null
      );
      setReportData(data);
    } catch (err) {
      console.error("Failed to load report", err);
      setToast({
        isOpen: true,
        message: "Failed to load stock movement report",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setToast({
      isOpen: true,
      message: "Export functionality coming soon!",
      type: "info",
    });
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KSH",
    }).format(val || 0);

  const formatNumber = (val) => new Intl.NumberFormat("en-KE").format(val || 0);

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-600">
          Stock Movement Report
        </h1>
        <Button onClick={handleExport} variant="outline">
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        {/* Period Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period
          </label>
          <div className="flex flex-wrap gap-2">
            {["daily", "weekly", "monthly", "custom"].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPeriod("custom");
              }}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPeriod("custom");
              }}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          {(user?.role === "BUSINESS_OWNER" ||
            user?.role === "BUSINESS_MANAGER") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop
              </label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Shops</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <SummaryCard
              title="Opening Stock"
              value={formatNumber(reportData?.summary?.totalOpeningStock)}
              icon={
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="Closing Stock"
              value={formatNumber(reportData?.summary?.totalClosingStock)}
              icon={
                <svg
                  className="w-6 h-6 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="Total Sales (Qty)"
              value={formatNumber(reportData?.summary?.totalSales)}
              icon={
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="Sales Revenue"
              value={formatCurrency(reportData?.summary?.totalRevenue)}
              icon={
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="Total Profit"
              value={formatCurrency(reportData?.summary?.totalProfit)}
              isProfit={true}
              icon={
                <svg
                  className="w-6 h-6 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="Net Movement"
              value={formatNumber(reportData?.summary?.netMovement)}
              icon={
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              }
            />
          </div>

          {/* Movement Table */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Detailed Product Movement
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3 text-right">Opening</th>
                    <th className="px-6 py-3 text-right">Added</th>
                    <th className="px-6 py-3 text-right">Sold</th>
                    <th className="px-6 py-3 text-right">Returns</th>
                    <th className="px-6 py-3 text-right">Closing</th>
                    <th className="px-6 py-3 text-right">Revenue</th>
                    <th className="px-6 py-3 text-right text-emerald-600">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-right">Net Move</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData?.productMovements?.length > 0 ? (
                    reportData.productMovements.map((item) => (
                      <tr key={item.productId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-xs">
                          {item.productName}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {formatNumber(item.openingStock)}
                        </td>
                        <td className="px-6 py-4 text-right text-blue-600">
                          {item.stockAdded || "-"}
                        </td>
                        <td className="px-6 py-4 text-right text-red-600">
                          {item.stockSold || "-"}
                        </td>
                        <td className="px-6 py-4 text-right text-orange-600">
                          {item.stockReturned || "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {formatNumber(item.closingStock)}
                        </td>
                        <td className="px-6 py-4 text-right text-yellow-600">
                          {formatCurrency(item.salesRevenue)}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                          {formatCurrency(item.profit)}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-medium ${
                            item.netMovement > 0
                              ? "text-green-600"
                              : item.netMovement < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {item.netMovement > 0 ? "+" : ""}
                          {item.netMovement}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No movement data found for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default StockMovementReport;
