import { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert } from "../../../utils/alert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CustomerReportPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
  });

  useEffect(() => {
    fetchCustomerReport();
  }, []);

  const fetchCustomerReport = async () => {
    setLoading(true);
    try {
      const response = await request("/api/customers", "GET");

      if (response.success && response.customers) {
        setCustomers(response.customers);
        calculateSummary(response.customers);
      }
    } catch (error) {
      console.error("Error fetching customer report:", error);
      showAlert("error", "Failed to load customer report");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (customersData) => {
    const summary = customersData.reduce(
      (acc, customer) => ({
        totalCustomers: acc.totalCustomers + 1,
        activeCustomers:
          acc.activeCustomers + (customer.status === "Active" ? 1 : 0),
        inactiveCustomers:
          acc.inactiveCustomers + (customer.status === "Inactive" ? 1 : 0),
      }),
      { totalCustomers: 0, activeCustomers: 0, inactiveCustomers: 0 }
    );
    setSummary(summary);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchTerm === "" ||
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);

    return matchesSearch;
  });

  const exportToCSV = () => {
    const headers = [
      "Customer ID",
      "Full Name",
      "Email",
      "Phone",
      // "Address",
      // "Status",
    ];
    const rows = filteredCustomers.map((customer) => [
      customer.customer_id,
      customer.fullname || "N/A",
      customer.email || "N/A",
      customer.phone || "N/A",
      // customer.address || "N/A",
      // customer.status || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Customer Report", 14, 20);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    
    // Add summary
    doc.setFontSize(10);
    doc.text(`Total Customers: ${summary.totalCustomers}`, 14, 36);
    doc.text(`Active Customers: ${summary.activeCustomers}`, 14, 42);
    doc.text(`Inactive Customers: ${summary.inactiveCustomers}`, 14, 48);
    
    // Add table
    const tableData = filteredCustomers.map((customer) => [
      customer.customer_id,
      customer.fullname || "N/A",
      customer.email || "N/A",
      customer.phone || "N/A",
      // customer.address || "N/A",
      // customer.status || "N/A",
    ]);
    
    autoTable(doc, {
      startY: 54,
      head: [["Customer ID", "Full Name", "Email", "Phone",]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 40 },
      },
    });
    
    // Save the PDF
    doc.save(`customer-report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
          👥 Customer Report
        </h1>
        <p style={{ color: "#666" }}>View and analyze customer data</p>
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
            Total Customers
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1976d2" }}>
            {summary.totalCustomers}
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
            Active Customers
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4caf50" }}>
            {summary.activeCustomers}
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
            Inactive Customers
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f44336" }}>
            {summary.inactiveCustomers}
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
            placeholder="Search customers by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: "300px",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          <button
            onClick={exportToCSV}
            disabled={filteredCustomers.length === 0}
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
            disabled={filteredCustomers.length === 0}
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

      {/* Customer Table */}
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
                  Customer ID
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Full Name
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Email
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Phone
                </th>
                {/* <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Address
                </th> */}
                {/* <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>
                  Status
                </th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.customer_id}
                    style={{ borderBottom: "1px solid #f0f0f0" }}
                  >
                    <td style={{ padding: "12px" }}>{customer.customer_id}</td>
                    <td style={{ padding: "12px", fontWeight: "500" }}>
                      {customer.fullname || "N/A"}
                    </td>
                    <td style={{ padding: "12px", color: "#666" }}>
                      {customer.email || "N/A"}
                    </td>
                    <td style={{ padding: "12px" }}>{customer.phone || "N/A"}</td>
                    <td style={{ padding: "12px", color: "#666", maxWidth: "200px" }}>
                      {/* {customer.address || "N/A"} */}
                    </td>
                    {/* <td style={{ padding: "12px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          background:
                            customer.status === "Active" ? "#e8f5e9" : "#ffebee",
                          color: customer.status === "Active" ? "#4caf50" : "#f44336",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {customer.status || "N/A"}
                      </span>
                    </td> */}
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

export default CustomerReportPage;
