import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../../services/reportService";
import { shopService } from "../../services/shopService";
import { paymentMethodService } from "../../services/paymentMethodService";

import { DateRangePicker } from "../../components/ui/DateRangePicker";

const SummaryCard = ({ title, value, icon, isProfit }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
    <div
      className={`p-3 rounded-lg ${
        isProfit ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
      }`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3
        className={`text-2xl font-bold tracking-tight ${
          isProfit ? "text-emerald-600" : "text-gray-900"
        }`}
      >
        {value}
      </h3>
    </div>
  </div>
);

export const SalesReport = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [selectedShopId, setSelectedShopId] = useState("");
  const [shops, setShops] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopsData, accountsData] = await Promise.all([
          shopService.getAll(),
          paymentMethodService.getAll(),
        ]);
        setShops(shopsData);
        setAccounts(accountsData);
      } catch (error) {
        console.error("Failed to load filter data", error);
      }
    };
    fetchData();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "salesReport",
      format(dateRange.startDate, "yyyy-MM-dd"),
      format(dateRange.endDate, "yyyy-MM-dd"),
      format(dateRange.startDate, "yyyy-MM-dd"),
      format(dateRange.endDate, "yyyy-MM-dd"),
      selectedShopId,
      selectedAccountId,
    ],
    queryFn: async () => {
      const startDateStr = format(dateRange.startDate, "yyyy-MM-dd");
      const endDateStr = format(dateRange.endDate, "yyyy-MM-dd");
      const data = await reportService.getSalesReport(
        startDateStr,
        endDateStr,
        selectedShopId || null,
        selectedAccountId || null
      );
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Summary</h1>
          <p className="text-sm text-gray-600 mt-1">
            {format(dateRange.startDate, "MMM d, yyyy")} -{" "}
            {format(dateRange.endDate, "MMM d, yyyy")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Picker */}
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={({ startDate, endDate }) =>
              setDateRange({ startDate, endDate })
            }
          />

          {/* Shop Selector */}
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="">All Shops</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>

          {/* Account Selector */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Top Selling Products
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-3 md:px-6 py-3">Product Name</th>
                    <th className="px-3 md:px-6 py-3 text-right">Qty Sold</th>
                    <th className="px-3 md:px-6 py-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.topProducts?.length > 0 ? (
                    data.topProducts.map((product, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-4 font-medium text-gray-900">
                          {product.productName}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right">
                          {product.quantity}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right text-yellow-600">
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
