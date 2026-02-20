import React, { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";
import {
  Box,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import "../../feature/category/category.css";

const emptyForm = {
  customer_id: "",
  fullname: "",
  email: "",
  phone: "",
  password: "",
  photo: "",
};

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (c) =>
            c.customer_id.toLowerCase().includes(kw) ||
            (c.fullname && c.fullname.toLowerCase().includes(kw)) ||
            (c.email && c.email.toLowerCase().includes(kw)) ||
            (c.phone && c.phone.toLowerCase().includes(kw)),
        ),
      );
    } else {
      setFilteredCustomers(customers);
    }
    setCurrentPage(1);
  }, [searchKeyword, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await request("/api/customers", "GET");
      console.log("Customers API response:", response);

      // Handle array response directly OR object with success property
      if (Array.isArray(response)) {
        setCustomers(response);
      } else if (response.customer || response.customers || response.data) {
        const customerData =
          response.customer || response.customers || response.data || [];
        setCustomers(Array.isArray(customerData) ? customerData : []);
      } else {
        console.error("Unexpected response format:", response);
        showAlert("error", "Unexpected response format");
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      showAlert("error", "Error fetching customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setPhotoFile(null);
    setPhotoPreview("");
    setShowForm(true);
  };

  const handleEditCustomer = (customer) => {
    setFormData({
      customer_id: customer.customer_id,
      fullname: customer.fullname || "",
      email: customer.email || "",
      phone: customer.phone || "",
      password: "", // Don't show existing password
      photo: customer.photo || "",
    });
    setEditingId(customer.customer_id);
    setPhotoFile(null);
    setPhotoPreview(customer.photo || "");
    setShowForm(true);
  };

  const handleDeleteCustomer = async (customer_id) => {
    const result = await showConfirm(
      "Are you sure?",
      `Delete customer "${customer_id}"? This action cannot be undone.`,
      "Yes, delete it!",
    );
    if (result.isConfirmed) {
      try {
        const response = await request(
          `/api/customers/${customer_id}`,
          "DELETE",
        );
        if (response.success || response.message) {
          showAlert("success", "Customer deleted successfully");
          fetchCustomers();
        } else {
          showAlert("error", response.message || "Error deleting customer");
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        showAlert("error", "Error deleting customer");
      }
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id.trim()) {
      showAlert("warning", "Customer ID is required");
      return;
    }
    if (!formData.fullname.trim()) {
      showAlert("warning", "Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      showAlert("warning", "Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert("warning", "Please enter a valid email address");
      return;
    }

    try {
      let photoData = formData.photo;
      if (photoFile) {
        const reader = new FileReader();
        photoData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(photoFile);
        });
      }

      let response;
      const customerData = {
        customer_id: editingId || formData.customer_id,
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password || null,
        photo: photoData || null,
      };

      if (editingId) {
        // PUT request - update existing customer
        response = await request(
          `/api/customers/${editingId}`,
          "PUT",
          customerData,
        );
      } else {
        // POST request - create new customer
        response = await request("/api/customers", "POST", customerData);
      }

      if (response.success || response.message) {
        showAlert(
          "success",
          editingId
            ? "Customer updated successfully"
            : "Customer created successfully",
        );
        setShowForm(false);
        fetchCustomers();
      } else {
        showAlert("error", response.message || "Error saving customer");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      showAlert("error", "Error saving customer");
    }
  };

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="category-container">
      {/* Header */}
      <div className="category-header">
        <h1 className="category-title">Customer Management</h1>
        <button className="btn-add-category" onClick={handleAddCustomer}>
          + Add New Customer
        </button>
      </div>

      {/* Controls */}
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
          <span>customers per page</span>
        </div>
        <div className="search-box">
          <label>Search customers:</label>
          <input
            type="text"
            placeholder="Search by ID, name, email, phone..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <table className="category-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Photo</th>
                <th>Changed By</th>
                <th>Changed On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td>{customer.customer_id}</td>
                    <td>{customer.fullname || "-"}</td>
                    <td>{customer.email || "-"}</td>
                    <td>{customer.phone || "-"}</td>
                    <td>
                      {customer.photo ? (
                        <img
                          src={customer.photo}
                          alt="Customer"
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{customer.changed_by || "-"}</td>
                    <td>
                      {customer.changed_on
                        ? new Date(customer.changed_on).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() =>
                          handleDeleteCustomer(customer.customer_id)
                        }
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-info">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of{" "}
            {filteredCustomers.length} customers
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

      {/* MUI Dialog with Scrollable Form */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="md"
        PaperProps={{
          style: {
            maxHeight: "90vh",
            width: "50%",
          },
        }}
      >
        <DialogTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: editingId ? "#fff3cd" : "#d4edda",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {editingId ? "✎" : "+"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: "#1a3a52" }}>
                {editingId ? "Edit Customer" : "Add New Customer"}
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                {editingId
                  ? `Editing: ${editingId}`
                  : "Fill in the details below"}
              </p>
            </div>
          </div>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{ padding: "12px 24px" }}
          style={{ fontFamily: "sans-serif" }}
        >
          <form onSubmit={handleFormSubmit}>
            {/* Section: Basic Info */}
            <div style={{ marginBottom: 6 }}>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#28a745",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Basic Information
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 16px",
                }}
              >
                <div className="form-group">
                  <label>
                    Customer ID <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customer_id}
                    onChange={set("customer_id")}
                    disabled={!!editingId}
                    placeholder="e.g. CUST-001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Full Name <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={set("fullname")}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #f0f0f0",
                margin: "4px 0 16px",
              }}
            />

            {/* Section: Contact Info */}
            <div style={{ marginBottom: 6 }}>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#28a745",
                  textTransform: "lowercase",
                  letterSpacing: "0.08em",
                }}
              >
                Contact Information
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0 16px",
                }}
              >
                <div className="form-group">
                  <label>
                    Email <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={set("email")}
                    placeholder="customer@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={set("phone")}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Password{" "}
                    {!editingId && <span style={{ color: "#dc3545" }}>*</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={set("password")}
                    placeholder={
                      editingId
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    required={!editingId}
                  />
                  {editingId && (
                    <small style={{ color: "#888", fontSize: 11 }}>
                      Leave blank to keep the current password
                    </small>
                  )}
                </div>
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #f0f0f0",
                margin: "4px 0 16px",
              }}
            />

            {/* Section: Photo */}
            <div style={{ marginBottom: 3 }}>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#28a745",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Profile Photo
              </p>
              <div className="form-group">
                <label>Photo Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {photoPreview && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{
                        maxWidth: 200,
                        maxHeight: 200,
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 4,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions" style={{ marginTop: 20 }}>
              <button
                type="submit"
                className="btn-submit"
                style={{ minWidth: 100 }}
              >
                {editingId ? "💾 Update" : "✚ Create"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
                style={{ minWidth: 90 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerPage;
