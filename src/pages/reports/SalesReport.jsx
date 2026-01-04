import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../../services/reportService";
import { shopService } from "../../services/shopService";

import { DateRangePicker } from "../../components/ui/DateRangePicker";

const SummaryCard = ({ title, value, icon, isProfit }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex items-center gap-4 transition-transform hover:scale-105">
    <div
      className={`p-3 rounded-full bg-gray-700/50 ${
        isProfit ? "text-emerald-400" : "text-blue-400"
      }`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <h3
        className={`text-2xl font-bold ${
          isProfit ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </h3>
    </div>
  </div>
);

export const SalesReport = () => {
  const [period, setPeriod] = useState("daily");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [selectedShopId, setSelectedShopId] = useState("");
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const loadShops = async () => {
      try {
        const data = await shopService.getAll();
        setShops(data);
      } catch (error) {
        console.error("Failed to load shops", error);
      }
    };
    loadShops();
  }, []);

  // Period change handler
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (newPeriod) {
      case "daily":
        start = new Date();
        end = new Date();
        break;
      case "weekly":
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(now.getFullYear(), now.getMonth(), diff);
        end = new Date();
        break;
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "yearly":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case "custom":
        // Keep existing range or default to today
        return; // Don't update dateRange for custom
      default:
        break;
    }
    setDateRange({ startDate: start, endDate: end });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "salesReport",
      format(dateRange.startDate, "yyyy-MM-dd"),
      format(dateRange.endDate, "yyyy-MM-dd"),
      selectedShopId,
    ],
    queryFn: () =>
      reportService.getSalesReport(
        format(dateRange.startDate, "yyyy-MM-dd"),
        format(dateRange.endDate, "yyyy-MM-dd"),
        selectedShopId || null
      ),
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KSH",
    }).format(val || 0);

  const formatNumber = (val) => new Intl.NumberFormat("en-KE").format(val || 0);

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-2">Error loading report</div>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Report</h1>
          <p className="text-sm text-gray-400 mt-1">
            {data?.periodLabel || "Select a period"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <div className="flex rounded-lg bg-gray-700 p-1">
            {["daily", "weekly", "monthly", "yearly", "custom"].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                  period === p
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Date Picker (only if custom) */}
          {period === "custom" && (
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={(start, end) =>
                setDateRange({ startDate: start, endDate: end })
              }
            />
          )}

          {/* Shop Selector */}
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Sales"
              value={formatCurrency(data?.summary?.totalSales)}
              icon={
                <svg
                  className="w-6 h-6"
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
              title="Gross Profit"
              value={formatCurrency(data?.summary?.totalProfit)}
              isProfit={true}
              icon={
                <svg
                  className="w-6 h-6"
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
              title="Transactions"
              value={formatNumber(data?.summary?.transactionCount)}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            />
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Top Selling Products
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3 text-right">Qty Sold</th>
                    <th className="px-6 py-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.topProducts?.length > 0 ? (
                    data.topProducts.map((product, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {product.productName}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-yellow-600">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No sales data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
