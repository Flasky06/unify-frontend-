import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../../services/reportService";
import { shopService } from "../../services/shopService";
import { DateRangePicker } from "../../components/ui/DateRangePicker";

const MetricCard = ({ title, value, subtitle, type = "default" }) => {
  const colorClasses = {
    income: "bg-emerald-50 border-emerald-200",
    expense: "bg-red-50 border-red-200",
    receivable: "bg-blue-50 border-blue-200",
    payable: "bg-orange-50 border-orange-200",
    profit: "bg-purple-50 border-purple-200",
    default: "bg-gray-50 border-gray-200",
  };

  const textColorClasses = {
    income: "text-emerald-700",
    expense: "text-red-700",
    receivable: "text-blue-700",
    payable: "text-orange-700",
    profit: "text-purple-700",
    default: "text-gray-700",
  };

  return (
    <div
      className={`p-6 rounded-lg border-2 ${colorClasses[type]} transition-transform hover:scale-105`}
    >
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <div
        className={`flex items-baseline gap-1 ${textColorClasses[type]} mb-1`}
      >
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      </div>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
};

export const AccountsSummaryReport = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [selectedShopId, setSelectedShopId] = useState("");
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsData = await shopService.getAll();
        setShops(shopsData);
      } catch (error) {
        console.error("Failed to load shops", error);
      }
    };
    fetchShops();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "accountsSummary",
      format(dateRange.startDate, "yyyy-MM-dd"),
      format(dateRange.endDate, "yyyy-MM-dd"),
      selectedShopId,
    ],
    queryFn: async () => {
      const startDateStr = format(dateRange.startDate, "yyyy-MM-dd");
      const endDateStr = format(dateRange.endDate, "yyyy-MM-dd");
      const data = await reportService.getAccountsSummary(
        startDateStr,
        endDateStr,
        selectedShopId || null
      );
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const formatAmount = (val) =>
    new Intl.NumberFormat("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts Summary</h1>
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Net Profit/Loss - Highlighted */}
          <div className="grid grid-cols-1">
            <MetricCard
              title="Net Profit / Loss (KSH)"
              value={formatAmount(data?.netProfit)}
              subtitle="Total Income - Total Expenses"
              type="profit"
            />
          </div>

          {/* Money In Section */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-emerald-600"
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
              Money In (Income)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Cash & Credit Sales (KSH)"
                value={formatAmount(data?.totalCashSales)}
                subtitle="Payments collected"
                type="income"
              />
              <MetricCard
                title="Invoice Payments (KSH)"
                value={formatAmount(data?.totalInvoicePayments)}
                subtitle="Past debts collected"
                type="income"
              />
              <MetricCard
                title="Total Income (KSH)"
                value={formatAmount(data?.totalIncome)}
                subtitle="All money received"
                type="income"
              />
            </div>
          </div>

          {/* Money Owed To You */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Receivables (Money Owed to You)
            </h2>
            <div className="grid grid-cols-1">
              <MetricCard
                title="Pending Invoices (KSH)"
                value={formatAmount(data?.totalPendingInvoices)}
                subtitle="Unpaid customer debts"
                type="receivable"
              />
            </div>
          </div>

          {/* Money Out Section */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Money Out (Expenses)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Operational Expenses (KSH)"
                value={formatAmount(data?.totalOperationalExpenses)}
                subtitle="Rent, utilities, etc."
                type="expense"
              />
              <MetricCard
                title="Salaries Paid (KSH)"
                value={formatAmount(data?.totalSalariesPaid)}
                subtitle="Employee payroll"
                type="expense"
              />
              <MetricCard
                title="Purchase Payments (KSH)"
                value={formatAmount(data?.totalPurchasePayments)}
                subtitle="Supplier payments"
                type="expense"
              />
              <MetricCard
                title="Total Outflows (KSH)"
                value={formatAmount(data?.totalOutflows)}
                subtitle="All money spent"
                type="expense"
              />
            </div>
          </div>

          {/* Money You Owe */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              Payables (Money You Owe)
            </h2>
            <div className="grid grid-cols-1">
              <MetricCard
                title="Pending Purchase Orders (KSH)"
                value={formatAmount(data?.totalPendingPurchaseOrders)}
                subtitle="Unpaid supplier bills"
                type="payable"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
