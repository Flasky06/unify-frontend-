import { useState, useEffect } from "react";
import { reportService } from "../../services/reportService";
import { shopService } from "../../services/shopService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Toast } from "../../components/ui/ConfirmDialog";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import useAuthStore from "../../store/authStore";

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

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <p className="text-sm text-gray-500 mb-1">Opening Stock</p>
              <h2 className="text-2xl font-bold text-gray-800">
                {reportData.summary?.totalOpeningStock?.toLocaleString() || "0"}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <p className="text-sm text-gray-500 mb-1">Closing Stock</p>
              <h2 className="text-2xl font-bold text-gray-800">
                {reportData.summary?.totalClosingStock?.toLocaleString() || "0"}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
              <p className="text-sm text-gray-500 mb-1">Total Sales</p>
              <h2 className="text-2xl font-bold text-gray-800">
                {reportData.summary?.totalSales?.toLocaleString() || "0"}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <p className="text-sm text-gray-500 mb-1">Sales Revenue</p>
              <h2 className="text-2xl font-bold text-gray-800">
                KSH {reportData.summary?.totalRevenue?.toLocaleString() || "0"}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
              <p className="text-sm text-gray-500 mb-1">Net Movement</p>
              <h2
                className={`text-2xl font-bold ${
                  (reportData.summary?.netMovement || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {reportData.summary?.netMovement >= 0 ? "+" : ""}
                {reportData.summary?.netMovement?.toLocaleString() || "0"}
              </h2>
            </div>
          </div>

          {/* Movement Table */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Product Movements</h3>
            {reportData.products && reportData.products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">
                        Product Name
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700">
                        Opening Stock
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700">
                        Sales Qty
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700">
                        Closing Stock
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700">
                        Sales Revenue
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700">
                        Net Movement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.products.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {product.productName}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {product.openingStock}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {product.salesQuantity}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {product.closingStock}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          KSH {product.salesRevenue?.toLocaleString()}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium ${
                            product.netMovement >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.netMovement >= 0 ? "+" : ""}
                          {product.netMovement}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No product movements for this period
              </div>
            )}
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
