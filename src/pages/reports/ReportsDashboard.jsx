import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportService } from "../../services/reportService";
import { format } from "date-fns";
import Button from "../../components/ui/Button";

const ReportsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardReport();
  }, []);

  const fetchDashboardReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportService.getDashboardReport();
      setData(result);
    } catch (err) {
      console.error("Dashboard report error:", err);
      setError(err.message || "Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Report...</div>;
  if (error)
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchDashboardReport}>Retry</Button>
      </div>
    );

  // Check if data exists and has the required properties
  if (!data || typeof data.todaySales === "undefined")
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">
          No data available. This could mean:
        </p>
        <ul className="text-sm text-gray-500 mb-4">
          <li>• No sales have been recorded yet</li>
          <li>• Backend is still deploying</li>
        </ul>
        <Button onClick={fetchDashboardReport}>Refresh</Button>
      </div>
    );

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports Dashboard</h1>
        <Link to="/reports/sales">
          <Button>View Sales Report</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Sales */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 mb-1">Today's Sales</p>
          <h2 className="text-2xl font-bold text-gray-800">
            KSH {data.todaySales?.toLocaleString() || "0"}
          </h2>
        </div>

        {/* Expenses */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-500 mb-1">Today's Expenses</p>
          <h2 className="text-2xl font-bold text-gray-800">
            KSH {data.todayExpenses?.toLocaleString() || "0"}
          </h2>
        </div>

        {/* Profit */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500 mb-1">Estimated Profit (Today)</p>
          <h2
            className={`text-2xl font-bold ${
              data.todayProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            KSH {data.todayProfit?.toLocaleString() || "0"}
          </h2>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-500 mb-1">Low Stock Items</p>
          <h2 className="text-2xl font-bold text-gray-800">
            {data.lowStockCount || 0}
          </h2>
        </div>
      </div>

      {/* Last 7 Days (Optional Visualization - List for now) */}
      {data.last7DaysSales && data.last7DaysSales.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Last 7 Days Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-base text-left">
              <thead className="text-gray-700 bg-gray-50 uppercase font-bold">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2 text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {data.last7DaysSales.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{item.date}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      KSH {item.totalAmount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
