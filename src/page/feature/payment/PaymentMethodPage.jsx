import { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import "../../feature/category/category.css";

const emptyForm = {
  code: "",
  type: "",
  is_active: true,
  fee: "",
};

const PaymentMethodPage = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [filteredMethods, setFilteredMethods] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      setFilteredMethods(
        paymentMethods.filter(
          (pm) =>
            pm.code.toLowerCase().includes(kw) ||
            (pm.type && pm.type.toLowerCase().includes(kw))
        )
      );
    } else {
      setFilteredMethods(paymentMethods);
    }
    setCurrentPage(1);
  }, [searchKeyword, paymentMethods]);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await request("/api/payment-methods", "GET");
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      showAlert("error", "Error fetching payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingCode(null);
    setShowForm(true);
  };

  const handleEdit = (method) => {
    setFormData({
      code: method.code,
      type: method.type || "",
      is_active: method.is_active ?? true,
      fee: method.fee ?? "",
    });
    setEditingCode(method.code);
    setShowForm(true);
  };

  const handleDelete = async (code) => {
    const result = await showConfirm(
      "Are you sure?",
      `Delete payment method "${code}"?`,
      "Yes, delete it!"
    );
    if (result.isConfirmed) {
      try {
        const response = await request(`/api/payment-methods/${code}`, "DELETE");
        if (response.success) {
          showAlert("success", "Payment method deleted successfully");
          fetchPaymentMethods();
        }
      } catch (error) {
        console.error("Error deleting payment method:", error);
        showAlert("error", "Error deleting payment method");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showAlert("warning", "Code is required");
      return;
    }

    try {
      let response;
      if (editingCode) {
        response = await request(`/api/payment-methods/${editingCode}`, "PUT", {
          type: formData.type,
          is_active: formData.is_active,
          fee: formData.fee !== "" ? Number(formData.fee) : null,
        });
      } else {
        response = await request("/api/payment-methods", "POST", {
          ...formData,
          fee: formData.fee !== "" ? Number(formData.fee) : null,
        });
      }

      if (response.success) {
        showAlert(
          "success",
          editingCode
            ? "Payment method updated successfully"
            : "Payment method created successfully"
        );
        setShowForm(false);
        fetchPaymentMethods();
      }
    } catch (error) {
      console.error("Error saving payment method:", error);
      showAlert("error", "Error saving payment method");
    }
  };

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const totalPages = Math.ceil(filteredMethods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMethods = filteredMethods.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="category-container">
      <div className="category-header">
        <h1 className="category-title">Payment Methods</h1>
        <button className="btn-add-category" onClick={handleAdd}>
          + Add Payment Method
        </button>
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
          <span>methods per page</span>
        </div>
        <div className="search-box">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by code or type..."
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
                <th>Code</th>
                <th>Type</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMethods.length > 0 ? (
                paginatedMethods.map((method) => (
                  <tr key={method.code}>
                    <td>{method.code}</td>
                    <td>{method.type || "-"}</td>
                    <td style={{ color: "green" }}>
                      ${method.fee != null ? parseFloat(method.fee).toFixed(2) : "0.00"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${method.is_active ? "status-available" : "status-unavailable"}`}
                      >
                        {method.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(method)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(method.code)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No payment methods found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-info">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredMethods.length)} of{" "}
            {filteredMethods.length} methods
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

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingCode ? "Edit Payment Method" : "Add Payment Method"}
              </h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>
                  Code <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={set("code")}
                  disabled={!!editingCode}
                  placeholder="e.g. CASH, CARD"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={set("type")}
                  placeholder="e.g. Cash, Credit Card"
                />
              </div>
              <div className="form-group">
                <label>Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fee}
                  onChange={set("fee")}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={formData.is_active}
                      label="Status"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_active: e.target.value,
                        }))
                      }
                    >
                      <MenuItem value={true}>Active</MenuItem>
                      <MenuItem value={false}>Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingCode ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodPage;
