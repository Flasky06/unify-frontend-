import { useState, useEffect } from "react";
import { reportService } from "../../services/reportService";
import { shopService } from "../../services/shopService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Toast } from "../../components/ui/ConfirmDialog";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useAuthStore from "../../store/authStore";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const DailySalesReport = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
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
  }, [selectedDate, selectedShopId]);

  const loadShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data);
    } catch (err) {
      console.error("Failed to load shops", err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getDailySalesReport(
        selectedDate,
        selectedShopId || null
      );
      setReportData(data);
    } catch (err) {
      console.error("Failed to load report", err);
      setToast({
        isOpen: true,
        message: "Failed to load report data",
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
        <h1 className="text-2xl font-bold text-blue-600">Daily Sales Report</h1>
        <Button onClick={handleExport} variant="outline">
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
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
              <p className="text-sm text-gray-500 mb-1">Total Sales</p>
              <h2 className="text-2xl font-bold text-gray-800">
                KSH {reportData.summary.totalSales?.toLocaleString() || "0"}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <p className="text-sm text-gray-500 mb-1">Transactions</p>
              <h2 className="text-2xl font-bold text-gray-800">
                {reportData.summary.transactionCount || 0}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <p className="text-sm text-gray-500 mb-1">Avg Transaction</p>
              <h2 className="text-2xl font-bold text-gray-800">
                KSH{" "}
                {reportData.summary.averageTransaction?.toLocaleString() || "0"}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
              <p className="text-sm text-gray-500 mb-1">Items Sold</p>
              <h2 className="text-2xl font-bold text-gray-800">
                {reportData.summary.totalItemsSold || 0}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
              <p className="text-sm text-gray-500 mb-1">Total Discounts</p>
              <h2 className="text-2xl font-bold text-gray-800">
                KSH {reportData.summary.totalDiscounts?.toLocaleString() || "0"}
              </h2>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
              {reportData.paymentMethods &&
              reportData.paymentMethods.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.paymentMethods}
                      dataKey="amount"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) =>
                        `${entry.method}: ${entry.percentage?.toFixed(1)}%`
                      }
                    >
                      {reportData.paymentMethods.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `KSH ${value.toLocaleString()}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No payment data available
                </div>
              )}
            </div>

            {/* Hourly Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Hourly Sales Trend</h3>
              {reportData.hourlySales && reportData.hourlySales.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.hourlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `KSH ${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#3B82F6" name="Sales Amount" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No hourly data available
                </div>
              )}
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Top 10 Products</h3>
            {reportData.topProducts && reportData.topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">
                        #
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">
                        Product Name
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700">
                        Quantity Sold
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {product.productName}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          KSH {product.revenue?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No product data available
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

export default DailySalesReport;
