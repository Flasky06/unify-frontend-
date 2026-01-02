import { useState, useEffect } from "react";
import { reportService } from "../../services/reportService";
import { format } from "date-fns";

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
      const result = await reportService.getDashboardReport();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Report...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-center">No data available</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Reports Dashboard
      </h1>

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
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 bg-gray-50 uppercase">
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
