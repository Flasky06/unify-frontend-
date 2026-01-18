import { useState, useEffect } from "react";
import { reportService } from "../../services/reportService";
import { shopService } from "../../services/shopService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { format } from "date-fns";
import useAuthStore from "../../store/authStore";

const StockMovementReport = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

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

  const handleExport = () => {
    setToast({
      isOpen: true,
      message: "Export functionality coming soon!",
      type: "info",
    });
  };

  const formatNumber = (val) => new Intl.NumberFormat("en-KE").format(val || 0);

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-4">
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        {/* Date Range */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
              }}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
              }}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          {(user?.role === "BUSINESS_OWNER" ||
            user?.role === "BUSINESS_MANAGER") && (
              <div className="col-span-2 lg:col-span-1">
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

          {/* Movement Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">
                Detailed Product Movement
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="text-xs uppercase bg-gray-50/50 text-gray-500 font-semibold tracking-wider">
                  <tr>
                    <th className="px-3 md:px-6 py-3">Product Name</th>
                    <th className="px-3 md:px-6 py-3 text-right">Opening</th>
                    <th className="px-3 md:px-6 py-3 text-right">Added</th>
                    <th className="px-3 md:px-6 py-3 text-right">Sold</th>
                    <th className="px-3 md:px-6 py-3 text-right">Returns</th>
                    <th className="px-3 md:px-6 py-3 text-right">Closing</th>

                    <th className="px-3 md:px-6 py-3 text-right">Net Move</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData?.productMovements?.length > 0 ? (
                    reportData.productMovements.map((item) => (
                      <tr
                        key={item.productId}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-3 md:px-6 py-4 font-medium text-gray-900 truncate max-w-xs">
                          {item.productName}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right font-medium text-gray-600">
                          {formatNumber(item.openingStock)}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right text-blue-600">
                          {item.stockAdded || "-"}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right text-red-600">
                          {item.stockSold || "-"}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right text-orange-600">
                          {item.stockReturned || "-"}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right font-bold text-gray-900 bg-gray-50/30">
                          {formatNumber(item.closingStock)}
                        </td>

                        <td
                          className={`px-3 md:px-6 py-4 text-right font-bold ${item.netMovement > 0
                            ? "text-emerald-600"
                            : item.netMovement < 0
                              ? "text-red-600"
                              : "text-gray-400"
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
