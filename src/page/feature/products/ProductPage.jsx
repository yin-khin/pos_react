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
  prd_id: "",
  prd_name: "",
  category_id: "",
  brand_id: "",
  stock_date: "",
  exp_date: "",
  qty: "",
  unit_cost: "",
  remark: "",
  telegram: "",
  photo: "",
  status: "",
};

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
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
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.prd_id.toLowerCase().includes(kw) ||
            (p.prd_name && p.prd_name.toLowerCase().includes(kw)) ||
            (p.category_id && p.category_id.toLowerCase().includes(kw)) ||
            (p.brand_id && p.brand_id.toLowerCase().includes(kw)),
        ),
      );
    } else {
      setFilteredProducts(products);
    }
    setCurrentPage(1);
  }, [searchKeyword, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await request("/api/products", "GET");
      console.log("Products API response:", response);

      if (response.success && response.products) {
        setProducts(response.products);
      } else if (Array.isArray(response)) {
        setProducts(response);
      } else {
        console.error("Unexpected response format:", response);
        showAlert("error", "Unexpected response format");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlert("error", "Error fetching products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await request("/api/categories", "GET");
      console.log("Categories API response:", response);

      if (response.success && response.category) {
        setCategories(response.category);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        console.error("Unexpected categories response:", response);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await request("/api/brands", "GET");
      console.log("Brands API response:", response);

      if (response.success && response.brand) {
        setBrands(response.brand);
        setAllBrands(response.brand);
      } else if (Array.isArray(response)) {
        setBrands(response);
        setAllBrands(response);
      } else {
        console.error("Unexpected brands response:", response);
        setBrands([]);
        setAllBrands([]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
      setAllBrands([]);
    }
  };

  const handleAddProduct = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setBrands(allBrands);
    setPhotoFile(null);
    setPhotoPreview("");
    setShowForm(true);
  };

  const handleEditProduct = async (product) => {
    setFormData({
      prd_id: product.prd_id,
      prd_name: product.prd_name || "",
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      stock_date: product.stock_date ? product.stock_date.slice(0, 10) : "",
      exp_date: product.exp_date ? product.exp_date.slice(0, 10) : "",
      qty: product.qty ?? "",
      unit_cost: product.unit_cost ?? "",
      remark: product.remark || "",
      telegram: product.telegram || "",
      status: product.status || "",
      photo: product.photo || "",
    });
    setEditingId(product.prd_id);
    setPhotoFile(null);
    setPhotoPreview(product.photo || "");

    if (product.category_id) {
      try {
        const response = await request(
          `/api/brands?categories=${product.category_id}`,
          "GET",
        );
        if (response.success && response.brand) {
          setBrands(response.brand);
        } else {
          setBrands(allBrands);
        }
      } catch (error) {
        console.error("Error fetching brands by category:", error);
        setBrands(allBrands);
      }
    } else {
      setBrands(allBrands);
    }

    setShowForm(true);
  };

  const handleDeleteProduct = async (prd_id) => {
    const result = await showConfirm(
      "Are you sure?",
      `Delete product "${prd_id}"? This action cannot be undone.`,
      "Yes, delete it!",
    );
    if (result.isConfirmed) {
      try {
        const response = await request(`/api/products/${prd_id}`, "DELETE");
        if (response.success || response.message) {
          showAlert("success", "Product deleted successfully");
          fetchProducts();
        } else {
          showAlert("error", response.message || "Error deleting product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        showAlert("error", "Error deleting product");
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
    if (!formData.prd_id.trim()) {
      showAlert("warning", "Product ID is required");
      return;
    }
    if (!formData.prd_name.trim()) {
      showAlert("warning", "Product name is required");
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
      const productData = {
        prd_id: editingId || formData.prd_id,
        prd_name: formData.prd_name,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        stock_date: formData.stock_date || null,
        exp_date: formData.exp_date || null,
        qty: formData.qty !== "" ? Number(formData.qty) : null,
        unit_cost:
          formData.unit_cost !== "" ? Number(formData.unit_cost) : null,
        remark: formData.remark || null,
        telegram: formData.telegram || null,
        status: formData.status || null,
        photo: photoData || null,
      };

      if (editingId) {
        response = await request(
          `/api/products/${editingId}`,
          "PUT",
          productData,
        );
      } else {
        response = await request("/api/products", "POST", productData);
      }

      if (response.success || response.message) {
        showAlert(
          "success",
          editingId
            ? "Product updated successfully"
            : "Product created successfully",
        );
        setShowForm(false);
        fetchProducts();
      } else {
        showAlert("error", response.message || "Error saving product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showAlert("error", "Error saving product");
    }
  };

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData((prev) => ({ ...prev, category_id: categoryId, brand_id: "" }));

    if (!categoryId) {
      setBrands(allBrands);
      return;
    }

    try {
      const response = await request(
        `/api/brands?categories=${categoryId}`,
        "GET",
      );
      console.log("Brands by category response:", response);

      if (response.success && response.brand) {
        setBrands(response.brand);
      } else {
        console.log("No brands found for category, showing all brands");
        setBrands(allBrands);
      }
    } catch (error) {
      console.error("Error fetching brands by category:", error);
      setBrands(allBrands);
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getCategoryLabel = (id) => {
    if (!id) return "-";
    const cat = categories.find((c) => c.code === id);
    return cat ? `${cat.code}${cat.desc ? ` - ${cat.desc}` : ""}` : id;
  };

  const getBrandLabel = (id) => {
    if (!id) return "-";
    const b = allBrands.find((br) => br.code === id);
    return b ? `${b.code}${b.desc ? ` - ${b.desc}` : ""}` : id;
  };

  return (
    <div className="category-container">
      {/* Header */}
      <div className="category-header">
        <h1 className="category-title">Product Management</h1>
        <button className="btn-add-category" onClick={handleAddProduct}>
          + Add New Product
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
          <span>products per page</span>
        </div>
        <div className="search-box">
          <label>Search products:</label>
          <input
            type="text"
            placeholder="Search by ID, name, category, brand..."
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
                <th>Product ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Telegram</th>
                <th>Photo</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr key={product.prd_id}>
                    <td>{product.prd_id}</td>
                    <td>{product.prd_name || "-"}</td>
                    <td>{getCategoryLabel(product.category_id)}</td>
                    <td>{getBrandLabel(product.brand_id)}</td>
                    <td>{product.qty ?? "-"}</td>
                    <td style={{ color: "green", fontWeight: "600" }}>
                      {product.unit_cost != null
                        ? `$${parseFloat(product.unit_cost).toFixed(2)}`
                        : "-"}
                    </td>
                    <td>{product.telegram || "-"}</td>
                    <td>
                      {product.photo ? (
                        <img
                          src={product.photo}
                          alt="Product"
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${product.status}`}>
                        {product.status || "-"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditProduct(product)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteProduct(product.prd_id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-info">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
            {filteredProducts.length} products
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
        fullWidth
        PaperProps={{
          style: {
            maxHeight: "90vh",
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
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                {editingId
                  ? `Editing: ${editingId}`
                  : "Fill in the details below"}
              </p>
            </div>
          </div>
        </DialogTitle>

        <DialogContent dividers sx={{ padding: "20px 24px" }}>
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
                    Product ID <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.prd_id}
                    onChange={set("prd_id")}
                    disabled={!!editingId}
                    placeholder="e.g. PRD-001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Product Name <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.prd_name}
                    onChange={set("prd_name")}
                    placeholder="Enter product name"
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

            {/* Section: Classification */}
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
                Classification
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 16px",
                }}
              >
                <div className="form-group">
                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel id="cat-label">Category</InputLabel>
                      <Select
                        labelId="cat-label"
                        value={formData.category_id}
                        label="Category"
                        onChange={handleCategoryChange}
                      >
                        <MenuItem value="">
                          <em>— None —</em>
                        </MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat.code} value={cat.code}>
                            {cat.code}
                            {cat.desc ? ` - ${cat.desc}` : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </div>
                <div className="form-group">
                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel id="brand-label">Brand</InputLabel>
                      <Select
                        labelId="brand-label"
                        value={formData.brand_id}
                        label="Brand"
                        onChange={set("brand_id")}
                      >
                        <MenuItem value="">
                          <em>— None —</em>
                        </MenuItem>
                        {brands.map((b) => (
                          <MenuItem key={b.code} value={b.code}>
                            {b.code}
                            {b.desc ? ` - ${b.desc}` : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
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

            {/* Section: Stock & Pricing */}
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
                Stock &amp; Pricing
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 16px",
                }}
              >
                <div className="form-group">
                  <label>Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.qty}
                    onChange={set("qty")}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Unit Cost (USD $ or KHR ៛)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={set("unit_cost")}
                    placeholder="0.00"
                  />
                  <small style={{ color: "#666", fontSize: "11px", display: "block", marginTop: "4px" }}>
                    Supports: $0.01, $0.10, $1.00 or Riel amounts
                  </small>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 16px",
                }}
              >
                <div className="form-group">
                  <label>Stock Date</label>
                  <input
                    type="date"
                    value={formData.stock_date}
                    onChange={set("stock_date")}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={formData.exp_date}
                    onChange={set("exp_date")}
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

            {/* Section: Additional Info */}
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
                Additional Information
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 16px",
                }}
              >
                <div className="form-group">
                  <label>Telegram</label>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={set("telegram")}
                    placeholder="@username"
                  />
                </div>
                <div className="form-group">
                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        value={formData.status}
                        label="Status"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                      >
                        <MenuItem value="">
                          <em>— None —</em>
                        </MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="unavailable">Unavailable</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </div>
              </div>
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
                        borderRadius: 4,
                        padding: 4,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #f0f0f0",
                margin: "4px 0 16px",
              }}
            />

            {/* Remark */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Remark</label>
              <textarea
                value={formData.remark}
                onChange={set("remark")}
                placeholder="Optional notes..."
                rows="2"
              />
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

export default ProductPage;
