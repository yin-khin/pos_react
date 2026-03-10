import React, { useState, useEffect } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";

// ─── Google Font ──────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap";
document.head.appendChild(fontLink);

// ─── Styles ───────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("pp-styles")) return;
  const s = document.createElement("style");
  s.id = "pp-styles";
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .pp-root {
      font-family: 'Katomruy pro', sans-serif;
      background: #f5f4f0;
      min-height: 100vh;
      padding: 32px 28px;
      color: #1a1a1a;
    }

    /* ── Header ── */
    .pp-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 28px;
    }
    .pp-header-left h1 {
      font-family: "Poppins",sans-serif;
      font-size: 28px; color: #111; letter-spacing: -.5px;
      font-weight: 700;
    }
    .pp-header-left p { font-size: 13px; color: #888; margin-top: 2px; }

    .pp-btn-add {
      background: #111; color: #fff; border: none;
      padding: 10px 20px; border-radius: 10px;
      font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
      cursor: pointer; display: flex; align-items: center; gap: 6px;
      transition: background .2s, transform .15s;
    }
    .pp-btn-add:hover { background: #2a2a2a; transform: translateY(-1px); }

    /* ── Controls ── */
    .pp-controls {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
    }
    .pp-search {
      display: flex; align-items: center; gap: 8px;
      background: #fff; border: 1px solid #e5e5e5;
      border-radius: 10px; padding: 8px 14px; flex: 1; max-width: 320px;
      transition: border-color .2s;
    }
    .pp-search:focus-within { border-color: #111; }
    .pp-search input {
      border: none; outline: none; font-family: 'DM Sans', sans-serif;
      font-size: 13px; width: 100%; background: transparent;
    }
    .pp-per-page {
      display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555;
    }
    .pp-per-page select {
      border: 1px solid #e5e5e5; border-radius: 8px;
      padding: 6px 10px; font-family: 'DM Sans', sans-serif;
      font-size: 13px; background: #fff; cursor: pointer;
    }

    /* ── Table Card ── */
    .pp-card {
      background: #fff; border-radius: 16px;
      border: 1px solid #e8e8e8; overflow: hidden;
    }
    .pp-table { width: 100%; border-collapse: collapse; }
    .pp-table thead tr { border-bottom: 1px solid #f0f0f0; }
    .pp-table th {
      padding: 12px 16px; text-align: left;
      font-size: 11px; font-weight: 600; color: #999;
      text-transform: uppercase; letter-spacing: .06em;
      white-space: nowrap;
    }
    .pp-table td {
      padding: 14px 16px; font-size: 13px; color: #333;
      border-bottom: 1px solid #f7f7f7;
      transition: background .15s;
    }
    .pp-table tbody tr { animation: ppRowIn .3s ease both; }
    .pp-table tbody tr:hover td { background: #fafafa; }
    .pp-table tbody tr:last-child td { border-bottom: none; }
    @keyframes ppRowIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .pp-prd-id {
      font-family: 'DM Sans', sans-serif; font-size: 12px;
      font-weight: 600; color: #555;
      background: #f5f5f5; padding: 3px 8px; border-radius: 6px;
      white-space: nowrap;
    }
    .pp-prd-name { font-weight: 500; color: #111; }
    .pp-cost { color: #16a34a; font-weight: 600; }
    .pp-dash { color: #ccc; }
    .pp-thumb {
      width: 36px; height: 36px; object-fit: cover;
      border-radius: 8px; border: 1px solid #eee;
    }
    .pp-status {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600; text-transform: capitalize;
    }
    .pp-status::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
    }
    .pp-status-available  { background: #dcfce7; color: #15803d; }
    .pp-status-available::before  { background: #22c55e; }
    .pp-status-low        { background: #fef9c3; color: #92400e; }
    .pp-status-low::before        { background: #eab308; }
    .pp-status-unavailable{ background: #fee2e2; color: #b91c1c; }
    .pp-status-unavailable::before{ background: #ef4444; }
    .pp-status-default    { background: #f3f4f6; color: #6b7280; }
    .pp-status-default::before    { background: #9ca3af; }

    .pp-btn-edit, .pp-btn-del {
      border: none; border-radius: 7px; padding: 5px 11px;
      font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
      cursor: pointer; transition: all .15s;
    }
    .pp-btn-edit { background: #eff6ff; color: #2563eb; }
    .pp-btn-edit:hover { background: #dbeafe; }
    .pp-btn-del  { background: #fff1f2; color: #dc2626; margin-left: 6px; }
    .pp-btn-del:hover  { background: #fee2e2; }

    .pp-actions { white-space: nowrap; }

    /* ── Pagination ── */
    .pp-footer {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 10px; padding: 14px 18px;
      border-top: 1px solid #f0f0f0; font-size: 12px; color: #888;
    }
    .pp-pages { display: flex; gap: 4px; }
    .pp-page-btn {
      width: 30px; height: 30px; border-radius: 8px; border: 1px solid #e5e5e5;
      background: #fff; font-family: 'DM Sans', sans-serif; font-size: 12px;
      cursor: pointer; transition: all .15s;
    }
    .pp-page-btn:hover { background: #f5f5f5; }
    .pp-page-btn.active { background: #111; color: #fff; border-color: #111; }
    .pp-page-btn:disabled { opacity: .4; cursor: default; }
    .pp-page-nav {
      padding: 0 12px; height: 30px; border-radius: 8px;
      border: 1px solid #e5e5e5; background: #fff;
      font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer;
      transition: all .15s;
    }
    .pp-page-nav:hover:not(:disabled) { background: #f5f5f5; }
    .pp-page-nav:disabled { opacity: .4; cursor: default; }

    .pp-empty {
      text-align: center; padding: 60px; color: #bbb; font-size: 14px;
    }
    .pp-loading {
      display: flex; align-items: center; justify-content: center;
      height: 200px; color: #aaa; font-size: 14px;
    }
    .pp-spinner {
      width: 20px; height: 20px; border: 2px solid #eee;
      border-top-color: #111; border-radius: 50%;
      animation: spin .7s linear infinite; margin-right: 10px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Overlay ── */
    .pp-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      backdrop-filter: blur(4px); z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: ppFadeIn .2s ease;
    }
    @keyframes ppFadeIn { from { opacity:0 } to { opacity:1 } }

    .pp-modal {
      background: #fff; border-radius: 20px;
      width: 100%; max-width: 680px; max-height: 90vh;
      display: flex; flex-direction: column;
      box-shadow: 0 24px 60px rgba(0,0,0,.18);
      animation: ppSlideUp .25s cubic-bezier(.16,1,.3,1);
      overflow: hidden;
    }
    @keyframes ppSlideUp {
      from { opacity:0; transform: translateY(24px) scale(.97) }
      to   { opacity:1; transform: translateY(0) scale(1) }
    }

    /* ── Modal Header ── */
    .pp-modal-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
    }
    .pp-modal-head-left { display: flex; align-items: center; gap: 12px; }
    .pp-modal-icon {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .pp-modal-icon.add  { background: #dcfce7; }
    .pp-modal-icon.edit { background: #fef9c3; }
    .pp-modal-title  { font-family:'Playfair Display',serif; font-size:18px; color:#111; }
    .pp-modal-sub    { font-size:12px; color:#999; margin-top:2px; }
    .pp-modal-close  {
      width:32px; height:32px; border-radius:8px; border:1px solid #eee;
      background:#fff; font-size:16px; cursor:pointer; display:flex;
      align-items:center; justify-content:center; color:#666;
      transition: all .15s;
    }
    .pp-modal-close:hover { background:#f5f5f5; color:#111; }

    /* ── Modal Body ── */
    .pp-modal-body {
      overflow-y: auto; padding: 24px;
      flex: 1;
    }
    .pp-modal-body::-webkit-scrollbar { width: 4px; }
    .pp-modal-body::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

    /* ── Section ── */
    .pp-section-label {
      font-size: 10px; font-weight: 700; color: #22c55e;
      text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px;
      display: flex; align-items: center; gap: 8px;
    }
    .pp-section-label::after {
      content: ''; flex: 1; height: 1px; background: #f0f0f0;
    }
    .pp-section { margin-bottom: 24px; }

    /* ── Grid ── */
    .pp-grid-2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px;
    }

    /* ── Field ── */
    .pp-field { margin-bottom: 14px; }
    .pp-field label {
      display: block; font-size: 12px; font-weight: 500; color: #555;
      margin-bottom: 6px;
    }
    .pp-req { color: #ef4444; }
    .pp-field input, .pp-field textarea, .pp-field select {
      width: 100%; border: 1.5px solid #e8e8e8; border-radius: 10px;
      padding: 9px 12px; font-family:'DM Sans',sans-serif; font-size: 13px;
      color: #111; background: #fff; outline: none;
      transition: border-color .2s, box-shadow .2s;
    }
    .pp-field input:focus, .pp-field textarea:focus, .pp-field select:focus {
      border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,.06);
    }
    .pp-field input:disabled {
      background: #f9f9f9; color: #999; cursor: not-allowed;
    }
    .pp-field textarea { resize: vertical; min-height: 70px; }
    .pp-field small { font-size: 11px; color: #aaa; margin-top: 5px; display:block; }

    /* ── Custom Select ── */
    .pp-select-wrap { position: relative; }
    .pp-select-wrap select {
      appearance: none; padding-right: 32px; cursor: pointer;
    }
    .pp-select-wrap::after {
      content: '▾'; position: absolute; right: 12px; top: 50%;
      transform: translateY(-50%); pointer-events: none;
      font-size: 12px; color: #999;
    }

    /* ── Photo Upload ── */
    .pp-upload-area {
      border: 2px dashed #e0e0e0; border-radius: 12px;
      padding: 16px; text-align: center; cursor: pointer;
      transition: border-color .2s, background .2s;
      position: relative; overflow: hidden;
    }
    .pp-upload-area:hover { border-color: #bbb; background: #fafafa; }
    .pp-upload-area input[type=file] {
      position: absolute; inset: 0; opacity: 0;
      cursor: pointer; border: none; padding: 0;
    }
    .pp-upload-label { font-size: 12px; color: #999; }
    .pp-upload-label strong { color: #555; }
    .pp-thumb-preview {
      display: flex; align-items: center; gap: 12px; margin-top: 12px;
    }
    .pp-thumb-preview img {
      width: 56px; height: 56px; object-fit: cover;
      border-radius: 10px; border: 1px solid #eee;
    }
    .pp-thumb-preview span { font-size: 12px; color: #888; }

    /* ── Footer Actions ── */
    .pp-modal-foot {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 16px 24px; border-top: 1px solid #f0f0f0; flex-shrink: 0;
    }
    .pp-btn-cancel {
      padding: 9px 20px; border: 1.5px solid #e8e8e8; border-radius: 10px;
      background: #fff; font-family:'DM Sans',sans-serif; font-size: 13px;
      font-weight: 500; color: #666; cursor: pointer; transition: all .15s;
    }
    .pp-btn-cancel:hover { background: #f5f5f5; }
    .pp-btn-submit {
      padding: 9px 22px; background: #111; border: none; border-radius: 10px;
      font-family:'DM Sans',sans-serif; font-size: 13px; font-weight: 500;
      color: #fff; cursor: pointer; display:flex; align-items:center; gap:6px;
      transition: background .2s, transform .15s;
    }
    .pp-btn-submit:hover { background: #222; transform: translateY(-1px); }

    @media (max-width: 600px) {
      .pp-grid-2 { grid-template-columns: 1fr; }
      .pp-modal { max-width: 100%; }
    }
  `;
  document.head.appendChild(s);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyForm = {
  prd_id: "", prd_name: "", category_id: "", brand_id: "",
  stock_date: "", exp_date: "", qty: "", unit_cost: "",
  remark: "", telegram: "", photo: "", status: "",
};

const statusClass = (s) =>
  s === "available" ? "pp-status-available"
  : s === "low"     ? "pp-status-low"
  : s === "unavailable" ? "pp-status-unavailable"
  : "pp-status-default";

// ─── Field Components ─────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
  <div className="pp-field">
    {label && (
      <label>{label}{required && <span className="pp-req"> *</span>}</label>
    )}
    {children}
    {hint && <small>{hint}</small>}
  </div>
);

const TextInput = ({ value, onChange, ...rest }) => (
  <input value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
);

const SelectInput = ({ value, onChange, children }) => (
  <div className="pp-select-wrap">
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductPage = () => {
  injectStyles();

  const [products,         setProducts]         = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories,       setCategories]       = useState([]);
  const [brands,           setBrands]           = useState([]);
  const [allBrands,        setAllBrands]        = useState([]);
  const [search,           setSearch]           = useState("");
  const [perPage,          setPerPage]          = useState(10);
  const [page,             setPage]             = useState(1);
  const [loading,          setLoading]          = useState(false);
  const [showForm,         setShowForm]         = useState(false);
  const [editingId,        setEditingId]        = useState(null);
  const [form,             setForm]             = useState(emptyForm);
  const [photoFile,        setPhotoFile]        = useState(null);
  const [photoPreview,     setPhotoPreview]     = useState("");

  // ── Fetch ──
  useEffect(() => { fetchProducts(); fetchCategories(); fetchBrands(); }, []);

  useEffect(() => {
    const kw = search.toLowerCase().trim();
    setFilteredProducts(
      kw
        ? products.filter(p =>
            [p.prd_id, p.prd_name, p.category_id, p.brand_id]
              .some(v => v && v.toLowerCase().includes(kw))
          )
        : products
    );
    setPage(1);
  }, [search, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await request("/api/products", "GET");
      const data = res.success ? res.products : Array.isArray(res) ? res : [];
      setProducts(data);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await request("/api/categories", "GET");
      setCategories(res.success ? res.category : Array.isArray(res) ? res : []);
    } catch { setCategories([]); }
  };

  const fetchBrands = async () => {
    try {
      const res = await request("/api/brands", "GET");
      const b = res.success ? res.brand : Array.isArray(res) ? res : [];
      setBrands(b); setAllBrands(b);
    } catch { setBrands([]); setAllBrands([]); }
  };

  const fetchBrandsByCategory = async (catId) => {
    if (!catId) { setBrands(allBrands); return; }
    try {
      const res = await request(`/api/brands?categories=${catId}`, "GET");
      setBrands(res.success && res.brand ? res.brand : allBrands);
    } catch { setBrands(allBrands); }
  };

  // ── Open / close ──
  const openAdd = () => {
    setForm(emptyForm); setEditingId(null);
    setBrands(allBrands); setPhotoFile(null); setPhotoPreview("");
    setShowForm(true);
  };

  const openEdit = async (p) => {
    setForm({
      prd_id: p.prd_id, prd_name: p.prd_name || "",
      category_id: p.category_id || "", brand_id: p.brand_id || "",
      stock_date: p.stock_date ? p.stock_date.slice(0, 10) : "",
      exp_date: p.exp_date ? p.exp_date.slice(0, 10) : "",
      qty: p.qty ?? "", unit_cost: p.unit_cost ?? "",
      remark: p.remark || "", telegram: p.telegram || "",
      status: p.status || "", photo: p.photo || "",
    });
    setEditingId(p.prd_id);
    setPhotoFile(null); setPhotoPreview(p.photo || "");
    await fetchBrandsByCategory(p.category_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const res = await showConfirm("Are you sure?", `Delete product "${id}"?`, "Yes, delete it!");
    if (!res.isConfirmed) return;
    try {
      const r = await request(`/api/products/${id}`, "DELETE");
      if (r.success || r.message) { showAlert("success", "Deleted"); fetchProducts(); }
      else showAlert("error", r.message || "Error");
    } catch { showAlert("error", "Error deleting"); }
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prd_id.trim()) return showAlert("warning", "Product ID is required");
    if (!form.prd_name.trim()) return showAlert("warning", "Product name is required");

    try {
      let photoData = form.photo;
      if (photoFile) {
        photoData = await new Promise(res => {
          const r = new FileReader();
          r.onloadend = () => res(r.result);
          r.readAsDataURL(photoFile);
        });
      }

      const body = {
        prd_id: editingId || form.prd_id, prd_name: form.prd_name,
        category_id: form.category_id || null, brand_id: form.brand_id || null,
        stock_date: form.stock_date || null, exp_date: form.exp_date || null,
        qty: form.qty !== "" ? Number(form.qty) : null,
        unit_cost: form.unit_cost !== "" ? Number(form.unit_cost) : null,
        remark: form.remark || null, telegram: form.telegram || null,
        status: form.status || null, photo: photoData || null,
      };

      const r = editingId
        ? await request(`/api/products/${editingId}`, "PUT", body)
        : await request("/api/products", "POST", body);

      if (r.success || r.message) {
        showAlert("success", editingId ? "Updated!" : "Created!");
        setShowForm(false); fetchProducts();
      } else showAlert("error", r.message || "Error saving");
    } catch { showAlert("error", "Error saving"); }
  };

  // ── Helpers ──
  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }));
  const getCatLabel = (id) => { const c = categories.find(x => x.code === id); return c ? `${c.code}${c.desc ? ` – ${c.desc}` : ""}` : id || "-"; };
  const getBrandLabel = (id) => { const b = allBrands.find(x => x.code === id); return b ? `${b.code}${b.desc ? ` – ${b.desc}` : ""}` : id || "-"; };

  // ── Pagination ──
  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const pageItems = filteredProducts.slice(start, start + perPage);

  // ── Render ──
  return (
    <div className="pp-root">
      {/* Header */}
      <div className="pp-header">
        <div className="pp-header-left">
          <h1>Product Management</h1>
          <p>{total} product{total !== 1 ? "s" : ""} total</p>
        </div>
        <button className="pp-btn-add" onClick={openAdd}>
          <span>＋</span> Add Product
        </button>
      </div>

      {/* Controls */}
      <div className="pp-controls">
        <div className="pp-search">
          <span style={{ color: "#bbb", fontSize: 14 }}>⌕</span>
          <input
            placeholder="Search by ID, name, category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="pp-per-page">
          <span>Show</span>
          <select value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }}>
            {[5, 10, 20, 50].map(n => <option key={n}>{n}</option>)}
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Table */}
      <div className="pp-card">
        {loading ? (
          <div className="pp-loading">
            <div className="pp-spinner" /> Loading products…
          </div>
        ) : (
          <>
            <table className="pp-table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Category</th><th>Brand</th>
                  <th>Qty</th><th>Unit Cost</th><th>Telegram</th>
                  <th>Photo</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length ? pageItems.map((p, i) => (
                  <tr key={p.prd_id} style={{ animationDelay: `${i * 30}ms` }}>
                    <td><span className="pp-prd-id">{p.prd_id}</span></td>
                    <td><span className="pp-prd-name">{p.prd_name || <span className="pp-dash">—</span>}</span></td>
                    <td>{getCatLabel(p.category_id)}</td>
                    <td>{getBrandLabel(p.brand_id)}</td>
                    <td>{p.qty ?? <span className="pp-dash">—</span>}</td>
                    <td>
                      {p.unit_cost != null
                        ? <span className="pp-cost">${parseFloat(p.unit_cost).toFixed(2)}</span>
                        : <span className="pp-dash">—</span>}
                    </td>
                    <td style={{ fontSize: 12, color: "#666" }}>{p.telegram || <span className="pp-dash">—</span>}</td>
                    <td>
                      {p.photo
                        ? <img className="pp-thumb" src={p.photo} alt="" />
                        : <span className="pp-dash">—</span>}
                    </td>
                    <td>
                      <span className={`pp-status ${statusClass(p.status)}`}>
                        {p.status || "none"}
                      </span>
                    </td>
                    <td className="pp-actions">
                      <button className="pp-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                      <button className="pp-btn-del"  onClick={() => handleDelete(p.prd_id)}>Delete</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="10" className="pp-empty">No products found</td></tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pp-footer">
              <span>
                {total === 0 ? "No results" : `${start + 1}–${Math.min(start + perPage, total)} of ${total}`}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button className="pp-page-nav" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                <div className="pp-pages">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`pp-page-btn ${page === i + 1 ? "active" : ""}`}
                      onClick={() => setPage(i + 1)}
                    >{i + 1}</button>
                  ))}
                </div>
                <button className="pp-page-nav" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modal Form ── */}
      {showForm && (
        <div className="pp-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="pp-modal">
            {/* Head */}
            <div className="pp-modal-head">
              <div className="pp-modal-head-left">
                <div className={`pp-modal-icon ${editingId ? "edit" : "add"}`}>
                  {editingId ? "✎" : "＋"}
                </div>
                <div>
                  <div className="pp-modal-title">{editingId ? "Edit Product" : "New Product"}</div>
                  <div className="pp-modal-sub">{editingId ? `Editing: ${editingId}` : "Fill in the details below"}</div>
                </div>
              </div>
              <button className="pp-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            {/* Body */}
            <div className="pp-modal-body">
              <form id="pp-form" onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="pp-section">
                  <div className="pp-section-label">Basic Information</div>
                  <div className="pp-grid-2">
                    <Field label="Product ID" required>
                      <TextInput value={form.prd_id} onChange={set("prd_id")} disabled={!!editingId} placeholder="e.g. PRD-001" />
                    </Field>
                    <Field label="Product Name" required>
                      <TextInput value={form.prd_name} onChange={set("prd_name")} placeholder="Enter product name" />
                    </Field>
                  </div>
                </div>

                {/* Classification */}
                <div className="pp-section">
                  <div className="pp-section-label">Classification</div>
                  <div className="pp-grid-2">
                    <Field label="Category">
                      <SelectInput value={form.category_id} onChange={async v => { set("category_id")(v); set("brand_id")(""); await fetchBrandsByCategory(v); }}>
                        <option value="">— None —</option>
                        {categories.map(c => (
                          <option key={c.code} value={c.code}>{c.code}{c.desc ? ` - ${c.desc}` : ""}</option>
                        ))}
                      </SelectInput>
                    </Field>
                    <Field label="Brand">
                      <SelectInput value={form.brand_id} onChange={set("brand_id")}>
                        <option value="">— None —</option>
                        {brands.map(b => (
                          <option key={b.code} value={b.code}>{b.code}{b.desc ? ` - ${b.desc}` : ""}</option>
                        ))}
                      </SelectInput>
                    </Field>
                  </div>
                </div>

                {/* Stock & Pricing */}
                <div className="pp-section">
                  <div className="pp-section-label">Stock &amp; Pricing</div>
                  <div className="pp-grid-2">
                    <Field label="Quantity">
                      <TextInput type="number" min="0" value={form.qty} onChange={set("qty")} placeholder="0" />
                    </Field>
                    <Field label="Unit Cost" hint="Supports: $0.01, $1.00 or Riel amounts">
                      <TextInput type="number" min="0" step="0.01" value={form.unit_cost} onChange={set("unit_cost")} placeholder="0.00" />
                    </Field>
                    <Field label="Stock Date">
                      <TextInput type="date" value={form.stock_date} onChange={set("stock_date")} />
                    </Field>
                    <Field label="Expiry Date">
                      <TextInput type="date" value={form.exp_date} onChange={set("exp_date")} />
                    </Field>
                  </div>
                </div>

                {/* Additional */}
                <div className="pp-section">
                  <div className="pp-section-label">Additional</div>
                  <div className="pp-grid-2">
                    <Field label="Telegram">
                      <TextInput value={form.telegram} onChange={set("telegram")} placeholder="@username" />
                    </Field>
                    <Field label="Status">
                      <SelectInput value={form.status} onChange={set("status")}>
                        <option value="">— None —</option>
                        <option value="low">Low</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                      </SelectInput>
                    </Field>
                  </div>

                  {/* Photo */}
                  <Field label="Product Photo">
                    <div className="pp-upload-area">
                      <input type="file" accept="image/*" onChange={e => {
                        const f = e.target.files[0];
                        if (!f) return;
                        setPhotoFile(f);
                        const rd = new FileReader();
                        rd.onloadend = () => setPhotoPreview(rd.result);
                        rd.readAsDataURL(f);
                      }} />
                      <div className="pp-upload-label">
                        <strong>Click to upload</strong> or drag & drop<br />
                        <span style={{ fontSize: 11 }}>PNG, JPG, GIF up to 5MB</span>
                      </div>
                    </div>
                    {photoPreview && (
                      <div className="pp-thumb-preview">
                        <img src={photoPreview} alt="Preview" />
                        <span>Preview ready</span>
                      </div>
                    )}
                  </Field>

                  <Field label="Remark">
                    <textarea value={form.remark} onChange={e => set("remark")(e.target.value)} placeholder="Optional notes…" />
                  </Field>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="pp-modal-foot">
              <button type="button" className="pp-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" form="pp-form" className="pp-btn-submit">
                {editingId ? "💾 Save Changes" : "✚ Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;