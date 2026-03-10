// import React, { useState, useEffect } from "react";
// import request from "../../../utils/request";
// import { showAlert, showConfirm } from "../../../utils/alert";
// import Box from "@mui/material/Box";
// import InputLabel from "@mui/material/InputLabel";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import Select from "@mui/material/Select";
// import "../category/category.css";

// const BrandPage = () => {
//   const [brands, setBrands] = useState([]);
//   const [filteredBrands, setFilteredBrands] = useState([]);
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [editingCode, setEditingCode] = useState(null);
//   const [formData, setFormData] = useState({ code: "", desc: "", remark: "", category_id: "" });
//   const [categories, setCategories] = useState([]);

//   // Fetch all brands and categories
//   useEffect(() => {
//     fetchBrands();
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const response = await request("/api/categories", "GET");
//       if (response.success) {
//         setCategories(response.category);
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   // Filter brands based on search keyword
//   useEffect(() => {
//     if (searchKeyword.trim()) {
//       const filtered = brands.filter(
//         (brand) =>
//           brand.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
//           (brand.desc &&
//             brand.desc.toLowerCase().includes(searchKeyword.toLowerCase())),
//       );
//       setFilteredBrands(filtered);
//     } else {
//       setFilteredBrands(brands);
//     }
//     setCurrentPage(1);
//   }, [searchKeyword, brands]);

// const fetchBrands = async () => {
//   setLoading(true);
//   try {
//     const response = await request("/api/brands", "GET");
//     if (response.success && response.brand) {
//       setBrands(response.brand);
//     }
//   } catch (error) {
//     console.error("Error fetching brands:", error);
//     showAlert("error", "Error fetching brands");
//   } finally {
//     setLoading(false);
//   }
// }

//   const handleAddBrand = () => {
//     setFormData({ code: "", desc: "", remark: "", category_id: "" });
//     setEditingCode(null);
//     setShowForm(true);
//   };

//   const handleEditBrand = (brand) => {
//     setFormData({
//       code: brand.code,
//       desc: brand.desc || "",
//       remark: brand.remark || "",
//       category_id: brand.category_id || "",
//     });
//     setEditingCode(brand.code);
//     setShowForm(true);
//   };

//   const handleDeleteBrand = async (code) => {
//   const result = await showConfirm(
//     "Are you sure?",
//     `Delete brand "${code}"? This action cannot be undone.`,
//     "Yes, delete it!"
//   );
//   if (result.isConfirmed) {
//     try {
//       const response = await request(`/api/brands/${code}`, "DELETE");
//       if (response.success) {
//         showAlert("success", "Brand deleted successfully");
//         fetchBrands();
//       } else {
//         showAlert("error", response.message || "Error deleting brand");
//       }
//     } catch (error) {
//       console.error("Error deleting brand:", error);
//       showAlert("error", "Error deleting brand");
//     }
//   }
// };
// const handleFormSubmit = async (e) => {
//   e.preventDefault();

//   if (!formData.code.trim()) {
//     showAlert("warning", "Brand code is required");
//     return;
//   }

//   try {
//     let response;
//     if (editingCode) {
//       response = await request(`/api/brands/${editingCode}`, "PUT", {
//         desc: formData.desc,
//         remark: formData.remark,
//         category_id: formData.category_id,
//       });
//     } else {
//       response = await request("/api/brands", "POST", formData);
//     }

//     if (response.success) {
//       showAlert("success", editingCode ? "Brand updated successfully" : "Brand created successfully");
//       setShowForm(false);
//       fetchBrands();
//     } else {
//       showAlert("error", response.message || "Error saving brand");
//     }
//   } catch (error) {
//     console.error("Error saving brand:", error);
//     showAlert("error", "Error saving brand");
//   }
// };

//   // Pagination calculation
//   const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

//   return (
//     <div className="category-container">
//       <div className="category-header">
//         <h1 className="category-title">Brand Management</h1>
//         <button className="btn-add-category" onClick={handleAddBrand}>
//           + Add New Brand
//         </button>
//       </div>

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
//           <span>brands per page</span>
//         </div>

//         <div className="search-box">
//           <label>Search brands:</label>
//           <input
//             type="text"
//             placeholder="Search by code or description..."
//             value={searchKeyword}
//             onChange={(e) => setSearchKeyword(e.target.value)}
//           />
//         </div>
//       </div>

//       {loading ? (
//         <div className="loading">Loading...</div>
//       ) : (
//         <>
//           <table className="category-table">
//             <thead>
//               <tr>
//                 <th>Code</th>
//                 <th>Description</th>
//                 <th>Category</th>
//                 <th>Remark</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedBrands.length > 0 ? (
//                 paginatedBrands.map((brand) => (
//                   <tr key={brand.code}>
//                     <td>{brand.code}</td>
//                     <td>{brand.desc || "-"}</td>
//                     <td>
//                       {brand.category_id
//                         ? (() => {
//                             const cat = categories.find((c) => c.code === brand.category_id);
//                             return cat ? `${cat.code}${cat.desc ? ` - ${cat.desc}` : ""}` : brand.category_id;
//                           })()
//                         : "-"}
//                     </td>
//                     <td>{brand.remark || "-"}</td>
//                     <td className="actions">
//                       <button
//                         className="btn-edit"
//                         onClick={() => handleEditBrand(brand)}
//                       >
//                         ✎ Edit
//                       </button>
//                       <button
//                         className="btn-delete"
//                         onClick={() => handleDeleteBrand(brand.code)}
//                       >
//                         🗑 Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="no-data">
//                     No brands found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           <div className="pagination-info">
//             Showing {startIndex + 1} to{" "}
//             {Math.min(endIndex, filteredBrands.length)} of{" "}
//             {filteredBrands.length} brands
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

//       {/* Modal Form */}
//       {showForm && (
//         <div className="modal-overlay" onClick={() => setShowForm(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>{editingCode ? "Edit Brand" : "Add New Brand"}</h2>
//               <button className="btn-close" onClick={() => setShowForm(false)}>
//                 ×
//               </button>
//             </div>
//             <form onSubmit={handleFormSubmit}>
//               <div className="form-group">
//                 <label>Code *</label>
//                 <input
//                   type="text"
//                   value={formData.code}
//                   onChange={(e) =>
//                     setFormData({ ...formData, code: e.target.value })
//                   }
//                   disabled={!!editingCode}
//                   placeholder="Enter brand code"
//                   required
//                 />
//               </div>

//               {/* select category (optional) */}
//               <div className="form-group">
//                 <Box>
//                   <FormControl fullWidth size="small">
//                     <InputLabel id="category-select-label">Category</InputLabel>
//                     <Select
//                       labelId="category-select-label"
//                       id="category-select"
//                       value={formData.category_id}
//                       label="Category"
//                       onChange={(e) =>
//                         setFormData({ ...formData, category_id: e.target.value })
//                       }
//                     >
//                       <MenuItem value=""><em>-- Select Category --</em></MenuItem>
//                       {categories.map((cat) => (
//                         <MenuItem key={cat.code} value={cat.code}>
//                           {cat.code}{cat.desc ? ` - ${cat.desc}` : ""}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>
//               </div>
//               <div className="form-group">
//                 <label>Description</label>
//                 <input
//                   type="text"
//                   value={formData.desc}
//                   onChange={(e) =>
//                     setFormData({ ...formData, desc: e.target.value })
//                   }
//                   placeholder="Enter description"
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Remark</label>
//                 <textarea
//                   value={formData.remark}
//                   onChange={(e) =>
//                     setFormData({ ...formData, remark: e.target.value })
//                   }
//                   placeholder="Enter remark"
//                   rows="3"
//                 />
//               </div>
//               <div className="form-actions">
//                 <button type="submit" className="btn-submit">
//                   {editingCode ? "Update" : "Create"}
//                 </button>
//                 <button
//                   type="button"
//                   className="btn-cancel"
//                   onClick={() => setShowForm(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BrandPage;

import React, { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";

// ─── Styles ────────────────────────────────────────────────────────────────────
const CSS = `
  // @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes bp-fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes bp-fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes bp-slideIn { from { opacity:0; transform:translateY(22px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes bp-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
  @keyframes bp-spin    { to { transform:rotate(360deg); } }

  .bp-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .bp-root { font-family: 'DM Sans', sans-serif; background: #f4f6fa; min-height: 100vh; padding: 28px 32px; }

  .bp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; animation: bp-fadeUp 0.4s ease both; }
  .bp-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #1a1d2e; }
  .bp-btn-add {
    display: inline-flex; align-items: center; gap: 8px;
    background: #22c55e; color: #fff; border: none; border-radius: 11px;
    padding: 11px 22px; cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 13.5px;
    box-shadow: 0 4px 14px rgba(34,197,94,0.38); transition: all 0.18s;
  }
  .bp-btn-add:hover { background: #16a34a; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(34,197,94,0.45); }

  .bp-controls {
    display: flex; align-items: center; justify-content: space-between;
    background: #fff; border-radius: 13px 13px 0 0; padding: 14px 20px;
    border: 1px solid #e8ecf4; border-bottom: none; animation: bp-fadeUp 0.4s ease 0.05s both;
  }
  .bp-ctrl-left { display: flex; align-items: center; gap: 9px; font-size: 13px; color: #8892aa; }
  .bp-perpage {
    border: 1px solid #e8ecf4; border-radius: 8px; padding: 6px 10px;
    font-family: 'DM Sans',sans-serif; font-size: 13px; color: #1a1d2e; background: #f4f6fa; outline: none;
  }
  .bp-search {
    display: flex; align-items: center; gap: 8px;
    border: 1.5px solid #e8ecf4; border-radius: 9px; padding: 8px 13px;
    background: #f4f6fa; transition: border 0.15s, box-shadow 0.15s;
  }
  .bp-search:focus-within { border-color: #22c55e; background: #fff; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
  .bp-search input { border: none; background: transparent; outline: none; font-family: 'DM Sans',sans-serif; font-size: 13px; color: #1a1d2e; width: 230px; }
  .bp-search input::placeholder { color: #adb5c9; }
  .bp-clear { background: none; border: none; cursor: pointer; color: #adb5c9; font-size: 18px; line-height: 1; padding: 0; transition: color 0.14s; }
  .bp-clear:hover { color: #ef4444; }

  .bp-table-wrap {
    background: #fff; border-radius: 0 0 14px 14px; border: 1px solid #e8ecf4;
    overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.055); animation: bp-fadeUp 0.4s ease 0.1s both;
  }
  .bp-table { width: 100%; border-collapse: collapse; }
  .bp-table thead tr { background: #22c55e; }
  .bp-table thead th { padding: 13px 16px; text-align: left; font-weight: 700; font-size: 12.5px; color: #fff; white-space: nowrap; }
  .bp-table tbody tr { border-bottom: 1px solid #f0f2f8; transition: background 0.12s; }
  .bp-table tbody tr:last-child { border-bottom: none; }
  .bp-table tbody tr:hover { background: #f8fafd; }
  .bp-table tbody td { padding: 13px 16px; font-size: 13px; color: #2d3249; vertical-align: middle; }

  .bp-code-cell { display: flex; align-items: center; gap: 10px; }
  .bp-avatar { width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Syne',sans-serif; font-weight: 800; font-size: 13px; }
  .bp-code { font-family: 'Syne',sans-serif; font-weight: 700; font-size: 12.5px; color: #1a1d2e; }
  .bp-muted { color: #9aa0b4; }
  .bp-cat-pill { display: inline-flex; align-items: center; font-weight: 600; font-size: 11.5px; padding: 3px 10px; border-radius: 20px; }

  .bp-btn-edit { background: #f59e0b; color: #fff; border: none; border-radius: 7px; padding: 6px 14px; cursor: pointer; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s; }
  .bp-btn-edit:hover { background: #d97706; }
  .bp-btn-del { background: #ef4444; color: #fff; border: none; border-radius: 7px; padding: 6px 14px; cursor: pointer; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; margin-left: 7px; transition: all 0.15s; }
  .bp-btn-del:hover { background: #b91c1c; }

  .bp-skel { display: block; border-radius: 7px; background: linear-gradient(90deg,#f0f2f8 25%,#e6eaf4 50%,#f0f2f8 75%); background-size: 200% 100%; animation: bp-shimmer 1.4s infinite; }

  .bp-pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid #f0f2f8; font-size: 13px; color: #8892aa; }
  .bp-page-btns { display: flex; gap: 6px; flex-wrap: wrap; }
  .bp-page-btn { border: 1px solid #e8ecf4; background: #fff; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 13px; color: #8892aa; font-family: 'DM Sans',sans-serif; transition: all 0.14s; }
  .bp-page-btn:hover:not(:disabled) { background: #f4f6fa; color: #1a1d2e; }
  .bp-page-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; font-weight: 600; }
  .bp-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .bp-no-data { text-align: center; padding: 44px 0; color: #9aa0b4; font-size: 14px; }

  .bp-overlay { position: fixed; inset: 0; background: rgba(10,14,28,0.52); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: bp-fadeIn 0.18s ease; padding: 20px; }
  .bp-modal { background: #fff; border-radius: 18px; width: 520px; max-width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,0.22); animation: bp-slideIn 0.22s ease both; overflow: hidden; }
  .bp-modal-head { padding: 22px 26px 18px; border-bottom: 1px solid #f0f2f8; display: flex; align-items: center; justify-content: space-between; }
  .bp-modal-head-left { display: flex; align-items: center; gap: 12px; }
  .bp-modal-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .bp-modal-icon.edit   { background: #fff8e6; }
  .bp-modal-icon.create { background: #e6faf0; }
  .bp-modal-htitle { font-family:'Syne',sans-serif; font-weight:700; font-size:17px; color:#1a1d2e; }
  .bp-modal-hsub { font-size:12px; color:#9aa0b4; margin-top:2px; }
  .bp-modal-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e8ecf4; background: #f4f6fa; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #8892aa; font-size: 18px; transition: all 0.14s; line-height: 1; }
  .bp-modal-close:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
  .bp-modal-body { padding: 22px 26px; }

  .bp-section-label { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 10.5px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; color: #22c55e; }
  .bp-section-label::after { content:''; flex:1; height:1px; background:#f0f2f8; }
  .bp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .bp-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .bp-field:last-child { margin-bottom: 0; }
  .bp-label { font-size: 11px; font-weight: 700; color: #8892aa; letter-spacing: 0.7px; text-transform: uppercase; }
  .bp-req { color: #ef4444; margin-left: 2px; }
  .bp-input, .bp-textarea, .bp-select {
    border: 1.5px solid #e8ecf4; border-radius: 9px; padding: 10px 13px;
    font-family: 'DM Sans',sans-serif; font-size: 13.5px; color: #1a1d2e;
    background: #fafbfd; outline: none; transition: all 0.16s; width: 100%;
  }
  .bp-input:focus, .bp-textarea:focus, .bp-select:focus { border-color: #22c55e; background: #fff; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
  .bp-input:disabled { background: #f0f2f8; color: #8892aa; cursor: not-allowed; }
  .bp-textarea { resize: vertical; min-height: 82px; }
  .bp-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238892aa' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 34px; }

  .bp-modal-foot { padding: 16px 26px; border-top: 1px solid #f0f2f8; display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
  .bp-btn-cancel { border: 1.5px solid #e8ecf4; background: #fff; border-radius: 10px; padding: 10px 22px; cursor: pointer; font-family:'DM Sans',sans-serif; font-size: 13.5px; font-weight: 500; color: #6b7280; transition: all 0.15s; }
  .bp-btn-cancel:hover { background: #f4f6fa; }
  .bp-btn-save { background: #22c55e; color: #fff; border: none; border-radius: 10px; padding: 10px 26px; cursor: pointer; font-family:'DM Sans',sans-serif; font-size: 13.5px; font-weight: 700; transition: all 0.18s; box-shadow: 0 4px 12px rgba(34,197,94,0.35); display: flex; align-items: center; gap: 7px; }
  .bp-btn-save:hover { background: #16a34a; transform: translateY(-1px); }
  .bp-btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const ACCENT = ["#3b82f6","#8b5cf6","#f59e0b","#22c55e","#ef4444","#06b6d4","#ec4899"];
const accentFor = (id) => id ? ACCENT[id.charCodeAt(id.length - 1) % ACCENT.length] : "#9aa0b4";

// ─── BrandPage ────────────────────────────────────────────────────────────────
const BrandPage = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({ code: "", desc: "", remark: "", category_id: "" });

  useEffect(() => { fetchBrands(); fetchCategories(); }, []);

  useEffect(() => {
    const kw = searchKeyword.trim().toLowerCase();
    setFilteredBrands(kw
      ? brands.filter(b => b.code.toLowerCase().includes(kw) || (b.desc && b.desc.toLowerCase().includes(kw)))
      : brands
    );
    setCurrentPage(1);
  }, [searchKeyword, brands]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await request("/api/brands", "GET");
      if (res.success && res.brand) setBrands(res.brand);
    } catch (err) {
      console.error("Error fetching brands:", err);
      showAlert("error", "Error fetching brands");
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await request("/api/categories", "GET");
      if (res.success) setCategories(res.category);
    } catch (err) { console.error("Error fetching categories:", err); }
  };

  const handleAddBrand = () => {
    setFormData({ code: "", desc: "", remark: "", category_id: "" });
    setEditingCode(null);
    setShowForm(true);
  };

  const handleEditBrand = (brand) => {
    setFormData({ code: brand.code, desc: brand.desc || "", remark: brand.remark || "", category_id: brand.category_id || "" });
    setEditingCode(brand.code);
    setShowForm(true);
  };

  const handleDeleteBrand = async (code) => {
    const result = await showConfirm("Are you sure?", `Delete brand "${code}"? This action cannot be undone.`, "Yes, delete it!");
    if (!result.isConfirmed) return;
    try {
      const res = await request(`/api/brands/${code}`, "DELETE");
      if (res.success) { showAlert("success", "Brand deleted successfully"); fetchBrands(); }
      else showAlert("error", res.message || "Error deleting brand");
    } catch (err) { console.error("Error deleting brand:", err); showAlert("error", "Error deleting brand"); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) { showAlert("warning", "Brand code is required"); return; }
    setSaving(true);
    try {
      const res = editingCode
        ? await request(`/api/brands/${editingCode}`, "PUT", { desc: formData.desc, remark: formData.remark, category_id: formData.category_id })
        : await request("/api/brands", "POST", formData);
      if (res.success) {
        showAlert("success", editingCode ? "Brand updated successfully" : "Brand created successfully");
        setShowForm(false); fetchBrands();
      } else showAlert("error", res.message || "Error saving brand");
    } catch (err) { console.error("Error saving brand:", err); showAlert("error", "Error saving brand"); }
    finally { setSaving(false); }
  };

  const getCatLabel = (id) => {
    if (!id) return null;
    const c = categories.find(c => c.code === id);
    return c ? `${c.code}${c.desc ? ` - ${c.desc}` : ""}` : id;
  };

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageRows = filteredBrands.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <style>{CSS}</style>
      <div className="bp-root">

        {/* Header */}
        <div className="bp-header">
          <h1 className="bp-title">Brand Management</h1>
          <button className="bp-btn-add" onClick={handleAddBrand}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Add New Brand
          </button>
        </div>

        {/* Controls */}
        <div className="bp-controls">
          <div className="bp-ctrl-left">
            <span>Show</span>
            <select className="bp-perpage" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>brands per page</span>
          </div>
          <div className="bp-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8892aa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search by code or description..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
            {searchKeyword && <button className="bp-clear" onClick={() => setSearchKeyword("")}>×</button>}
          </div>
        </div>

        {/* Table */}
        <div className="bp-table-wrap">
          <table className="bp-table">
            <thead>
              <tr>
                {["Code","Description","Category","Remark","Actions"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      {[70,130,130,110,120].map((w,j) => (
                        <td key={j} style={{ padding:"14px 16px" }}>
                          <span className="bp-skel" style={{ height:13, width:w }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : pageRows.length > 0
                  ? pageRows.map(brand => {
                      const color = accentFor(brand.category_id);
                      const catLabel = getCatLabel(brand.category_id);
                      return (
                        <tr key={brand.code}>
                          <td>
                            <div className="bp-code-cell">
                              <div className="bp-avatar" style={{ background:`${color}18`, color }}>
                                {brand.code.charAt(0)}
                              </div>
                              <span className="bp-code">{brand.code}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight:500 }}>{brand.desc || <span className="bp-muted">—</span>}</td>
                          <td>
                            {catLabel
                              ? <span className="bp-cat-pill" style={{ background:`${color}12`, color }}>{catLabel}</span>
                              : <span className="bp-muted">—</span>
                            }
                          </td>
                          <td>{brand.remark || <span className="bp-muted">—</span>}</td>
                          <td>
                            <button className="bp-btn-edit" onClick={() => handleEditBrand(brand)}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
                              Edit
                            </button>
                            <button className="bp-btn-del" onClick={() => handleDeleteBrand(brand.code)}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  : <tr><td colSpan="5" className="bp-no-data">No brands found{searchKeyword && ` for "${searchKeyword}"`}</td></tr>
              }
            </tbody>
          </table>

          {!loading && filteredBrands.length > 0 && (
            <div className="bp-pagination">
              <span>Showing {startIndex+1}–{Math.min(startIndex+itemsPerPage, filteredBrands.length)} of {filteredBrands.length} brands</span>
              <div className="bp-page-btns">
                <button className="bp-page-btn" disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={`bp-page-btn ${currentPage===i+1?"active":""}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                ))}
                <button className="bp-page-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="bp-overlay" onClick={e => e.target===e.currentTarget && setShowForm(false)}>
            <div className="bp-modal">
              <div className="bp-modal-head">
                <div className="bp-modal-head-left">
                  <div className={`bp-modal-icon ${editingCode?"edit":"create"}`}>
                    {editingCode ? "✎" : "✦"}
                  </div>
                  <div>
                    <div className="bp-modal-htitle">{editingCode ? "Edit Brand" : "Add New Brand"}</div>
                    <div className="bp-modal-hsub">{editingCode ? `Editing: ${editingCode}` : "Fill in the details below"}</div>
                  </div>
                </div>
                <button className="bp-modal-close" onClick={() => setShowForm(false)}>×</button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="bp-modal-body">

                  <div className="bp-section-label">Brand Details</div>
                  <div className="bp-grid-2" style={{ marginBottom:16 }}>
                    <div className="bp-field">
                      <label className="bp-label">Code<span className="bp-req"> *</span></label>
                      <input className="bp-input" type="text" value={formData.code} onChange={e => setFormData(p=>({...p,code:e.target.value}))} disabled={!!editingCode} placeholder="e.g. B001" required />
                    </div>
                    <div className="bp-field">
                      <label className="bp-label">Description</label>
                      <input className="bp-input" type="text" value={formData.desc} onChange={e => setFormData(p=>({...p,desc:e.target.value}))} placeholder="Brand name" />
                    </div>
                  </div>

                  <div className="bp-section-label">Classification</div>
                  <div className="bp-field" style={{ marginBottom:16 }}>
                    <label className="bp-label">Category</label>
                    <select className="bp-select" value={formData.category_id} onChange={e => setFormData(p=>({...p,category_id:e.target.value}))}>
                      <option value="">— Select Category —</option>
                      {categories.map(cat => (
                        <option key={cat.code} value={cat.code}>{cat.code}{cat.desc ? ` - ${cat.desc}` : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bp-section-label">Additional</div>
                  <div className="bp-field">
                    <label className="bp-label">Remark</label>
                    <textarea className="bp-textarea" value={formData.remark} onChange={e => setFormData(p=>({...p,remark:e.target.value}))} placeholder="Optional notes…" rows={3} />
                  </div>

                </div>

                <div className="bp-modal-foot">
                  <button type="button" className="bp-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="bp-btn-save" disabled={saving}>
                    {saving
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"bp-spin 0.8s linear infinite"}}><path d="M21 12a9 9 0 11-18 0"/></svg>
                      : editingCode
                        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    }
                    {saving ? "Saving…" : editingCode ? "Update Brand" : "Create Brand"}
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

export default BrandPage;