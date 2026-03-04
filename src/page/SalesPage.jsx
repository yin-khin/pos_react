import { useState, useEffect } from "react";
import request from "../utils/request";
import { showAlert, showConfirm } from "../utils/alert";
import "./feature/category/category.css";

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      setFilteredSales(
        sales.filter(
          (s) =>
            s.sale_id.toLowerCase().includes(kw) ||
            (s.invoice_id && s.invoice_id.toLowerCase().includes(kw)) ||
            (s.pay_method && s.pay_method.toLowerCase().includes(kw))
        )
      );
    } else {
      setFilteredSales(sales);
    }
    setCurrentPage(1);
  }, [searchKeyword, sales]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await request("/api/sales?limit=100", "GET");
      if (response.success && response.data) {
        setSales(response.data);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      showAlert("error", "Error fetching sales");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (saleId) => {
    try {
      const response = await request(`/api/sales/${saleId}`, "GET");
      if (response.success && response.data) {
        setSelectedSale(response.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
      showAlert("error", "Error fetching sale details");
    }
  };

  const handleDelete = async (saleId) => {
    const result = await showConfirm(
      "Are you sure?",
      `Delete sale "${saleId}"? This action cannot be undone.`,
      "Yes, delete it!"
    );
    if (result.isConfirmed) {
      try {
        const response = await request(`/api/sales/${saleId}`, "DELETE");
        if (response.success) {
          showAlert("success", "Sale deleted successfully");
          fetchSales();
        }
      } catch (error) {
        console.error("Error deleting sale:", error);
        showAlert("error", "Error deleting sale");
      }
    }
  };

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="category-container">
      <div className="category-header">
        <h1 className="category-title">Sales Management</h1>
      </div>

      <div className="category-controls">
        <div className="items-per-page">
          <label>Show</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>sales per page</span>
        </div>
        <div className="search-box">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by sale ID, invoice, or payment method..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <table className="category-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Invoice ID</th>
                <th>Sale Date</th>
                <th>Sub Total</th>
                <th>Tax</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.length > 0 ? (
                paginatedSales.map((sale) => (
                  <tr key={sale.sale_id}>
                    <td>{sale.sale_id}</td>
                    <td>{sale.invoice_id || "-"}</td>
                    <td>
                      {sale.sale_date
                        ? new Date(sale.sale_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ color: "blue" }}>
                      ${sale.sub_total != null ? parseFloat(sale.sub_total).toFixed(2) : "0.00"}
                    </td>
                    <td style={{ color: "orange" }}>
                      ${sale.tax != null ? parseFloat(sale.tax).toFixed(2) : "0.00"}
                    </td>
                    <td style={{ color: "green", fontWeight: "bold" }}>
                      ${sale.amount != null ? parseFloat(sale.amount).toFixed(2) : "0.00"}
                    </td>
                    <td>{sale.pay_method || "-"}</td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleViewDetails(sale.sale_id)}
                      >
                        👁 View
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(sale.sale_id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-info">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredSales.length)} of{" "}
            {filteredSales.length} sales
          </div>

          <div className="pagination-controls">
            <button
              className="btn-pagination"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="btn-pagination"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Sale Details Modal */}
      {showDetails && selectedSale && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px" }}
          >
            <div className="modal-header">
              <h2>Sale Details - {selectedSale.sale_id}</h2>
              <button
                className="btn-close"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <strong>Invoice ID:</strong>
                  <p>{selectedSale.invoice_id || "-"}</p>
                </div>
                <div>
                  <strong>Sale Date:</strong>
                  <p>
                    {selectedSale.sale_date
                      ? new Date(selectedSale.sale_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <strong>Payment Method:</strong>
                  <p>{selectedSale.pay_method || "-"}</p>
                </div>
                <div>
                  <strong>Created By:</strong>
                  <p>{selectedSale.create_by || "-"}</p>
                </div>
              </div>

              <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>
                Sale Items
              </h3>
              {selectedSale.SaleItemsDetails &&
              selectedSale.SaleItemsDetails.length > 0 ? (
                <table className="category-table">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.SaleItemsDetails.map((item) => (
                      <tr key={item.std_id}>
                        <td>{item.prd_id}</td>
                        <td>{item.qty}</td>
                        <td>${item.price != null ? parseFloat(item.price).toFixed(2) : "0.00"}</td>
                        <td style={{ color: "green" }}>
                          $
                          {item.qty && item.price
                            ? (parseFloat(item.qty) * parseFloat(item.price)).toFixed(2)
                            : "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No items found</p>
              )}

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <strong>Sub Total:</strong>
                  <span style={{ color: "blue" }}>
                    $
                    {selectedSale.sub_total != null
                      ? parseFloat(selectedSale.sub_total).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <strong>Tax:</strong>
                  <span style={{ color: "orange" }}>
                    $
                    {selectedSale.tax != null
                      ? parseFloat(selectedSale.tax).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "18px",
                    fontWeight: "bold",
                    paddingTop: "10px",
                    borderTop: "2px solid #ddd",
                  }}
                >
                  <strong>Total Amount:</strong>
                  <span style={{ color: "green" }}>
                    $
                    {selectedSale.amount != null
                      ? parseFloat(selectedSale.amount).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
