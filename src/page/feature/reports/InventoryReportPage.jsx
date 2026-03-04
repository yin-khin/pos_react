import { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert } from "../../../utils/alert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InventoryReportPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, low-stock, out-of-stock
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  useEffect(() => {
    fetchInventoryReport();
  }, []);

  const fetchInventoryReport = async () => {
    setLoading(true);
    try {
      const response = await request("/api/products", "GET");

      if (response.success && response.products) {
        setProducts(response.products);
        calculateSummary(response.products);
      }
    } catch (error) {
      console.error("Error fetching inventory report:", error);
      showAlert("error", "Failed to load inventory report");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (productsData) => {
    const summary = productsData.reduce(
      (acc, product) => {
        const qty = parseInt(product.qty || 0);
        const cost = parseFloat(product.unit_cost || 0);
        return {
          totalProducts: acc.totalProducts + 1,
          totalValue: acc.totalValue + qty * cost,
          lowStock: acc.lowStock + (qty > 0 && qty <= 10 ? 1 : 0),
          outOfStock: acc.outOfStock + (qty === 0 ? 1 : 0),
        };
      },
      { totalProducts: 0, totalValue: 0, lowStock: 0, outOfStock: 0 }
    );
    setSummary(summary);
  };

  const filteredProducts = products.filter((product) => {
    const qty = parseInt(product.qty || 0);
    const matchesFilter =
      filter === "all" ||
      (filter === "low-stock" && qty > 0 && qty <= 10) ||
      (filter === "out-of-stock" && qty === 0);

    const matchesSearch =
      searchTerm === "" ||
      product.prd_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.prd_id?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: "Out of Stock", color: "#f44336" };
    if (qty <= 10) return { label: "Low Stock", color: "#ff9800" };
    return { label: "In Stock", color: "#4caf50" };
  };

  const exportToCSV = () => {
    const headers = ["Product ID", "Product Name", "Category", "Brand", "Quantity", "Unit Cost", "Total Value", "Status"];
    const rows = filteredProducts.map((product) => {
      const qty = parseInt(product.qty || 0);
      const cost = parseFloat(product.unit_cost || 0);
      return [
        product.prd_id,
        product.prd_name,
        product.category_id || "N/A",
        product.brand_id || "N/A",
        qty,
        cost.toFixed(2),
        (qty * cost).toFixed(2),
        getStockStatus(qty).label,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Inventory Report", 14, 20);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    
    // Add summary
    doc.setFontSize(10);
    doc.text(`Total Products: ${summary.totalProducts}`, 14, 36);
    doc.text(`Total Value: $${summary.totalValue.toFixed(2)}`, 14, 42);
    doc.text(`Low Stock Items: ${summary.lowStock}`, 14, 48);
    doc.text(`Out of Stock: ${summary.outOfStock}`, 14, 54);
    
    // Add table
    const tableData = filteredProducts.map((product) => {
      const qty = parseInt(product.qty || 0);
      const cost = parseFloat(product.unit_cost || 0);
      return [
        product.prd_id,
        product.prd_name,
        product.category_id || "N/A",
        qty,
        `$${cost.toFixed(2)}`,
        `$${(qty * cost).toFixed(2)}`,
        getStockStatus(qty).label,
      ];
    });
    
    autoTable(doc, {
      startY: 60,
      head: [["Product ID", "Product Name", "Category", "Qty", "Unit Cost", "Total Value", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 8 },
      columnStyles: {
        1: { cellWidth: 50 },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
    });
    
    // Save the PDF
    doc.save(`inventory-report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
          📦 Inventory Report
        </h1>
        <p style={{ color: "#666" }}>Monitor stock levels and inventory value</p>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
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
            Total Products
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1976d2" }}>
            {summary.totalProducts}
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
            Total Value
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4caf50" }}>
            ${summary.totalValue.toFixed(2)}
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
            Low Stock Items
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ff9800" }}>
            {summary.lowStock}
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
            Out of Stock
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f44336" }}>
            {summary.outOfStock}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            <option value="all">All Products</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <button
            onClick={exportToCSV}
            disabled={filteredProducts.length === 0}
            style={{
              padding: "8px 20px",
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            disabled={filteredProducts.length === 0}
            style={{
              padding: "8px 20px",
              background: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Product ID
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Product Name
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Category
                </th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                  Quantity
                </th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                  Unit Cost
                </th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                  Total Value
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: "40px", textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const qty = parseInt(product.qty || 0);
                  const cost = parseFloat(product.unit_cost || 0);
                  const status = getStockStatus(qty);

                  return (
                    <tr
                      key={product.prd_id}
                      style={{ borderBottom: "1px solid #f0f0f0" }}
                    >
                      <td style={{ padding: "12px" }}>{product.prd_id}</td>
                      <td style={{ padding: "12px", fontWeight: "500" }}>
                        {product.prd_name}
                      </td>
                      <td style={{ padding: "12px" }}>{product.category_id || "N/A"}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                        {qty}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        ${cost.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#4caf50",
                        }}
                      >
                        ${(qty * cost).toFixed(2)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            background: `${status.color}15`,
                            color: status.color,
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReportPage;
