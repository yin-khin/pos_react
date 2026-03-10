// import React, { useState, useEffect } from "react";
// import request from "../../../utils/request";
// import { showAlert, showConfirm } from "../../../utils/alert";
// import {
//   Box,
//   InputLabel,
//   MenuItem,
//   FormControl,
//   Select,
//   Dialog,
//   DialogContent,
//   DialogTitle,
// } from "@mui/material";
// import "../../feature/category/category.css";

// const emptyForm = {
//   prd_id: "",
//   prd_name: "",
//   category_id: "",
//   brand_id: "",
//   stock_date: "",
//   exp_date: "",
//   qty: "",
//   unit_cost: "",
//   remark: "",
//   telegram: "",
//   photo: "",
//   status: "",
// };

// const ProductPage = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [allBrands, setAllBrands] = useState([]);
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState(emptyForm);
//   const [photoFile, setPhotoFile] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState("");

//   useEffect(() => {
//     fetchProducts();
//     fetchCategories();
//     fetchBrands();
//   }, []);

//   useEffect(() => {
//     if (searchKeyword.trim()) {
//       const kw = searchKeyword.toLowerCase();
//       setFilteredProducts(
//         products.filter(
//           (p) =>
//             p.prd_id.toLowerCase().includes(kw) ||
//             (p.prd_name && p.prd_name.toLowerCase().includes(kw)) ||
//             (p.category_id && p.category_id.toLowerCase().includes(kw)) ||
//             (p.brand_id && p.brand_id.toLowerCase().includes(kw)),
//         ),
//       );
//     } else {
//       setFilteredProducts(products);
//     }
//     setCurrentPage(1);
//   }, [searchKeyword, products]);

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const response = await request("/api/products", "GET");
//       console.log("Products API response:", response);

//       if (response.success && response.products) {
//         setProducts(response.products);
//       } else if (Array.isArray(response)) {
//         setProducts(response);
//       } else {
//         console.error("Unexpected response format:", response);
//         showAlert("error", "Unexpected response format");
//         setProducts([]);
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       showAlert("error", "Error fetching products");
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const response = await request("/api/categories", "GET");
//       console.log("Categories API response:", response);

//       if (response.success && response.category) {
//         setCategories(response.category);
//       } else if (Array.isArray(response)) {
//         setCategories(response);
//       } else {
//         console.error("Unexpected categories response:", response);
//         setCategories([]);
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       setCategories([]);
//     }
//   };

//   const fetchBrands = async () => {
//     try {
//       const response = await request("/api/brands", "GET");
//       console.log("Brands API response:", response);

//       if (response.success && response.brand) {
//         setBrands(response.brand);
//         setAllBrands(response.brand);
//       } else if (Array.isArray(response)) {
//         setBrands(response);
//         setAllBrands(response);
//       } else {
//         console.error("Unexpected brands response:", response);
//         setBrands([]);
//         setAllBrands([]);
//       }
//     } catch (error) {
//       console.error("Error fetching brands:", error);
//       setBrands([]);
//       setAllBrands([]);
//     }
//   };

//   const handleAddProduct = () => {
//     setFormData(emptyForm);
//     setEditingId(null);
//     setBrands(allBrands);
//     setPhotoFile(null);
//     setPhotoPreview("");
//     setShowForm(true);
//   };

//   const handleEditProduct = async (product) => {
//     setFormData({
//       prd_id: product.prd_id,
//       prd_name: product.prd_name || "",
//       category_id: product.category_id || "",
//       brand_id: product.brand_id || "",
//       stock_date: product.stock_date ? product.stock_date.slice(0, 10) : "",
//       exp_date: product.exp_date ? product.exp_date.slice(0, 10) : "",
//       qty: product.qty ?? "",
//       unit_cost: product.unit_cost ?? "",
//       remark: product.remark || "",
//       telegram: product.telegram || "",
//       status: product.status || "",
//       photo: product.photo || "",
//     });
//     setEditingId(product.prd_id);
//     setPhotoFile(null);
//     setPhotoPreview(product.photo || "");

//     if (product.category_id) {
//       try {
//         const response = await request(
//           `/api/brands?categories=${product.category_id}`,
//           "GET",
//         );
//         if (response.success && response.brand) {
//           setBrands(response.brand);
//         } else {
//           setBrands(allBrands);
//         }
//       } catch (error) {
//         console.error("Error fetching brands by category:", error);
//         setBrands(allBrands);
//       }
//     } else {
//       setBrands(allBrands);
//     }

//     setShowForm(true);
//   };

//   const handleDeleteProduct = async (prd_id) => {
//     const result = await showConfirm(
//       "Are you sure?",
//       `Delete product "${prd_id}"? This action cannot be undone.`,
//       "Yes, delete it!",
//     );
//     if (result.isConfirmed) {
//       try {
//         const response = await request(`/api/products/${prd_id}`, "DELETE");
//         if (response.success || response.message) {
//           showAlert("success", "Product deleted successfully");
//           fetchProducts();
//         } else {
//           showAlert("error", response.message || "Error deleting product");
//         }
//       } catch (error) {
//         console.error("Error deleting product:", error);
//         showAlert("error", "Error deleting product");
//       }
//     }
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPhotoFile(file);

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPhotoPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.prd_id.trim()) {
//       showAlert("warning", "Product ID is required");
//       return;
//     }
//     if (!formData.prd_name.trim()) {
//       showAlert("warning", "Product name is required");
//       return;
//     }

//     try {
//       let photoData = formData.photo;
//       if (photoFile) {
//         const reader = new FileReader();
//         photoData = await new Promise((resolve) => {
//           reader.onloadend = () => resolve(reader.result);
//           reader.readAsDataURL(photoFile);
//         });
//       }

//       let response;
//       const productData = {
//         prd_id: editingId || formData.prd_id,
//         prd_name: formData.prd_name,
//         category_id: formData.category_id || null,
//         brand_id: formData.brand_id || null,
//         stock_date: formData.stock_date || null,
//         exp_date: formData.exp_date || null,
//         qty: formData.qty !== "" ? Number(formData.qty) : null,
//         unit_cost:
//           formData.unit_cost !== "" ? Number(formData.unit_cost) : null,
//         remark: formData.remark || null,
//         telegram: formData.telegram || null,
//         status: formData.status || null,
//         photo: photoData || null,
//       };

//       if (editingId) {
//         response = await request(
//           `/api/products/${editingId}`,
//           "PUT",
//           productData,
//         );
//       } else {
//         response = await request("/api/products", "POST", productData);
//       }

//       if (response.success || response.message) {
//         showAlert(
//           "success",
//           editingId
//             ? "Product updated successfully"
//             : "Product created successfully",
//         );
//         setShowForm(false);
//         fetchProducts();
//       } else {
//         showAlert("error", response.message || "Error saving product");
//       }
//     } catch (error) {
//       console.error("Error saving product:", error);
//       showAlert("error", "Error saving product");
//     }
//   };

//   const set = (field) => (e) =>
//     setFormData((prev) => ({ ...prev, [field]: e.target.value }));

//   const handleCategoryChange = async (e) => {
//     const categoryId = e.target.value;
//     setFormData((prev) => ({ ...prev, category_id: categoryId, brand_id: "" }));

//     if (!categoryId) {
//       setBrands(allBrands);
//       return;
//     }

//     try {
//       const response = await request(
//         `/api/brands?categories=${categoryId}`,
//         "GET",
//       );
//       console.log("Brands by category response:", response);

//       if (response.success && response.brand) {
//         setBrands(response.brand);
//       } else {
//         console.log("No brands found for category, showing all brands");
//         setBrands(allBrands);
//       }
//     } catch (error) {
//       console.error("Error fetching brands by category:", error);
//       setBrands(allBrands);
//     }
//   };

//   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedProducts = filteredProducts.slice(
//     startIndex,
//     startIndex + itemsPerPage,
//   );

//   const getCategoryLabel = (id) => {
//     if (!id) return "-";
//     const cat = categories.find((c) => c.code === id);
//     return cat ? `${cat.code}${cat.desc ? ` - ${cat.desc}` : ""}` : id;
//   };

//   const getBrandLabel = (id) => {
//     if (!id) return "-";
//     const b = allBrands.find((br) => br.code === id);
//     return b ? `${b.code}${b.desc ? ` - ${b.desc}` : ""}` : id;
//   };

//   return (
//     <div className="category-container">
//       {/* Header */}
//       <div className="category-header">
//         <h1 className="category-title">Product Management</h1>
//         <button className="btn-add-category" onClick={handleAddProduct}>
//           + Add New Product
//         </button>
//       </div>

//       {/* Controls */}
//       <div className="category-controls">
//         <div className="items-per-page">
//           <label>Show</label>
//           <select
//             value={itemsPerPage}
//             onChange={(e) => {
//               setItemsPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//           </select>
//           <span>products per page</span>
//         </div>
//         <div className="search-box">
//           <label>Search products:</label>
//           <input
//             type="text"
//             placeholder="Search by ID, name, category, brand..."
//             value={searchKeyword}
//             onChange={(e) => setSearchKeyword(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div className="loading">Loading...</div>
//       ) : (
//         <>
//           <table className="category-table">
//             <thead>
//               <tr>
//                 <th>Product ID</th>
//                 <th>Name</th>
//                 <th>Category</th>
//                 <th>Brand</th>
//                 <th>Qty</th>
//                 <th>Unit Cost</th>
//                 <th>Telegram</th>
//                 <th>Photo</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedProducts.length > 0 ? (
//                 paginatedProducts.map((product) => (
//                   <tr key={product.prd_id}>
//                     <td>{product.prd_id}</td>
//                     <td>{product.prd_name || "-"}</td>
//                     <td>{getCategoryLabel(product.category_id)}</td>
//                     <td>{getBrandLabel(product.brand_id)}</td>
//                     <td>{product.qty ?? "-"}</td>
//                     <td style={{ color: "green", fontWeight: "600" }}>
//                       {product.unit_cost != null
//                         ? `$${parseFloat(product.unit_cost).toFixed(2)}`
//                         : "-"}
//                     </td>
//                     <td>{product.telegram || "-"}</td>
//                     <td>
//                       {product.photo ? (
//                         <img
//                           src={product.photo}
//                           alt="Product"
//                           style={{
//                             width: 40,
//                             height: 40,
//                             objectFit: "cover",
//                             borderRadius: 4,
//                           }}
//                         />
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>
//                       <span className={`status-badge status-${product.status}`}>
//                         {product.status || "-"}
//                       </span>
//                     </td>
//                     <td className="actions">
//                       <button
//                         className="btn-edit"
//                         onClick={() => handleEditProduct(product)}
//                       >
//                         ✎ Edit
//                       </button>
//                       <button
//                         className="btn-delete"
//                         onClick={() => handleDeleteProduct(product.prd_id)}
//                       >
//                         🗑 Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="10" className="no-data">
//                     No products found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           <div className="pagination-info">
//             Showing {startIndex + 1} to{" "}
//             {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
//             {filteredProducts.length} products
//           </div>

//           <div className="pagination-controls">
//             <button
//               className="btn-pagination"
//               onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//               disabled={currentPage === 1}
//             >
//               Previous
//             </button>
//             <div className="page-numbers">
//               {Array.from({ length: totalPages }, (_, i) => (
//                 <button
//                   key={i + 1}
//                   className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
//                   onClick={() => setCurrentPage(i + 1)}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//             </div>
//             <button
//               className="btn-pagination"
//               onClick={() =>
//                 setCurrentPage(Math.min(totalPages, currentPage + 1))
//               }
//               disabled={currentPage === totalPages}
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}

//       {/* MUI Dialog with Scrollable Form */}
//       <Dialog
//         open={showForm}
//         onClose={() => setShowForm(false)}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           style: {
//             maxHeight: "90vh",
//           },
//         }}
//       >
//         <DialogTitle>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div
//               style={{
//                 width: 36,
//                 height: 36,
//                 borderRadius: "50%",
//                 background: editingId ? "#fff3cd" : "#d4edda",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: 18,
//               }}
//             >
//               {editingId ? "✎" : "+"}
//             </div>
//             <div>
//               <h2 style={{ margin: 0, fontSize: 18, color: "#1a3a52" }}>
//                 {editingId ? "Edit Product" : "Add New Product"}
//               </h2>
//               <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
//                 {editingId
//                   ? `Editing: ${editingId}`
//                   : "Fill in the details below"}
//               </p>
//             </div>
//           </div>
//         </DialogTitle>

//         <DialogContent dividers sx={{ padding: "20px 24px" }}>
//           <form onSubmit={handleFormSubmit}>
//             {/* Section: Basic Info */}
//             <div style={{ marginBottom: 6 }}>
//               <p
//                 style={{
//                   margin: "0 0 12px",
//                   fontSize: 11,
//                   fontWeight: 700,
//                   color: "#28a745",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.08em",
//                 }}
//               >
//                 Basic Information
//               </p>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "0 16px",
//                 }}
//               >
//                 <div className="form-group">
//                   <label>
//                     Product ID <span style={{ color: "#dc3545" }}>*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.prd_id}
//                     onChange={set("prd_id")}
//                     disabled={!!editingId}
//                     placeholder="e.g. PRD-001"
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>
//                     Product Name <span style={{ color: "#dc3545" }}>*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.prd_name}
//                     onChange={set("prd_name")}
//                     placeholder="Enter product name"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             <hr
//               style={{
//                 border: "none",
//                 borderTop: "1px solid #f0f0f0",
//                 margin: "4px 0 16px",
//               }}
//             />

//             {/* Section: Classification */}
//             <div style={{ marginBottom: 6 }}>
//               <p
//                 style={{
//                   margin: "0 0 12px",
//                   fontSize: 11,
//                   fontWeight: 700,
//                   color: "#28a745",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.08em",
//                 }}
//               >
//                 Classification
//               </p>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "0 16px",
//                 }}
//               >
//                 <div className="form-group">
//                   <Box>
//                     <FormControl fullWidth size="small">
//                       <InputLabel id="cat-label">Category</InputLabel>
//                       <Select
//                         labelId="cat-label"
//                         value={formData.category_id}
//                         label="Category"
//                         onChange={handleCategoryChange}
//                       >
//                         <MenuItem value="">
//                           <em>— None —</em>
//                         </MenuItem>
//                         {categories.map((cat) => (
//                           <MenuItem key={cat.code} value={cat.code}>
//                             {cat.code}
//                             {cat.desc ? ` - ${cat.desc}` : ""}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </div>
//                 <div className="form-group">
//                   <Box>
//                     <FormControl fullWidth size="small">
//                       <InputLabel id="brand-label">Brand</InputLabel>
//                       <Select
//                         labelId="brand-label"
//                         value={formData.brand_id}
//                         label="Brand"
//                         onChange={set("brand_id")}
//                       >
//                         <MenuItem value="">
//                           <em>— None —</em>
//                         </MenuItem>
//                         {brands.map((b) => (
//                           <MenuItem key={b.code} value={b.code}>
//                             {b.code}
//                             {b.desc ? ` - ${b.desc}` : ""}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </div>
//               </div>
//             </div>

//             <hr
//               style={{
//                 border: "none",
//                 borderTop: "1px solid #f0f0f0",
//                 margin: "4px 0 16px",
//               }}
//             />

//             {/* Section: Stock & Pricing */}
//             <div style={{ marginBottom: 6 }}>
//               <p
//                 style={{
//                   margin: "0 0 12px",
//                   fontSize: 11,
//                   fontWeight: 700,
//                   color: "#28a745",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.08em",
//                 }}
//               >
//                 Stock &amp; Pricing
//               </p>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "0 16px",
//                 }}
//               >
//                 <div className="form-group">
//                   <label>Qty</label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={formData.qty}
//                     onChange={set("qty")}
//                     placeholder="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Unit Cost (USD $ or KHR ៛)</label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={formData.unit_cost}
//                     onChange={set("unit_cost")}
//                     placeholder="0.00"
//                   />
//                   <small style={{ color: "#666", fontSize: "11px", display: "block", marginTop: "4px" }}>
//                     Supports: $0.01, $0.10, $1.00 or Riel amounts
//                   </small>
//                 </div>
//               </div>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "0 16px",
//                 }}
//               >
//                 <div className="form-group">
//                   <label>Stock Date</label>
//                   <input
//                     type="date"
//                     value={formData.stock_date}
//                     onChange={set("stock_date")}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Expiry Date</label>
//                   <input
//                     type="date"
//                     value={formData.exp_date}
//                     onChange={set("exp_date")}
//                   />
//                 </div>
//               </div>
//             </div>

//             <hr
//               style={{
//                 border: "none",
//                 borderTop: "1px solid #f0f0f0",
//                 margin: "4px 0 16px",
//               }}
//             />

//             {/* Section: Additional Info */}
//             <div style={{ marginBottom: 6 }}>
//               <p
//                 style={{
//                   margin: "0 0 12px",
//                   fontSize: 11,
//                   fontWeight: 700,
//                   color: "#28a745",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.08em",
//                 }}
//               >
//                 Additional Information
//               </p>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "0 16px",
//                 }}
//               >
//                 <div className="form-group">
//                   <label>Telegram</label>
//                   <input
//                     type="text"
//                     value={formData.telegram}
//                     onChange={set("telegram")}
//                     placeholder="@username"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <Box>
//                     <FormControl fullWidth size="small">
//                       <InputLabel id="status-label">Status</InputLabel>
//                       <Select
//                         labelId="status-label"
//                         value={formData.status}
//                         label="Status"
//                         onChange={(e) =>
//                           setFormData((prev) => ({
//                             ...prev,
//                             status: e.target.value,
//                           }))
//                         }
//                       >
//                         <MenuItem value="">
//                           <em>— None —</em>
//                         </MenuItem>
//                         <MenuItem value="low">Low</MenuItem>
//                         <MenuItem value="available">Available</MenuItem>
//                         <MenuItem value="unavailable">Unavailable</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </div>
//               </div>
//               <div className="form-group">
//                 <label>Photo Upload</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handlePhotoChange}
//                 />
//                 {photoPreview && (
//                   <div style={{ marginTop: 10 }}>
//                     <img
//                       src={photoPreview}
//                       alt="Preview"
//                       style={{
//                         maxWidth: 200,
//                         maxHeight: 200,
//                         objectFit: "contain",
//                         border: "1px solid #ddd",
//                         borderRadius: 4,
//                         padding: 4,
//                       }}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             <hr
//               style={{
//                 border: "none",
//                 borderTop: "1px solid #f0f0f0",
//                 margin: "4px 0 16px",
//               }}
//             />

//             {/* Remark */}
//             <div className="form-group" style={{ marginBottom: 0 }}>
//               <label>Remark</label>
//               <textarea
//                 value={formData.remark}
//                 onChange={set("remark")}
//                 placeholder="Optional notes..."
//                 rows="2"
//               />
//             </div>

//             {/* Actions */}
//             <div className="form-actions" style={{ marginTop: 20 }}>
//               <button
//                 type="submit"
//                 className="btn-submit"
//                 style={{ minWidth: 100 }}
//               >
//                 {editingId ? "💾 Update" : "✚ Create"}
//               </button>
//               <button
//                 type="button"
//                 className="btn-cancel"
//                 onClick={() => setShowForm(false)}
//                 style={{ minWidth: 90 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default ProductPage;

import React, { useState, useEffect, useRef } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  

  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes shimmer  { from { background-position:200% 0; } to { background-position:-200% 0; } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes slideIn  { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }

  .pp-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .pp-root {
    font-family: 'DM Sans', sans-serif;
    background: #f4f6fa; min-height: 100vh; padding: 28px 32px;
  }

  /* ── Header ── */
  .pp-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px; animation: fadeUp 0.4s ease both;
  }
  .pp-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 28px; color: #1a1d2e;
  }
  .pp-btn-add {
    display: inline-flex; align-items: center; gap: 8px;
    background: #22c55e; color: #fff; border: none; border-radius: 11px;
    padding: 11px 22px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13.5px;
    box-shadow: 0 4px 14px rgba(34,197,94,0.38); transition: all 0.18s;
  }
  .pp-btn-add:hover { background: #16a34a; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(34,197,94,0.45); }

  /* ── Controls ── */
  .pp-controls {
    display: flex; align-items: center; justify-content: space-between;
    background: #fff; border-radius: 13px 13px 0 0; padding: 14px 20px;
    border: 1px solid #e8ecf4; border-bottom: none;
    animation: fadeUp 0.4s ease 0.05s both;
  }
  .pp-ctrl-left { display: flex; align-items: center; gap: 9px; font-size: 13px; color: #8892aa; }
  .pp-select {
    border: 1px solid #e8ecf4; border-radius: 8px; padding: 6px 11px;
    font-family: 'DM Sans',sans-serif; font-size: 13px; color: #1a1d2e;
    background: #f4f6fa; cursor: pointer; outline: none;
  }
  .pp-search {
    display: flex; align-items: center; gap: 8px;
    border: 1px solid #e8ecf4; border-radius: 9px; padding: 8px 13px;
    background: #f4f6fa; transition: border 0.15s;
  }
  .pp-search:focus-within { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
  .pp-search input {
    border: none; background: transparent; outline: none;
    font-family: 'DM Sans',sans-serif; font-size: 13px; color: #1a1d2e; width: 240px;
  }
  .pp-search input::placeholder { color: #adb5c9; }

  /* ── Table ── */
  .pp-table-wrap {
    background: #fff; border-radius: 0 0 14px 14px;
    border: 1px solid #e8ecf4; overflow: hidden;
    box-shadow: 0 2px 16px rgba(0,0,0,0.055);
    animation: fadeUp 0.4s ease 0.1s both;
  }
  .pp-table { width: 100%; border-collapse: collapse; }
  .pp-table thead tr { background: #22c55e; }
  .pp-table thead th {
    padding: 13px 15px; text-align: left;
    font-weight: 700; font-size: 12.5px; color: #fff;
    white-space: nowrap; letter-spacing: 0.2px;
  }
  .pp-table tbody tr { border-bottom: 1px solid #f0f2f8; transition: background 0.12s; }
  .pp-table tbody tr:last-child { border-bottom: none; }
  .pp-table tbody tr:hover { background: #f8fafd; }
  .pp-table tbody td { padding: 12px 15px; font-size: 13px; color: #2d3249; vertical-align: middle; }
  .pp-price { color: #22c55e; font-weight: 700; }

  .pp-badge {
    display: inline-flex; align-items: center; padding: 3px 11px;
    border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
  }
  .pp-badge.available   { background: rgba(34,197,94,0.12); color: #16a34a; }
  .pp-badge.low         { background: rgba(245,158,11,0.12); color: #d97706; }
  .pp-badge.unavailable { background: rgba(239,68,68,0.11);  color: #dc2626; }

  .pp-photo { width: 38px; height: 38px; border-radius: 8px; object-fit: cover; border: 1.5px solid #e8ecf4; }
  .pp-no-photo {
    width: 38px; height: 38px; border-radius: 8px;
    background: #f0f2f8; display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: #c4ccdf;
  }

  .pp-btn-edit {
    background: #f59e0b; color: #fff; border: none; border-radius: 7px;
    padding: 6px 14px; cursor: pointer; font-size: 12px; font-weight: 600;
    display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s;
  }
  .pp-btn-edit:hover { background: #d97706; }
  .pp-btn-del {
    background: #ef4444; color: #fff; border: none; border-radius: 7px;
    padding: 6px 14px; cursor: pointer; font-size: 12px; font-weight: 600;
    display: inline-flex; align-items: center; gap: 5px; margin-left: 7px; transition: all 0.15s;
  }
  .pp-btn-del:hover { background: #b91c1c; }

  /* ── Pagination ── */
  .pp-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-top: 1px solid #f0f2f8;
    font-size: 13px; color: #8892aa; background: #fff;
    border-radius: 0 0 14px 14px;
  }
  .pp-page-btns { display: flex; gap: 6px; }
  .pp-page-btn {
    border: 1px solid #e8ecf4; background: #fff; border-radius: 8px;
    padding: 6px 14px; cursor: pointer; font-size: 13px; color: #8892aa;
    font-family: 'DM Sans',sans-serif; transition: all 0.14s;
  }
  .pp-page-btn:hover:not(:disabled) { background: #f4f6fa; }
  .pp-page-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; font-weight: 600; }
  .pp-page-btn:disabled { opacity: 0.38; cursor: not-allowed; }

  /* ── Skeleton ── */
  .pp-skel {
    border-radius: 7px; background: linear-gradient(90deg,#f0f2f8 25%,#e6eaf4 50%,#f0f2f8 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite;
  }

  /* ── Modal Overlay ── */
  .pp-overlay {
    position: fixed; inset: 0; background: rgba(10,14,28,0.52);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; animation: fadeIn 0.18s ease; padding: 20px;
  }
  .pp-modal {
    background: #fff; border-radius: 18px; width: 680px; max-width: 100%;
    max-height: 92vh; display: flex; flex-direction: column;
    box-shadow: 0 24px 60px rgba(0,0,0,0.22);
    animation: slideIn 0.22s ease both;
  }
  .pp-modal-head {
    padding: 22px 26px 18px; border-bottom: 1px solid #f0f2f8;
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .pp-modal-head-left { display: flex; align-items: center; gap: 13px; }
  .pp-modal-icon {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
  }
  .pp-modal-icon.edit   { background: #fff8e6; }
  .pp-modal-icon.create { background: #e6faf0; }
  .pp-modal-htitle { font-family:'Syne',sans-serif; font-weight:700; font-size:18px; color:#1a1d2e; }
  .pp-modal-hsub   { font-size:12px; color:#9aa0b4; margin-top:2px; }
  .pp-modal-close {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e8ecf4;
    background: #f4f6fa; cursor: pointer; display: flex; align-items: center;
    justify-content: center; color: #8892aa; font-size: 18px; transition: all 0.14s;
  }
  .pp-modal-close:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

  .pp-modal-body { overflow-y: auto; padding: 22px 26px; flex: 1; }
  .pp-modal-body::-webkit-scrollbar { width: 5px; }
  .pp-modal-body::-webkit-scrollbar-thumb { background: #dde1ed; border-radius: 3px; }

  /* ── Form Sections ── */
  .pp-section-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 10.5px; font-weight: 800; letter-spacing: 1.4px;
    text-transform: uppercase; color: #22c55e; margin-bottom: 14px;
  }
  .pp-section-label::after {
    content: ''; flex: 1; height: 1px; background: #f0f2f8;
  }
  .pp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .pp-grid-1 { display: grid; grid-template-columns: 1fr; gap: 14px; }

  .pp-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 2px; }
  .pp-label {
    font-size: 11.5px; font-weight: 700; color: #8892aa;
    letter-spacing: 0.6px; text-transform: uppercase;
  }
  .pp-label .req { color: #ef4444; margin-left: 2px; }
  .pp-input, .pp-textarea, .pp-native-select {
    border: 1.5px solid #e8ecf4; border-radius: 9px; padding: 10px 13px;
    font-family: 'DM Sans',sans-serif; font-size: 13.5px; color: #1a1d2e;
    background: #fafbfd; outline: none; transition: all 0.16s; width: 100%;
  }
  .pp-input:focus, .pp-textarea:focus, .pp-native-select:focus {
    border-color: #22c55e; background: #fff;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
  }
  .pp-input:disabled { background: #f0f2f8; color: #8892aa; cursor: not-allowed; }
  .pp-textarea { resize: vertical; min-height: 76px; }
  .pp-native-select { cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238892aa' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 32px;
  }
  .pp-hint { font-size: 11px; color: #9aa0b4; margin-top: 3px; }

  /* photo upload */
  .pp-upload-zone {
    border: 2px dashed #e8ecf4; border-radius: 10px; padding: 18px;
    text-align: center; cursor: pointer; transition: all 0.18s; background: #fafbfd;
    position: relative;
  }
  .pp-upload-zone:hover { border-color: #22c55e; background: #f0fdf4; }
  .pp-upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  .pp-upload-icon { font-size: 28px; margin-bottom: 6px; }
  .pp-upload-text { font-size: 13px; color: #8892aa; }
  .pp-upload-text strong { color: #22c55e; }
  .pp-preview-wrap { margin-top: 12px; display: flex; align-items: center; gap: 12px; }
  .pp-preview-img { width: 72px; height: 72px; object-fit: cover; border-radius: 10px; border: 2px solid #e8ecf4; }
  .pp-preview-remove {
    background: #fee2e2; color: #ef4444; border: none; border-radius: 7px;
    padding: 5px 12px; cursor: pointer; font-size: 12px; font-weight: 600;
    transition: all 0.14s;
  }
  .pp-preview-remove:hover { background: #fecaca; }

  /* modal footer */
  .pp-modal-foot {
    padding: 16px 26px; border-top: 1px solid #f0f2f8;
    display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-shrink: 0;
  }
  .pp-btn-cancel {
    border: 1.5px solid #e8ecf4; background: #fff; border-radius: 10px;
    padding: 10px 22px; cursor: pointer; font-family:'DM Sans',sans-serif;
    font-size: 13.5px; font-weight: 500; color: #6b7280; transition: all 0.15s;
  }
  .pp-btn-cancel:hover { background: #f4f6fa; }
  .pp-btn-save {
    background: #22c55e; color: #fff; border: none; border-radius: 10px;
    padding: 10px 26px; cursor: pointer; font-family:'DM Sans',sans-serif;
    font-size: 13.5px; font-weight: 700; transition: all 0.18s;
    box-shadow: 0 4px 12px rgba(34,197,94,0.35); display: flex; align-items: center; gap: 7px;
  }
  .pp-btn-save:hover { background: #16a34a; transform: translateY(-1px); }
  .pp-btn-save:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .pp-no-data { text-align:center; padding: 42px 0; color: #9aa0b4; font-size: 14px; }
`;

// ─── Empty form ───────────────────────────────────────────────────────────────
const emptyForm = {
  prd_id: "", prd_name: "", category_id: "", brand_id: "",
  stock_date: "", exp_date: "", qty: "", unit_cost: "",
  remark: "", telegram: "", photo: "", status: "",
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[80,120,100,90,40,70,90,42,80,100].map((w, i) => (
      <td key={i} style={{ padding: "14px 15px" }}>
        <div className="pp-skel" style={{ height: 14, width: w }} />
      </td>
    ))}
  </tr>
);

// ─── Field component ──────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
  <div className="pp-field">
    <label className="pp-label">{label}{required && <span className="req"> *</span>}</label>
    {children}
    {hint && <span className="pp-hint">{hint}</span>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
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
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileRef = useRef();

  useEffect(() => { fetchProducts(); fetchCategories(); fetchBrands(); }, []);

  useEffect(() => {
    const kw = searchKeyword.trim().toLowerCase();
    setFilteredProducts(kw
      ? products.filter(p =>
          p.prd_id.toLowerCase().includes(kw) ||
          (p.prd_name && p.prd_name.toLowerCase().includes(kw)) ||
          (p.category_id && p.category_id.toLowerCase().includes(kw)) ||
          (p.brand_id && p.brand_id.toLowerCase().includes(kw))
        )
      : products
    );
    setCurrentPage(1);
  }, [searchKeyword, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await request("/api/products", "GET");
      if (res.success && res.products) setProducts(res.products);
      else if (Array.isArray(res)) setProducts(res);
      else { showAlert("error", "Unexpected response format"); setProducts([]); }
    } catch { showAlert("error", "Error fetching products"); setProducts([]); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await request("/api/categories", "GET");
      if (res.success && res.category) setCategories(res.category);
      else if (Array.isArray(res)) setCategories(res);
      else setCategories([]);
    } catch { setCategories([]); }
  };

  const fetchBrands = async () => {
    try {
      const res = await request("/api/brands", "GET");
      if (res.success && res.brand) { setBrands(res.brand); setAllBrands(res.brand); }
      else if (Array.isArray(res)) { setBrands(res); setAllBrands(res); }
      else { setBrands([]); setAllBrands([]); }
    } catch { setBrands([]); setAllBrands([]); }
  };

  const openAdd = () => {
    setFormData(emptyForm); setEditingId(null); setBrands(allBrands);
    setPhotoFile(null); setPhotoPreview(""); setShowForm(true);
  };

  const openEdit = async (product) => {
    setFormData({
      prd_id: product.prd_id, prd_name: product.prd_name || "",
      category_id: product.category_id || "", brand_id: product.brand_id || "",
      stock_date: product.stock_date ? product.stock_date.slice(0, 10) : "",
      exp_date: product.exp_date ? product.exp_date.slice(0, 10) : "",
      qty: product.qty ?? "", unit_cost: product.unit_cost ?? "",
      remark: product.remark || "", telegram: product.telegram || "",
      status: product.status || "", photo: product.photo || "",
    });
    setEditingId(product.prd_id);
    setPhotoFile(null); setPhotoPreview(product.photo || "");
    if (product.category_id) {
      try {
        const res = await request(`/api/brands?categories=${product.category_id}`, "GET");
        setBrands(res.success && res.brand ? res.brand : allBrands);
      } catch { setBrands(allBrands); }
    } else setBrands(allBrands);
    setShowForm(true);
  };

  const handleDelete = async (prd_id) => {
    const result = await showConfirm("Are you sure?", `Delete product "${prd_id}"? This cannot be undone.`, "Yes, delete it!");
    if (!result.isConfirmed) return;
    try {
      const res = await request(`/api/products/${prd_id}`, "DELETE");
      if (res.success || res.message) { showAlert("success", "Product deleted successfully"); fetchProducts(); }
      else showAlert("error", res.message || "Error deleting product");
    } catch { showAlert("error", "Error deleting product"); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = async (e) => {
    const catId = e.target.value;
    setFormData(prev => ({ ...prev, category_id: catId, brand_id: "" }));
    if (!catId) { setBrands(allBrands); return; }
    try {
      const res = await request(`/api/brands?categories=${catId}`, "GET");
      setBrands(res.success && res.brand ? res.brand : allBrands);
    } catch { setBrands(allBrands); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.prd_id.trim()) { showAlert("warning", "Product ID is required"); return; }
    if (!formData.prd_name.trim()) { showAlert("warning", "Product name is required"); return; }
    setSaving(true);
    try {
      let photoData = formData.photo;
      if (photoFile) {
        const reader = new FileReader();
        photoData = await new Promise(res => { reader.onloadend = () => res(reader.result); reader.readAsDataURL(photoFile); });
      }
      const body = {
        prd_id: editingId || formData.prd_id, prd_name: formData.prd_name,
        category_id: formData.category_id || null, brand_id: formData.brand_id || null,
        stock_date: formData.stock_date || null, exp_date: formData.exp_date || null,
        qty: formData.qty !== "" ? Number(formData.qty) : null,
        unit_cost: formData.unit_cost !== "" ? Number(formData.unit_cost) : null,
        remark: formData.remark || null, telegram: formData.telegram || null,
        status: formData.status || null, photo: photoData || null,
      };
      const res = editingId
        ? await request(`/api/products/${editingId}`, "PUT", body)
        : await request("/api/products", "POST", body);
      if (res.success || res.message) {
        showAlert("success", editingId ? "Product updated successfully" : "Product created successfully");
        setShowForm(false); fetchProducts();
      } else showAlert("error", res.message || "Error saving product");
    } catch { showAlert("error", "Error saving product"); }
    finally { setSaving(false); }
  };

  const set = (k) => (e) => setFormData(p => ({ ...p, [k]: e.target.value }));

  const getCategoryLabel = (id) => {
    if (!id) return "—";
    const c = categories.find(c => c.code === id);
    return c ? `${c.code}${c.desc ? ` - ${c.desc}` : ""}` : id;
  };
  const getBrandLabel = (id) => {
    if (!id) return "—";
    const b = allBrands.find(b => b.code === id);
    return b ? `${b.code}${b.desc ? ` - ${b.desc}` : ""}` : id;
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pageRows = filteredProducts.slice(start, start + itemsPerPage);

  return (
    <>
      <style>{CSS}</style>
      <div className="pp-root">

        {/* ── Header ── */}
        <div className="pp-header">
          <h1 className="pp-title">Product Management</h1>
          <button className="pp-btn-add" onClick={openAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Add New Product
          </button>
        </div>

        {/* ── Controls ── */}
        <div className="pp-controls">
          <div className="pp-ctrl-left">
            <span>Show</span>
            <select className="pp-select" value={itemsPerPage} onChange={e => { setItemsPerPage(+e.target.value); setCurrentPage(1); }}>
              {[5,10,20,50].map(n => <option key={n}>{n}</option>)}
            </select>
            <span>products per page</span>
          </div>
          <div className="pp-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8892aa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search by ID, name, category, brand..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
            {searchKeyword && (
              <button onClick={() => setSearchKeyword("")} style={{ background:"none",border:"none",cursor:"pointer",color:"#8892aa",fontSize:16,lineHeight:1,padding:0 }}>×</button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="pp-table-wrap">
          <table className="pp-table">
            <thead>
              <tr>
                {["Product ID","Name","Category","Brand","Qty","Unit Cost","Telegram","Photo","Status","Actions"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                : pageRows.length > 0
                  ? pageRows.map(p => (
                    <tr key={p.prd_id}>
                      <td><strong style={{ fontFamily:"'Syne',sans-serif", fontSize:12.5 }}>{p.prd_id}</strong></td>
                      <td>{p.prd_name || "—"}</td>
                      <td>{getCategoryLabel(p.category_id)}</td>
                      <td>{getBrandLabel(p.brand_id)}</td>
                      <td><strong>{p.qty ?? "—"}</strong></td>
                      <td className="pp-price">
                        {p.unit_cost != null ? `$${parseFloat(p.unit_cost).toFixed(2)}` : "—"}
                      </td>
                      <td style={{ color:"#8892aa", fontSize:12 }}>{p.telegram || "—"}</td>
                      <td>
                        {p.photo
                          ? <img src={p.photo} alt="Product" className="pp-photo" />
                          : <div className="pp-no-photo">📦</div>
                        }
                      </td>
                      <td>
                        {p.status
                          ? <span className={`pp-badge ${p.status}`}>{p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span>
                          : "—"
                        }
                      </td>
                      <td>
                        <button className="pp-btn-edit" onClick={() => openEdit(p)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
                          Edit
                        </button>
                        <button className="pp-btn-del" onClick={() => handleDelete(p.prd_id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                  : <tr><td colSpan="10" className="pp-no-data">No products found{searchKeyword && ` for "${searchKeyword}"`}</td></tr>
              }
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && filteredProducts.length > 0 && (
            <div className="pp-pagination">
              <span>Showing {start+1}–{Math.min(start+itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products</span>
              <div className="pp-page-btns">
                <button className="pp-page-btn" disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={`pp-page-btn ${currentPage===i+1?"active":""}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                ))}
                <button className="pp-page-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal ── */}
        {showForm && (
          <div className="pp-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="pp-modal">

              {/* Modal Header */}
              <div className="pp-modal-head">
                <div className="pp-modal-head-left">
                  <div className={`pp-modal-icon ${editingId?"edit":"create"}`}>
                    {editingId ? "✎" : "✦"}
                  </div>
                  <div>
                    <div className="pp-modal-htitle">{editingId ? "Edit Product" : "Add New Product"}</div>
                    <div className="pp-modal-hsub">{editingId ? `Editing: ${editingId}` : "Fill in the details below"}</div>
                  </div>
                </div>
                <button className="pp-modal-close" onClick={() => setShowForm(false)}>×</button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
                <div className="pp-modal-body">

                  {/* ── Basic Info ── */}
                  <div className="pp-section-label">Basic Information</div>
                  <div className="pp-grid-2" style={{ marginBottom: 20 }}>
                    <Field label="Product ID" required>
                      <input className="pp-input" value={formData.prd_id} onChange={set("prd_id")} disabled={!!editingId} placeholder="e.g. PRD-001" required />
                    </Field>
                    <Field label="Product Name" required>
                      <input className="pp-input" value={formData.prd_name} onChange={set("prd_name")} placeholder="Enter product name" required />
                    </Field>
                  </div>

                  {/* ── Classification ── */}
                  <div className="pp-section-label">Classification</div>
                  <div className="pp-grid-2" style={{ marginBottom: 20 }}>
                    <Field label="Category">
                      <select className="pp-native-select" value={formData.category_id} onChange={handleCategoryChange}>
                        <option value="">— None —</option>
                        {categories.map(c => (
                          <option key={c.code} value={c.code}>{c.code}{c.desc ? ` - ${c.desc}` : ""}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Brand">
                      <select className="pp-native-select" value={formData.brand_id} onChange={set("brand_id")}>
                        <option value="">— None —</option>
                        {brands.map(b => (
                          <option key={b.code} value={b.code}>{b.code}{b.desc ? ` - ${b.desc}` : ""}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {/* ── Stock & Pricing ── */}
                  <div className="pp-section-label">Stock &amp; Pricing</div>
                  <div className="pp-grid-2" style={{ marginBottom: 14 }}>
                    <Field label="Quantity">
                      <input className="pp-input" type="number" min="0" value={formData.qty} onChange={set("qty")} placeholder="0" />
                    </Field>
                    <Field label="Unit Cost" hint="Supports: $0.01, $1.00 or Riel amounts">
                      <input className="pp-input" type="number" min="0" step="0.01" value={formData.unit_cost} onChange={set("unit_cost")} placeholder="0.00" />
                    </Field>
                  </div>
                  <div className="pp-grid-2" style={{ marginBottom: 20 }}>
                    <Field label="Stock Date">
                      <input className="pp-input" type="date" value={formData.stock_date} onChange={set("stock_date")} />
                    </Field>
                    <Field label="Expiry Date">
                      <input className="pp-input" type="date" value={formData.exp_date} onChange={set("exp_date")} />
                    </Field>
                  </div>

                  {/* ── Additional Info ── */}
                  <div className="pp-section-label">Additional Information</div>
                  <div className="pp-grid-2" style={{ marginBottom: 14 }}>
                    <Field label="Telegram">
                      <input className="pp-input" value={formData.telegram} onChange={set("telegram")} placeholder="@username or link" />
                    </Field>
                    <Field label="Status">
                      <select className="pp-native-select" value={formData.status} onChange={set("status")}>
                        <option value="">— None —</option>
                        <option value="low">Low</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </Field>
                  </div>

                  {/* Photo Upload */}
                  <Field label="Product Photo" style={{ marginBottom: 14 }}>
                    <div className="pp-upload-zone" onClick={() => fileRef.current?.click()}>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }} />
                      <div className="pp-upload-icon">🖼️</div>
                      <div className="pp-upload-text"><strong>Click to upload</strong> or drag &amp; drop</div>
                      <div style={{ fontSize:11, color:"#adb5c9", marginTop:4 }}>PNG, JPG, WEBP up to 5MB</div>
                    </div>
                    {photoPreview && (
                      <div className="pp-preview-wrap">
                        <img src={photoPreview} alt="Preview" className="pp-preview-img" />
                        <div>
                          <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>Preview</div>
                          <button type="button" className="pp-preview-remove" onClick={() => { setPhotoFile(null); setPhotoPreview(""); setFormData(p=>({...p,photo:""})); }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </Field>

                  {/* Remark */}
                  <Field label="Remark">
                    <textarea className="pp-textarea" value={formData.remark} onChange={set("remark")} placeholder="Optional notes about this product..." />
                  </Field>

                </div>

                {/* Modal Footer */}
                <div className="pp-modal-foot">
                  <button type="button" className="pp-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="pp-btn-save" disabled={saving}>
                    {saving
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-18 0"/></svg>
                      : editingId
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    }
                    {saving ? "Saving…" : editingId ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default ProductPage;