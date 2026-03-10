/* eslint-disable no-unused-vars */
// import { useState, useEffect } from "react";
// import request from "../utils/request";
// import { showAlert } from "../utils/alert";
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const Dashboard = () => {

//     // Retrieve user info from localStorage (saved during login)
//   const user = JSON.parse(localStorage.getItem("user"));
//   // const isAuthenticated = !!localStorage.getItem("token");

//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalSales: 0,
//     transactions: 0,
//     inventoryValue: 0,
//     lowStockItems: 0,
//     totalCustomers: 0,
//     totalProducts: 0,
//   });
//   const [salesData, setSalesData] = useState([]);
//   const [topProducts, setTopProducts] = useState([]);
//   const [stockStatus, setStockStatus] = useState([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       // Fetch sales data
//       const salesResponse = await request("/api/sales?limit=1000", "GET");
//       const sales = salesResponse.success ? (salesResponse.data || salesResponse.sales || []) : [];

//       // Fetch products data
//       const productsResponse = await request("/api/products", "GET");
//       const products = productsResponse.success ? (productsResponse.products || productsResponse.data || []) : [];

//       // Fetch customers data
//       const customersResponse = await request("/api/customers", "GET");
//       const customers = customersResponse.success ? (customersResponse.customers || customersResponse.data || []) : [];

//       // Calculate total sales
//       const totalSales = sales.reduce(
//         (sum, sale) => sum + parseFloat(sale.amount || 0),
//         0
//       );

//       // Calculate inventory value
//       const inventoryValue = products.reduce((sum, product) => {
//         const qty = parseInt(product.qty || 0);
//         const cost = parseFloat(product.unit_cost || 0);
//         return sum + qty * cost;
//       }, 0);

//       // Calculate low stock items
//       const lowStockItems = products.filter(
//         (p) => parseInt(p.qty || 0) > 0 && parseInt(p.qty || 0) <= 10
//       ).length;

//       // Calculate out of stock items
//       const outOfStockItems = products.filter(
//         (p) => parseInt(p.qty || 0) === 0
//       ).length;

//       // Prepare sales chart data (last 7 days)
//       const last7Days = [];
//       for (let i = 6; i >= 0; i--) {
//         const date = new Date();
//         date.setDate(date.getDate() - i);
//         const dateStr = date.toISOString().split("T")[0];
//         const daySales = sales.filter(
//           (s) => s.sale_date && s.sale_date.startsWith(dateStr)
//         );
//         const dayTotal = daySales.reduce(
//           (sum, s) => sum + parseFloat(s.amount || 0),
//           0
//         );
//         last7Days.push({
//           date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
//           sales: dayTotal,
//           transactions: daySales.length,
//         });
//       }

//       // Prepare stock status data
//       const stockStatusData = [
//         { name: "In Stock", value: products.filter((p) => parseInt(p.qty || 0) > 10).length, color: "#4caf50" },
//         { name: "Low Stock", value: lowStockItems, color: "#ff9800" },
//         { name: "Out of Stock", value: outOfStockItems, color: "#f44336" },
//       ];

//       // Calculate top products (by quantity sold)
//       const productSales = {};
//       sales.forEach((sale) => {
//         if (sale.SaleItemsDetails && Array.isArray(sale.SaleItemsDetails)) {
//           sale.SaleItemsDetails.forEach((item) => {
//             const prdId = item.prd_id;
//             if (!productSales[prdId]) {
//               productSales[prdId] = {
//                 prd_id: prdId,
//                 prd_name: item.prd_name || prdId,
//                 qty: 0,
//                 revenue: 0,
//               };
//             }
//             productSales[prdId].qty += parseInt(item.qty || 0);
//             productSales[prdId].revenue += parseFloat(item.price || 0) * parseInt(item.qty || 0);
//           });
//         }
//       });

//       const topProductsData = Object.values(productSales)
//         .sort((a, b) => b.revenue - a.revenue)
//         .slice(0, 5);

//       setStats({
//         totalSales,
//         transactions: sales.length,
//         inventoryValue,
//         lowStockItems,
//         totalCustomers: customers.length,
//         totalProducts: products.length,
//       });
//       setSalesData(last7Days);
//       setTopProducts(topProductsData);
//       setStockStatus(stockStatusData);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       showAlert("error", "Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ padding: "20px", textAlign: "center" }}>
//         <h2>Loading dashboard...</h2>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
//       <div style={{ marginBottom: "20px" }}>
//         <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "5px" }}>
//           Dashboard
//         </h1>
//         <p style={{ color: "#666" }}> <span >Welcome, {user?.username || "User"}</span></p>
//       </div>

//       {/* Stats Cards */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//           gap: "20px",
//           marginBottom: "30px",
//         }}
//       >
//         <div
//           style={{
//             background: "#fff",
//             padding: "25px",
//             borderRadius: "12px",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//             borderLeft: "4px solid #1976d2",
//           }}
//         >
//           <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
//             TOTAL SALES
//           </div>
//           <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1976d2", marginBottom: "8px" }}>
//             ${stats.totalSales.toFixed(2)}
//           </div>
//           <span style={{ color: "#4caf50", fontSize: "14px" }}>
//             ↑ {stats.transactions} transactions
//           </span>
//         </div>

//         <div
//           style={{
//             background: "#fff",
//             padding: "25px",
//             borderRadius: "12px",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//             borderLeft: "4px solid #4caf50",
//           }}
//         >
//           <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
//             TRANSACTIONS
//           </div>
//           <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4caf50", marginBottom: "8px" }}>
//             {stats.transactions}
//           </div>
//           <span style={{ color: "#666", fontSize: "14px" }}>
//             Total sales count
//           </span>
//         </div>

//         <div
//           style={{
//             background: "#fff",
//             padding: "25px",
//             borderRadius: "12px",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//             borderLeft: "4px solid #ff9800",
//           }}
//         >
//           <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
//             INVENTORY VALUE
//           </div>
//           <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ff9800", marginBottom: "8px" }}>
//             ${stats.inventoryValue.toFixed(2)}
//           </div>
//           <span style={{ color: "#666", fontSize: "14px" }}>
//             {stats.totalProducts} products
//           </span>
//         </div>

//         <div
//           style={{
//             background: "#fff",
//             padding: "25px",
//             borderRadius: "12px",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//             borderLeft: "4px solid #f44336",
//           }}
//         >
//           <div style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
//             LOW STOCK ITEMS
//           </div>
//           <div style={{ fontSize: "32px", fontWeight: "bold", color: "#f44336", marginBottom: "8px" }}>
//             {stats.lowStockItems}
//           </div>
//           <span style={{ color: "#666", fontSize: "14px" }}>
//             Needs restocking
//           </span>
//         </div>
//       </div>

//       {/* Charts Row */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
//           gap: "20px",
//           marginBottom: "30px",
//         }}
//       >
//         {/* Sales Trend Chart */}
//         <div
//           style={{
//             background: "#fff",
//             padding: "25px",
//             borderRadius: "12px",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           }}
//         >
//           <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
//             📈 Sales Trend (Last 7 Days)
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={salesData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line
//                 type="monotone"
//                 dataKey="sales"
//                 stroke="#1976d2"
//                 strokeWidth={2}
//                 name="Sales ($)"
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Stock Status Chart */}
//         <div
//           style={{
//             background: "#fff",
//             padding: "25px",
//             borderRadius: "12px",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           }}
//         >
//           <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
//             📦 Stock Status
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={stockStatus}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={({ name, value }) => `${name}: ${value}`}
//                 outerRadius={100}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {stockStatus.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Top Products Chart */}
//       <div
//         style={{
//           background: "#fff",
//           padding: "25px",
//           borderRadius: "12px",
//           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           marginBottom: "30px",
//         }}
//       >
//         <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
//           🏆 Top 5 Products by Revenue
//         </h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={topProducts}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="prd_name" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="revenue" fill="#4caf50" name="Revenue ($)" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Additional Stats */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//           gap: "15px",
//         }}
//       >
//         <div
//           style={{
//             background: "#fff",
//             padding: "20px",
//             borderRadius: "8px",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//           }}
//         >
//           <div style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>
//             Total Customers
//           </div>
//           <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1976d2" }}>
//             {stats.totalCustomers}
//           </div>
//         </div>

//         <div
//           style={{
//             background: "#fff",
//             padding: "20px",
//             borderRadius: "8px",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//           }}
//         >
//           <div style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>
//             Total Products
//           </div>
//           <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4caf50" }}>
//             {stats.totalProducts}
//           </div>
//         </div>

//         <div
//           style={{
//             background: "#fff",
//             padding: "20px",
//             borderRadius: "8px",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//           }}
//         >
//           <div style={{ color: "#666", fontSize: "14px", marginBottom: "5px" }}>
//             Average Sale
//           </div>
//           <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ff9800" }}>
//             ${stats.transactions > 0 ? (stats.totalSales / stats.transactions).toFixed(2) : "0.00"}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import { useState, useEffect, useRef } from "react";
import request from "../utils/request";
import { showAlert } from "../utils/alert";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Animated Counter Hook ────────────────────────────────────────────────────
const useCounter = (end, duration = 1400, decimals = 0) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(parseFloat(start.toFixed(decimals)));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return count;
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f1117", border: "1px solid #22c55e33",
      borderRadius: 10, padding: "10px 16px", fontSize: 13,
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
    }}>
      <p style={{ color: "#8892aa", marginBottom: 6, fontWeight: 600, fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, fontSize: 15 }}>
          {p.name}: <span style={{ color: "#fff" }}>{typeof p.value === "number" && p.name.includes("$") ? `$${p.value.toFixed(2)}` : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, prefix, suffix, sub, color, icon, delay = 0 }) => {
  const num = useCounter(parseFloat(value) || 0, 1400, prefix === "$" ? 2 : 0);
  return (
    <div style={{
      background: "#ffffff", borderRadius: 16, padding: "24px 26px",
      borderTop: `3px solid ${color}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      animation: `slideUp 0.5s ease both`, animationDelay: `${delay}ms`,
      position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)"; }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: -20, right: -20, width: 100, height: 100,
        borderRadius: "50%", background: `${color}10`, pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", top: 18, right: 20, fontSize: 20, opacity: 0.15,
        userSelect: "none", filter: "grayscale(0.3)"
      }}>{icon}</div>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.4px", textTransform: "uppercase", color: "#9aa0b4", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 25, color, lineHeight: 1, marginBottom: 8 }}>
        {prefix}{typeof num === "number" ? num.toLocaleString("en", { minimumFractionDigits: prefix === "$" ? 2 : 0, maximumFractionDigits: prefix === "$" ? 2 : 0 }) : num}{suffix}
      </div>
      <div style={{ fontSize: 12.5, color: "#9aa0b4", fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>
    </div>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, children, style = {} }) => (
  <div style={{
    background: "#fff", borderRadius: 16, padding: "24px 26px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f0f2f8",
    animation: "slideUp 0.5s ease both", animationDelay: "200ms",
    ...style
  }}>
    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15.5, color: "#1a1d2e", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
      {title}
    </div>
    {children}
  </div>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const Skeleton = ({ w = "100%", h = 20, r = 8, style = {} }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,#f0f2f8 25%,#e4e8f2 50%,#f0f2f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", ...style }} />
);

// ─── Custom PieChart Label ─────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
  if (!value) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
      {value}
    </text>
  );
};

// ─── Mini Stats Row ───────────────────────────────────────────────────────────
const MiniStat = ({ label, value, color }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "18px 20px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)", border: "1px solid #f0f2f8",
    animation: "slideUp 0.5s ease both",
  }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "#9aa0b4", marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>{label}</div>
    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 25, color }}>{value}</div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0, transactions: 0, inventoryValue: 0,
    lowStockItems: 0, totalCustomers: 0, totalProducts: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const salesResponse   = await request("/api/sales?limit=1000", "GET");
      const productsResponse = await request("/api/products", "GET");
      const customersResponse = await request("/api/customers", "GET");

      const sales    = salesResponse.success    ? (salesResponse.data    || salesResponse.sales    || []) : [];
      const products = productsResponse.success  ? (productsResponse.products || productsResponse.data  || []) : [];
      const customers = customersResponse.success ? (customersResponse.customers || customersResponse.data || []) : [];

      const totalSales      = sales.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
      const inventoryValue  = products.reduce((sum, p) => sum + parseInt(p.qty || 0) * parseFloat(p.unit_cost || 0), 0);
      const lowStockItems   = products.filter(p => parseInt(p.qty || 0) > 0 && parseInt(p.qty || 0) <= 10).length;
      const outOfStockItems = products.filter(p => parseInt(p.qty || 0) === 0).length;

      // Last 7 days chart
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const daySales = sales.filter(s => s.sale_date && s.sale_date.startsWith(dateStr));
        last7Days.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          "Sales ($)": parseFloat(daySales.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0).toFixed(2)),
          Transactions: daySales.length,
        });
      }

      const stockStatusData = [
        { name: "In Stock",     value: products.filter(p => parseInt(p.qty||0) > 10).length, color: "#22c55e" },
        { name: "Low Stock",    value: lowStockItems, color: "#f59e0b" },
        { name: "Out of Stock", value: outOfStockItems, color: "#ef4444" },
      ];

      const productSales = {};
      sales.forEach(sale => {
        (sale.SaleItemsDetails || []).forEach(item => {
          const id = item.prd_id;
          if (!productSales[id]) productSales[id] = { prd_id: id, prd_name: item.prd_name || id, qty: 0, revenue: 0 };
          productSales[id].qty += parseInt(item.qty || 0);
          productSales[id].revenue += parseFloat(item.price || 0) * parseInt(item.qty || 0);
        });
      });

      const topProductsData = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
        .map(p => ({ ...p, "Revenue ($)": parseFloat(p.revenue.toFixed(2)) }));

      const recent = [...sales].sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date)).slice(0, 5);

      setStats({ totalSales, transactions: sales.length, inventoryValue, lowStockItems, totalCustomers: customers.length, totalProducts: products.length });
      setSalesData(last7Days);
      setTopProducts(topProductsData);
      setStockStatus(stockStatusData);
      setRecentSales(recent);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showAlert("error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const avgSale = stats.transactions > 0 ? (stats.totalSales / stats.transactions) : 0;

  return (
    <>
      <style>{`
       @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");


        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.4; }
        }

        .dash-root * { box-sizing: border-box; }
        .dash-root { font-family: 'DM Sans', sans-serif; background: #f4f6fa; min-height: 100vh; padding: 28px 32px; }

        .dash-table { width: 100%; border-collapse: collapse; }
        .dash-table thead tr { background: #22c55e; }
        .dash-table thead th { padding: 12px 16px; text-align: left; font-weight: 700; font-size: 12.5px; color: #fff; letter-spacing: 0.3px; white-space: nowrap; }
        .dash-table tbody tr { border-bottom: 1px solid #f0f2f8; transition: background 0.12s; }
        .dash-table tbody tr:last-child { border-bottom: none; }
        .dash-table tbody tr:hover { background: #f8fafb; }
        .dash-table tbody td { padding: 12px 16px; font-size: 13px; color: #1a1d2e; }

        .status-pill {
          display: inline-flex; align-items: center; padding: 3px 11px;
          border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
        }
        .status-paid     { background: rgba(34,197,94,0.12);  color: #16a34a; }
        .status-pending  { background: rgba(245,158,11,0.12); color: #d97706; }
        .status-cancelled{ background: rgba(239,68,68,0.12);  color: #dc2626; }

        .refresh-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #22c55e; color: #fff; border: none; border-radius: 10px;
          padding: 9px 20px; cursor: pointer; font-family: 'DM Sans',sans-serif;
          font-weight: 600; font-size: 13px; transition: all 0.18s;
          box-shadow: 0 4px 12px rgba(34,197,94,0.35);
        }
        .refresh-btn:hover { background: #16a34a; transform: translateY(-1px); }

        .recharts-tooltip-wrapper { outline: none !important; }
      `}</style>

      <div className="dash-root">

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, animation: "fadeIn 0.4s ease" }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, color: "#1a1d2e", margin: 0, lineHeight: 1.1 }}>
              Dashboard
            </h1>
            <p style={{ color: "#9aa0b4", marginTop: 6, fontSize: 14, fontWeight: 400 }}>
              Welcome back, <span style={{ color: "#22c55e", fontWeight: 600 }}>{user?.username || "User"}</span>
              <span style={{ margin: "0 8px", color: "#d1d5e0" }}>•</span>
              <span style={{ fontSize: 13 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </p>
          </div>
          <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={loading ? { animation: "spin 0.9s linear infinite" } : {}}>
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* ── Stat Cards ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 24 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <Skeleton h={11} w="60%" style={{ marginBottom: 14 }} />
                <Skeleton h={36} w="80%" style={{ marginBottom: 10 }} />
                <Skeleton h={12} w="50%" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 24, fontSize:12}}>
            <StatCard label="Total Sales" value={stats.totalSales} prefix="$" icon="💰" color="#3b82f6" sub={`↑ ${stats.transactions} transactions`} delay={0} />
            <StatCard label="Transactions" value={stats.transactions} icon="🧾" color="#22c55e" sub="Total sales count" delay={80} />
            <StatCard label="Inventory Value" value={stats.inventoryValue} prefix="$" icon="📦" color="#f59e0b" sub={`${stats.totalProducts} products`} delay={160} />
            <StatCard label="Low Stock Items" value={stats.lowStockItems} icon="⚠️" color="#ef4444" sub="Needs restocking" delay={240} />
          </div>
        )}

        {/* ── Charts Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>

          {/* Sales Trend */}
          <SectionCard title="📈 Sales Trend — Last 7 Days">
            {loading ? (
              <Skeleton h={260} r={12} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salesData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9aa0b4", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9aa0b4", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'DM Sans',sans-serif", paddingTop: 12 }} />
                  <Line type="monotone" dataKey="Sales ($)" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Transactions" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 3" dot={{ fill: "#22c55e", r: 3, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Stock Status */}
          <SectionCard title="📦 Stock Status">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Skeleton h={200} r={12} />
                {[0,1,2].map(i => <Skeleton key={i} h={16} w="80%" />)}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stockStatus} cx="50%" cy="50%" outerRadius={90} innerRadius={48} dataKey="value" labelLine={false} label={renderPieLabel} paddingAngle={2}>
                      {stockStatus.map((e, i) => (
                        <Cell key={i} fill={e.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {stockStatus.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <span style={{ color: "#6b7280", flex: 1 }}>{s.name}</span>
                      <span style={{ fontWeight: 700, color: "#1a1d2e" }}>{s.value}</span>
                      <div style={{ height: 6, width: 60, borderRadius: 3, background: "#f0f2f8", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, s.value * 12)}%`, background: s.color, borderRadius: 3, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionCard>
        </div>

        {/* ── Top Products + Recent Sales ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>

          {/* Top Products Bar */}
          <SectionCard title="🏆 Top 5 Products by Revenue">
            {loading ? (
              <Skeleton h={240} r={12} />
            ) : topProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9aa0b4", fontSize: 14 }}>No sales data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topProducts} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                  <XAxis dataKey="prd_name" tick={{ fontSize: 10, fill: "#9aa0b4", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={42} />
                  <YAxis tick={{ fontSize: 11, fill: "#9aa0b4", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Revenue ($)" radius={[6,6,0,0]} maxBarSize={40}>
                    {topProducts.map((_, i) => (
                      <Cell key={i} fill={["#22c55e","#3b82f6","#f59e0b","#8b5cf6","#ef4444"][i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Recent Sales Table */}
          <SectionCard title="🕐 Recent Transactions">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[0,1,2,3,4].map(i => <Skeleton key={i} h={40} r={8} />)}
              </div>
            ) : recentSales.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9aa0b4", fontSize: 14 }}>No transactions yet</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Sale ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((s, i) => {
                      const st = (s.status_payment || "paid").toLowerCase();
                      return (
                        <tr key={i}>
                          <td><strong style={{ fontFamily: "'Syne',sans-serif", fontSize: 12 }}>{s.sale_id || s.id || `#${i+1}`}</strong></td>
                          <td>{s.fullname || s.customer_name || "—"}</td>
                          <td><span style={{ color: "#22c55e", fontWeight: 700 }}>${parseFloat(s.amount || 0).toFixed(2)}</span></td>
                          <td>
                            <span className={`status-pill status-${st}`}>
                              {s.status_payment || "Paid"}
                            </span>
                          </td>
                          <td style={{ color: "#9aa0b4", fontSize: 12 }}>{s.sale_date ? new Date(s.sale_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Mini Stats Row ── */}
        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <MiniStat label="Total Customers" value={stats.totalCustomers} color="#3b82f6" />
            <MiniStat label="Total Products"  value={stats.totalProducts}  color="#22c55e" />
            <MiniStat label="Average Sale"    value={`$${avgSale.toFixed(2)}`} color="#f59e0b" />
          </div>
        )}

      </div>
    </>
  );
};

export default Dashboard;