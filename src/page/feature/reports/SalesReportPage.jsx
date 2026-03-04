import { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert } from "../../../utils/alert";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SalesReportPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(moment().startOf("month").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalAmount: 0,
    totalTax: 0,
    totalItems: 0,
  });

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const response = await request(
        `/api/sales?startDate=${startDate}&endDate=${endDate}&limit=1000`,
        "GET"
      );

      if (response.success && response.data) {
        setSales(response.data);
        calculateSummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching sales report:", error);
      showAlert("error", "Failed to load sales report");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (salesData) => {
    const summary = salesData.reduce(
      (acc, sale) => ({
        totalSales: acc.totalSales + 1,
        totalAmount: acc.totalAmount + parseFloat(sale.amount || 0),
        totalTax: acc.totalTax + parseFloat(sale.tax || 0),
        totalItems:
          acc.totalItems +
          (sale.SaleItemsDetails ? sale.SaleItemsDetails.length : 0),
      }),
      { totalSales: 0, totalAmount: 0, totalTax: 0, totalItems: 0 }
    );
    setSummary(summary);
  };

  const handleSearch = () => {
    fetchSalesReport();
  };

  const exportToCSV = () => {
    const headers = ["Sale ID", "Invoice", "Date", "Sub Total", "Tax", "Total", "Payment Method"];
    const rows = sales.map((sale) => [
      sale.sale_id,
      sale.invoice_id,
      moment(sale.sale_date).format("YYYY-MM-DD"),
      sale.sub_total,
      sale.tax,
      sale.amount,
      sale.pay_method,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Sales Report", 14, 20);
    
    // Add date range
    doc.setFontSize(11);
    doc.text(`Period: ${moment(startDate).format("MMM DD, YYYY")} - ${moment(endDate).format("MMM DD, YYYY")}`, 14, 28);
    
    // Add summary
    doc.setFontSize(10);
    doc.text(`Total Sales: ${summary.totalSales}`, 14, 36);
    doc.text(`Total Amount: $${summary.totalAmount.toFixed(2)}`, 14, 42);
    doc.text(`Total Tax: $${summary.totalTax.toFixed(2)}`, 14, 48);
    doc.text(`Total Items Sold: ${summary.totalItems}`, 14, 54);
    
    // Add table
    const tableData = sales.map((sale) => [
      sale.sale_id,
      sale.invoice_id,
      moment(sale.sale_date).format("MMM DD, YYYY"),
      `$${parseFloat(sale.sub_total || 0).toFixed(2)}`,
      `$${parseFloat(sale.tax || 0).toFixed(2)}`,
      `$${parseFloat(sale.amount || 0).toFixed(2)}`,
      sale.pay_method,
    ]);
    
    autoTable(doc, {
      startY: 60,
      head: [["Sale ID", "Invoice", "Date", "Sub Total", "Tax", "Total", "Payment"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 9 },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
    });
    
    // Save the PDF
    doc.save(`sales-report-${startDate}-to-${endDate}.pdf`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
          📊 Sales Report
        </h1>
        <p style={{ color: "#666" }}>View and analyze sales data</p>
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
        <div style={{ display: "flex", gap: "15px", alignItems: "end", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "8px 20px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            {loading ? "Loading..." : "Search"}
          </button>
          <button
            onClick={exportToCSV}
            disabled={sales.length === 0}
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
            disabled={sales.length === 0}
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
            Total Sales
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1976d2" }}>
            {summary.totalSales}
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
            Total Amount
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4caf50" }}>
            ${summary.totalAmount.toFixed(2)}
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
            Total Tax
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ff9800" }}>
            ${summary.totalTax.toFixed(2)}
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
            Total Items Sold
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#9c27b0" }}>
            {summary.totalItems}
          </div>
        </div>
      </div>

      {/* Sales Table */}
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
                  Sale ID
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Invoice
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Date
                </th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                  Sub Total
                </th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                  Tax
                </th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                  Total
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Payment
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
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                    No sales found for the selected period
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.sale_id}
                    style={{ borderBottom: "1px solid #f0f0f0" }}
                  >
                    <td style={{ padding: "12px" }}>{sale.sale_id}</td>
                    <td style={{ padding: "12px" }}>{sale.invoice_id}</td>
                    <td style={{ padding: "12px" }}>
                      {moment(sale.sale_date).format("MMM DD, YYYY")}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      ${parseFloat(sale.sub_total || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      ${parseFloat(sale.tax || 0).toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#4caf50",
                      }}
                    >
                      ${parseFloat(sale.amount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          background: "#e3f2fd",
                          color: "#1976d2",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {sale.pay_method}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReportPage;
