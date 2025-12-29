import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import { saleService } from "../../services/saleService";
import { shopService } from "../../services/shopService";

const SalesByItem = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const salesType = searchParams.get("type") || "all"; // 'all', 'product', 'service'

  const [sales, setSales] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [aggregatedData, setAggregatedData] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (selectedShopId) {
      fetchSalesByShop(selectedShopId);
    } else {
      fetchSales();
    }
  }, [selectedShopId]);

  // Re-aggregate data when salesType changes
  useEffect(() => {
    if (sales.length > 0) {
      aggregateData(sales);
    }
  }, [salesType]);

  const fetchShops = async () => {
    try {
      const data = await shopService.getAll();
      setShops(data);
    } catch (error) {
      console.error("Failed to fetch shops", error);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await saleService.getSalesHistory();
      setSales(data);
      aggregateData(data);
    } catch (error) {
      console.error("Failed to fetch sales history", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesByShop = async (shopId) => {
    setLoading(true);
    try {
      const data = await saleService.getSalesByShop(shopId);
      setSales(data);
      aggregateData(data);
    } catch (error) {
      console.error("Failed to fetch shop sales", error);
    } finally {
      setLoading(false);
    }
  };

  const aggregateData = (salesData) => {
    const productStats = {};

    salesData.forEach((sale) => {
      // Skip cancelled sales if desired, assuming we only want completed sales stats
      if (sale.status === "CANCELLED") return;

      if (sale.items) {
        sale.items.forEach((item) => {
          // Filter by sales type
          if (salesType === "product" && item.type !== "PRODUCT") return;
          if (salesType === "service" && item.type !== "SERVICE") return;

          const itemKey = item.productId || item.serviceId || item.productName;
          if (!productStats[itemKey]) {
            productStats[itemKey] = {
              productId: item.productId,
              serviceId: item.serviceId,
              productName: item.productName || "Unknown",
              type: item.type,
              quantitySold: 0,
            };
          }
          productStats[itemKey].quantitySold += item.quantity;
        });
      }
    });

    const result = Object.values(productStats).sort(
      (a, b) => b.quantitySold - a.quantitySold
    );
    setAggregatedData(result);
  };

  const columns = [
    { header: "Product Name", accessor: "productName" },
    {
      header: "Quantity Sold",
      accessor: "quantitySold",
      render: (row) => (
        <span className="font-semibold text-gray-700">{row.quantitySold}</span>
      ),
    },
  ];

  const filteredData = aggregatedData.filter((item) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Tabs for Sales Type */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSearchParams({})}
            className={`${
              salesType === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            All Items
          </button>
          <button
            onClick={() => setSearchParams({ type: "product" })}
            className={`${
              salesType === "product"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Products Only
          </button>
          <button
            onClick={() => setSearchParams({ type: "service" })}
            className={`${
              salesType === "service"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Services Only
          </button>
        </nav>
      </div>

      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:justify-between lg:items-end">
        <div className="w-full lg:flex-1">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">
            {salesType === "product"
              ? "Product Sales by Item"
              : salesType === "service"
              ? "Service Sales by Item"
              : "Sales by Item"}
          </h1>
          <Input
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full lg:w-64">
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={filteredData}
          loading={loading}
          emptyMessage="No item sales data found."
        />
      </div>
    </div>
  );
};

export default SalesByItem;
