// import React, { useState, useEffect } from "react";
// import request from "../../../utils/request";
// import { showAlert, showConfirm } from "../../../utils/alert";
// import "./category.css";

// const CategoryPage = () => {
//   const [categories, setCategories] = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [editingCode, setEditingCode] = useState(null);
//   const [formData, setFormData] = useState({ code: "", desc: "", remark: "" });

//   // Fetch all categories
//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   // Filter categories based on search keyword
//   useEffect(() => {
//     if (searchKeyword.trim()) {
//       const filtered = categories.filter(
//         (cat) =>
//           cat.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
//           (cat.desc &&
//             cat.desc.toLowerCase().includes(searchKeyword.toLowerCase())),
//       );
//       setFilteredCategories(filtered);
//     } else {
//       setFilteredCategories(categories);
//     }
//     setCurrentPage(1);
//   }, [searchKeyword, categories]);

//  const fetchCategories = async () => {
//   setLoading(true);
//   try {
//     const response = await request("/api/categories", "GET");
//     if (response.success) {
//       setCategories(response.category); // ✅ matches your API response
//     }
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     showAlert("error", "Error fetching categories");
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleAddCategory = () => {
//     setFormData({ code: "", desc: "", remark: "" });
//     setEditingCode(null);
//     setShowForm(true);
//   };

//   const handleEditCategory = (category) => {
//     setFormData({
//       code: category.code,
//       desc: category.desc || "",
//       remark: category.remark || "",
//     });
//     setEditingCode(category.code);
//     setShowForm(true);
//   };

//   const handleDeleteCategory = async (code) => {
//     const result = await showConfirm(
//       "Are you sure?",
//       `Delete category "${code}"? This action cannot be undone.`,
//       "Yes, delete it!"
//     );

//     if (result.isConfirmed) {
//       try {
//         const response = await request(`/api/categories/${code}`, "DELETE");
//         if (response.success) {
//           showAlert("success", "Category deleted successfully");
//           fetchCategories();
//         } else {
//           showAlert("error", response.message || "Error deleting category");
//         }
//       } catch (error) {
//         console.error("Error deleting category:", error);
//         showAlert("error", "Error deleting category");
//       }
//     }
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.code.trim()) {
//       showAlert("warning", "Category code is required");
//       return;
//     }

//     try {
//       let response;
//       if (editingCode) {
//         // Update
//         response = await request(`/api/categories/${editingCode}`, "PUT", {
//           desc: formData.desc,
//           remark: formData.remark,
//         });
//       } else {
//         // Create
//         response = await request("/api/categories", "POST", formData);
//       }

//       if (response.success) {
//         showAlert("success", editingCode ? "Category updated successfully" : "Category created successfully");
//         setShowForm(false);
//         fetchCategories();
//       } else {
//         showAlert("error", response.message || "Error saving category");
//       }
//     } catch (error) {
//       console.error("Error saving category:", error);
//       showAlert("error", "Error saving category");
//     }
//   };

//   // Pagination calculation
//   const totalPages = Math.ceil(filteredCategories?.length / itemsPerPage || 0);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const paginatedCategories = filteredCategories?.slice(startIndex, endIndex);

//   return (
//     <div className="category-container">
//       <div className="category-header">
//         <h1 className="category-title">Category Management</h1>
//         <button className="btn-add-category" onClick={handleAddCategory}>
//           + Add New Category
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
//           <span>categories per page</span>
//         </div>

//         <div className="search-box">
//           <label>Search categories:</label>
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
//                 <th>Remark</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedCategories?.length > 0 ? (
//                 paginatedCategories.map((category) => (
//                   <tr key={category.code}>
//                     <td>{category.code}</td>
//                     <td>{category.desc || "-"}</td>
//                     <td>{category.remark || "-"}</td>
//                     <td className="actions">
//                       <button
//                         className="btn-edit"
//                         onClick={() => handleEditCategory(category)}
//                       >
//                         ✎ Edit
//                       </button>
//                       <button
//                         className="btn-delete"
//                         onClick={() => handleDeleteCategory(category.code)}
//                       >
//                         🗑 Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" className="no-data">
//                     No categories found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           <div className="pagination-info">
//             Showing {startIndex + 1} to{" "}
//             {Math.min(endIndex, filteredCategories?.length)} of{" "}
//             {filteredCategories?.length} categories
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
//               <h2>{editingCode ? "Edit Category" : "Add New Category"}</h2>
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
//                   placeholder="Enter category code"
//                   required
//                 />
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

// export default CategoryPage;

import React, { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";

// ─── Shared CSS (used by both Category & Brand pages) ─────────────────────────
export const MGMT_CSS = `
  

  @keyframes mgmt-fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes mgmt-fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes mgmt-slideIn { from { opacity:0; transform:translateY(22px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes mgmt-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
  @keyframes mgmt-spin     { to { transform:rotate(360deg); } }

  .mgmt-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .mgmt-root {
    font-family: 'DM Sans', sans-serif;
    background: #f4f6fa; min-height: 100vh; padding: 28px 32px;
  }

  /* Header */
  .mgmt-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px; animation: mgmt-fadeUp 0.4s ease both;
  }
  .mgmt-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 28px; color: #1a1d2e;
  }
  .mgmt-btn-add {
    display: inline-flex; align-items: center; gap: 8px;
    background: #22c55e; color: #fff; border: none; border-radius: 11px;
    padding: 11px 22px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13.5px;
    box-shadow: 0 4px 14px rgba(34,197,94,0.38); transition: all 0.18s;
  }
  .mgmt-btn-add:hover { background: #16a34a; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(34,197,94,0.45); }

  /* Controls */
  .mgmt-controls {
    display: flex; align-items: center; justify-content: space-between;
    background: #fff; border-radius: 13px 13px 0 0; padding: 14px 20px;
    border: 1px solid #e8ecf4; border-bottom: none;
    animation: mgmt-fadeUp 0.4s ease 0.05s both;
  }
  .mgmt-ctrl-left { display: flex; align-items: center; gap: 9px; font-size: 13px; color: #8892aa; }
  .mgmt-perpage {
    border: 1px solid #e8ecf4; border-radius: 8px; padding: 6px 10px;
    font-family: 'DM Sans',sans-serif; font-size: 13px; color: #1a1d2e;
    background: #f4f6fa; cursor: pointer; outline: none;
  }
  .mgmt-search {
    display: flex; align-items: center; gap: 8px;
    border: 1.5px solid #e8ecf4; border-radius: 9px; padding: 8px 13px;
    background: #f4f6fa; transition: border 0.15s, box-shadow 0.15s;
  }
  .mgmt-search:focus-within { border-color: #22c55e; background: #fff; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
  .mgmt-search input {
    border: none; background: transparent; outline: none;
    font-family: 'DM Sans',sans-serif; font-size: 13px; color: #1a1d2e; width: 230px;
  }
  .mgmt-search input::placeholder { color: #adb5c9; }
  .mgmt-search-clear {
    background: none; border: none; cursor: pointer; color: #adb5c9;
    font-size: 17px; line-height: 1; padding: 0; transition: color 0.14s;
  }
  .mgmt-search-clear:hover { color: #ef4444; }

  /* Table */
  .mgmt-table-wrap {
    background: #fff; border-radius: 0 0 14px 14px;
    border: 1px solid #e8ecf4; overflow: hidden;
    box-shadow: 0 2px 16px rgba(0,0,0,0.055);
    animation: mgmt-fadeUp 0.4s ease 0.1s both;
  }
  .mgmt-table { width: 100%; border-collapse: collapse; }
  .mgmt-table thead tr { background: #22c55e; }
  .mgmt-table thead th {
    padding: 13px 16px; text-align: left;
    font-weight: 700; font-size: 12.5px; color: #fff;
    white-space: nowrap; letter-spacing: 0.2px;
  }
  .mgmt-table tbody tr { border-bottom: 1px solid #f0f2f8; transition: background 0.12s; }
  .mgmt-table tbody tr:last-child { border-bottom: none; }
  .mgmt-table tbody tr:hover { background: #f8fafd; }
  .mgmt-table tbody td { padding: 13px 16px; font-size: 13px; color: #2d3249; vertical-align: middle; }
  .mgmt-code { font-family: 'Syne',sans-serif; font-weight: 700; font-size: 12.5px; color: #1a1d2e; }
  .mgmt-muted { color: #9aa0b4; font-size: 12.5px; }

  .mgmt-btn-edit {
    background: #f59e0b; color: #fff; border: none; border-radius: 7px;
    padding: 6px 14px; cursor: pointer; font-size: 12px; font-weight: 600;
    display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s;
  }
  .mgmt-btn-edit:hover { background: #d97706; }
  .mgmt-btn-del {
    background: #ef4444; color: #fff; border: none; border-radius: 7px;
    padding: 6px 14px; cursor: pointer; font-size: 12px; font-weight: 600;
    display: inline-flex; align-items: center; gap: 5px; margin-left: 7px; transition: all 0.15s;
  }
  .mgmt-btn-del:hover { background: #b91c1c; }

  /* Skeleton */
  .mgmt-skel {
    border-radius: 7px;
    background: linear-gradient(90deg,#f0f2f8 25%,#e6eaf4 50%,#f0f2f8 75%);
    background-size: 200% 100%; animation: mgmt-shimmer 1.4s infinite;
    display: inline-block;
  }

  /* Pagination */
  .mgmt-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-top: 1px solid #f0f2f8;
    font-size: 13px; color: #8892aa;
  }
  .mgmt-page-btns { display: flex; gap: 6px; flex-wrap: wrap; }
  .mgmt-page-btn {
    border: 1px solid #e8ecf4; background: #fff; border-radius: 8px;
    padding: 6px 14px; cursor: pointer; font-size: 13px; color: #8892aa;
    font-family: 'DM Sans',sans-serif; transition: all 0.14s;
  }
  .mgmt-page-btn:hover:not(:disabled) { background: #f4f6fa; color: #1a1d2e; }
  .mgmt-page-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; font-weight: 600; }
  .mgmt-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .mgmt-no-data { text-align: center; padding: 44px 0; color: #9aa0b4; font-size: 14px; }

  /* Modal */
  .mgmt-overlay {
    position: fixed; inset: 0; background: rgba(10,14,28,0.52);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; animation: mgmt-fadeIn 0.18s ease; padding: 20px;
  }
  .mgmt-modal {
    background: #fff; border-radius: 18px; width: 520px; max-width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,0.22);
    animation: mgmt-slideIn 0.22s ease both; overflow: hidden;
  }
  .mgmt-modal-head {
    padding: 22px 26px 18px; border-bottom: 1px solid #f0f2f8;
    display: flex; align-items: center; justify-content: space-between;
  }
  .mgmt-modal-head-left { display: flex; align-items: center; gap: 12px; }
  .mgmt-modal-icon {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 20px;
  }
  .mgmt-modal-icon.edit   { background: #fff8e6; }
  .mgmt-modal-icon.create { background: #e6faf0; }
  .mgmt-modal-htitle { font-family:'Syne',sans-serif; font-weight:700; font-size:17px; color:#1a1d2e; }
  .mgmt-modal-hsub   { font-size:12px; color:#9aa0b4; margin-top:2px; }
  .mgmt-modal-close {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e8ecf4;
    background: #f4f6fa; cursor: pointer; display: flex; align-items: center;
    justify-content: center; color: #8892aa; font-size: 18px; transition: all 0.14s; line-height: 1;
  }
  .mgmt-modal-close:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

  .mgmt-modal-body { padding: 22px 26px; }

  .mgmt-section-label {
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
    font-size: 10.5px; font-weight: 800; letter-spacing: 1.4px;
    text-transform: uppercase; color: #22c55e;
  }
  .mgmt-section-label::after { content:''; flex:1; height:1px; background:#f0f2f8; }

  .mgmt-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .mgmt-field:last-child { margin-bottom: 0; }
  .mgmt-label {
    font-size: 11px; font-weight: 700; color: #8892aa;
    letter-spacing: 0.7px; text-transform: uppercase;
  }
  .mgmt-label .req { color: #ef4444; margin-left: 2px; }
  .mgmt-input, .mgmt-textarea, .mgmt-native-select {
    border: 1.5px solid #e8ecf4; border-radius: 9px; padding: 10px 13px;
    font-family: 'DM Sans',sans-serif; font-size: 13.5px; color: #1a1d2e;
    background: #fafbfd; outline: none; transition: all 0.16s; width: 100%;
  }
  .mgmt-input:focus, .mgmt-textarea:focus, .mgmt-native-select:focus {
    border-color: #22c55e; background: #fff;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
  }
  .mgmt-input:disabled { background: #f0f2f8; color: #8892aa; cursor: not-allowed; }
  .mgmt-textarea { resize: vertical; min-height: 82px; }
  .mgmt-native-select {
    cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238892aa' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 34px;
  }
  .mgmt-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .mgmt-modal-foot {
    padding: 16px 26px; border-top: 1px solid #f0f2f8;
    display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  }
  .mgmt-btn-cancel {
    border: 1.5px solid #e8ecf4; background: #fff; border-radius: 10px;
    padding: 10px 22px; cursor: pointer; font-family:'DM Sans',sans-serif;
    font-size: 13.5px; font-weight: 500; color: #6b7280; transition: all 0.15s;
  }
  .mgmt-btn-cancel:hover { background: #f4f6fa; }
  .mgmt-btn-save {
    background: #22c55e; color: #fff; border: none; border-radius: 10px;
    padding: 10px 26px; cursor: pointer; font-family:'DM Sans',sans-serif;
    font-size: 13.5px; font-weight: 700; transition: all 0.18s;
    box-shadow: 0 4px 12px rgba(34,197,94,0.35);
    display: flex; align-items: center; gap: 7px;
  }
  .mgmt-btn-save:hover { background: #16a34a; transform: translateY(-1px); }
  .mgmt-btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

// ─── Reusable sub-components ──────────────────────────────────────────────────
const SkelRow = ({ cols }) => (
  <tr>
    {Array(cols).fill(0).map((_, i) => (
      <td key={i} style={{ padding: "14px 16px" }}>
        <span className="mgmt-skel" style={{ height: 13, width: [60,130,110,90,100][i % 5], display:"block" }} />
      </td>
    ))}
  </tr>
);

const Field = ({ label, required, children }) => (
  <div className="mgmt-field">
    <label className="mgmt-label">{label}{required && <span className="req"> *</span>}</label>
    {children}
  </div>
);

// ─── CategoryPage ─────────────────────────────────────────────────────────────
const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({ code: "", desc: "", remark: "" });

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const kw = searchKeyword.trim().toLowerCase();
    setFilteredCategories(
      kw ? categories.filter(c =>
        c.code.toLowerCase().includes(kw) ||
        (c.desc && c.desc.toLowerCase().includes(kw))
      ) : categories
    );
    setCurrentPage(1);
  }, [searchKeyword, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await request("/api/categories", "GET");
      if (res.success) setCategories(res.category);
    } catch { showAlert("error", "Error fetching categories"); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setFormData({ code:"", desc:"", remark:"" }); setEditingCode(null); setShowForm(true); };
  const openEdit = (cat) => { setFormData({ code: cat.code, desc: cat.desc||"", remark: cat.remark||"" }); setEditingCode(cat.code); setShowForm(true); };

  const handleDelete = async (code) => {
    const res = await showConfirm("Are you sure?", `Delete category "${code}"? This cannot be undone.`, "Yes, delete it!");
    if (!res.isConfirmed) return;
    try {
      const r = await request(`/api/categories/${code}`, "DELETE");
      if (r.success) { showAlert("success", "Category deleted successfully"); fetchCategories(); }
      else showAlert("error", r.message || "Error deleting category");
    } catch { showAlert("error", "Error deleting category"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) { showAlert("warning", "Category code is required"); return; }
    setSaving(true);
    try {
      const r = editingCode
        ? await request(`/api/categories/${editingCode}`, "PUT", { desc: formData.desc, remark: formData.remark })
        : await request("/api/categories", "POST", formData);
      if (r.success) {
        showAlert("success", editingCode ? "Category updated successfully" : "Category created successfully");
        setShowForm(false); fetchCategories();
      } else showAlert("error", r.message || "Error saving category");
    } catch { showAlert("error", "Error saving category"); }
    finally { setSaving(false); }
  };

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const pageRows = filteredCategories.slice(start, start + itemsPerPage);

  return (
    <>
      <style>{MGMT_CSS}</style>
      <div className="mgmt-root">

        {/* Header */}
        <div className="mgmt-header">
          <h1 className="mgmt-title">Category Management</h1>
          <button className="mgmt-btn-add" onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Add New Category
          </button>
        </div>

        {/* Controls */}
        <div className="mgmt-controls">
          <div className="mgmt-ctrl-left">
            <span>Show</span>
            <select className="mgmt-perpage" value={itemsPerPage} onChange={e => { setItemsPerPage(+e.target.value); setCurrentPage(1); }}>
              {[5,10,20,50].map(n => <option key={n}>{n}</option>)}
            </select>
            <span>categories per page</span>
          </div>
          <div className="mgmt-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8892aa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search by code or description..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
            {searchKeyword && <button className="mgmt-search-clear" onClick={() => setSearchKeyword("")}>×</button>}
          </div>
        </div>

        {/* Table */}
        <div className="mgmt-table-wrap">
          <table className="mgmt-table">
            <thead>
              <tr>
                {["Code","Description","Remark","Actions"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <SkelRow key={i} cols={4} />)
                : pageRows.length > 0
                  ? pageRows.map(cat => (
                    <tr key={cat.code}>
                      <td><span className="mgmt-code">{cat.code}</span></td>
                      <td>{cat.desc || <span className="mgmt-muted">—</span>}</td>
                      <td>{cat.remark || <span className="mgmt-muted">—</span>}</td>
                      <td>
                        <button className="mgmt-btn-edit" onClick={() => openEdit(cat)}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
                          Edit
                        </button>
                        <button className="mgmt-btn-del" onClick={() => handleDelete(cat.code)}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                  : <tr><td colSpan="4" className="mgmt-no-data">No categories found{searchKeyword && ` for "${searchKeyword}"`}</td></tr>
              }
            </tbody>
          </table>

          {!loading && filteredCategories.length > 0 && (
            <div className="mgmt-pagination">
              <span>Showing {start+1}–{Math.min(start+itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories</span>
              <div className="mgmt-page-btns">
                <button className="mgmt-page-btn" disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={`mgmt-page-btn ${currentPage===i+1?"active":""}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                ))}
                <button className="mgmt-page-btn" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="mgmt-overlay" onClick={e => e.target===e.currentTarget && setShowForm(false)}>
            <div className="mgmt-modal">
              <div className="mgmt-modal-head">
                <div className="mgmt-modal-head-left">
                  <div className={`mgmt-modal-icon ${editingCode?"edit":"create"}`}>
                    {editingCode ? "✎" : "✦"}
                  </div>
                  <div>
                    <div className="mgmt-modal-htitle">{editingCode ? "Edit Category" : "Add New Category"}</div>
                    <div className="mgmt-modal-hsub">{editingCode ? `Editing: ${editingCode}` : "Fill in the details below"}</div>
                  </div>
                </div>
                <button className="mgmt-modal-close" onClick={() => setShowForm(false)}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mgmt-modal-body">
                  <div className="mgmt-section-label">Category Details</div>

                  <div className="mgmt-grid-2">
                    <Field label="Code" required>
                      <input className="mgmt-input" value={formData.code} onChange={e => setFormData(p=>({...p,code:e.target.value}))} disabled={!!editingCode} placeholder="e.g. C001" required />
                    </Field>
                    <Field label="Description">
                      <input className="mgmt-input" value={formData.desc} onChange={e => setFormData(p=>({...p,desc:e.target.value}))} placeholder="Category name" />
                    </Field>
                  </div>

                  <Field label="Remark">
                    <textarea className="mgmt-textarea" value={formData.remark} onChange={e => setFormData(p=>({...p,remark:e.target.value}))} placeholder="Optional notes…" rows={3} />
                  </Field>
                </div>

                <div className="mgmt-modal-foot">
                  <button type="button" className="mgmt-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="mgmt-btn-save" disabled={saving}>
                    {saving
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"mgmt-spin 0.8s linear infinite"}}><path d="M21 12a9 9 0 11-18 0"/></svg>
                      : editingCode
                        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    }
                    {saving ? "Saving…" : editingCode ? "Update Category" : "Create Category"}
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

export default CategoryPage;