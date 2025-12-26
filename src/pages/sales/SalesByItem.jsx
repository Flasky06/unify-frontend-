import { useState, useEffect } from "react";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import { saleService } from "../../services/saleService";
import { shopService } from "../../services/shopService";

const SalesByItem = () => {
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
          if (!productStats[item.productId]) {
            productStats[item.productId] = {
              productId: item.productId,
              productName: item.productName || "Unknown",
              quantitySold: 0,
            };
          }
          productStats[item.productId].quantitySold += item.quantity;
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
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Sales by Item
          </h1>
          <div className="w-80">
            <Input
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="w-64">
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
