import { useState, useEffect } from "react";
import request from "../utils/request";
import { showAlert } from "../utils/alert";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {

    // Retrieve user info from localStorage (saved during login)
  const user = JSON.parse(localStorage.getItem("user"));
  // const isAuthenticated = !!localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    transactions: 0,
    inventoryValue: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch sales data
      const salesResponse = await request("/api/sales?limit=1000", "GET");
      const sales = salesResponse.success ? (salesResponse.data || salesResponse.sales || []) : [];

      // Fetch products data
      const productsResponse = await request("/api/products", "GET");
      const products = productsResponse.success ? (productsResponse.products || productsResponse.data || []) : [];

      // Fetch customers data
      const customersResponse = await request("/api/customers", "GET");
      const customers = customersResponse.success ? (customersResponse.customers || customersResponse.data || []) : [];

      // Calculate total sales
      const totalSales = sales.reduce(
        (sum, sale) => sum + parseFloat(sale.amount || 0),
        0
      );

      // Calculate inventory value
      const inventoryValue = products.reduce((sum, product) => {
        const qty = parseInt(product.qty || 0);
        const cost = parseFloat(product.unit_cost || 0);
        return sum + qty * cost;
      }, 0);

      // Calculate low stock items
      const lowStockItems = products.filter(
        (p) => parseInt(p.qty || 0) > 0 && parseInt(p.qty || 0) <= 10
      ).length;

      // Calculate out of stock items
      const outOfStockItems = products.filter(
        (p) => parseInt(p.qty || 0) === 0
      ).length;

      // Prepare sales chart data (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const daySales = sales.filter(
          (s) => s.sale_date && s.sale_date.startsWith(dateStr)
        );
        const dayTotal = daySales.reduce(
          (sum, s) => sum + parseFloat(s.amount || 0),
          0
        );
        last7Days.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          sales: dayTotal,
          transactions: daySales.length,
        });
      }

      // Prepare stock status data
      const stockStatusData = [
        { name: "In Stock", value: products.filter((p) => parseInt(p.qty || 0) > 10).length, color: "#4caf50" },
        { name: "Low Stock", value: lowStockItems, color: "#ff9800" },
        { name: "Out of Stock", value: outOfStockItems, color: "#f44336" },
      ];

      // Calculate top products (by quantity sold)
      const productSales = {};
      sales.forEach((sale) => {
        if (sale.SaleItemsDetails && Array.isArray(sale.SaleItemsDetails)) {
          sale.SaleItemsDetails.forEach((item) => {
            const prdId = item.prd_id;
            if (!productSales[prdId]) {
              productSales[prdId] = {
                prd_id: prdId,
                prd_name: item.prd_name || prdId,
                qty: 0,
                revenue: 0,
              };
            }
            productSales[prdId].qty += parseInt(item.qty || 0);
            productSales[prdId].revenue += parseFloat(item.price || 0) * parseInt(item.qty || 0);
          });
        }
      });

      const topProductsData = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        totalSales,
        transactions: sales.length,
        inventoryValue,
        lowStockItems,
        totalCustomers: customers.length,
        totalProducts: products.length,
      });
      setSalesData(last7Days);
      setTopProducts(topProductsData);
      setStockStatus(stockStatusData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showAlert("error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "5px" }}>
          Dashboard
        </h1>
        <p style={{ color: "#666" }}> <span >Welcome, {user?.username || "User"}</span></p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #1976d2",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
            TOTAL SALES
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1976d2", marginBottom: "8px" }}>
            ${stats.totalSales.toFixed(2)}
          </div>
          <span style={{ color: "#4caf50", fontSize: "14px" }}>
            ↑ {stats.transactions} transactions
          </span>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #4caf50",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
            TRANSACTIONS
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4caf50", marginBottom: "8px" }}>
            {stats.transactions}
          </div>
          <span style={{ color: "#666", fontSize: "14px" }}>
            Total sales count
          </span>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #ff9800",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
            INVENTORY VALUE
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ff9800", marginBottom: "8px" }}>
            ${stats.inventoryValue.toFixed(2)}
          </div>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {stats.totalProducts} products
          </span>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #f44336",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
            LOW STOCK ITEMS
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#f44336", marginBottom: "8px" }}>
            {stats.lowStockItems}
          </div>
          <span style={{ color: "#666", fontSize: "14px" }}>
            Needs restocking
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* Sales Trend Chart */}
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
            📈 Sales Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#1976d2"
                strokeWidth={2}
                name="Sales ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status Chart */}
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
            📦 Stock Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stockStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Chart */}
      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
          🏆 Top 5 Products by Revenue
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="prd_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#4caf50" name="Revenue ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>
            Total Customers
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1976d2" }}>
            {stats.totalCustomers}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>
            Total Products
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4caf50" }}>
            {stats.totalProducts}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>
            Average Sale
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ff9800" }}>
            ${stats.transactions > 0 ? (stats.totalSales / stats.transactions).toFixed(2) : "0.00"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
