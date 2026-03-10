/* eslint-disable no-empty */
import { useState, useEffect } from "react";
import request from "../utils/request";
import { showAlert, showConfirm } from "../utils/alert";
import "./sales/Sales.css";

// ─── Constants ────────────────────────────────────────────────────────────────
const emptySale = {
  invoice_id:"", sale_date:new Date().toISOString(),
  pay_method:"Cash", qr_code:"",
  items:[], sub_total:0, tax:0, total:0,
};

const fmt   = (n) => `$${parseFloat(n ?? 0).toFixed(2)}`;
const fmtDt = (d) => d ? new Date(d).toLocaleDateString() : "—";

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>;
const EyeIcon    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const TrashIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>;
const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8892aa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const CartIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>;
const SpinIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"spin 0.8s linear infinite"}}><path d="M21 12a9 9 0 11-18 0"/></svg>;

// ─── Pay badge ────────────────────────────────────────────────────────────────
const PayBadge = ({ method }) => {
  const map = { Cash:"💵", Card:"💳", KHQR:"📱" };
  const cls = { Cash:"cash", Card:"card", KHQR:"khqr" };
  return <span className={`sp-pay ${cls[method]||""}`}>{map[method]||"💰"} {method||"—"}</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesPage = () => {
  const [sales,          setSales]          = useState([]);
  const [filtered,       setFiltered]       = useState([]);
  const [search,         setSearch]         = useState("");
  const [perPage,        setPerPage]        = useState(10);
  const [page,           setPage]           = useState(1);
  const [products,       setProducts]       = useState([]);
  const [cart,           setCart]           = useState([]);
  const [selProduct,     setSelProduct]     = useState(null);
  const [qty,            setQty]            = useState(1);
  const [saleData,       setSaleData]       = useState(emptySale);
  const [saving,         setSaving]         = useState(false);
  const [scanning,       setScanning]       = useState(false);
  const [showPOS,        setShowPOS]        = useState(false);
  const [showDetails,    setShowDetails]    = useState(false);
  const [detailSale,     setDetailSale]     = useState(null);

  useEffect(() => { fetchSales(); fetchProducts(); }, []);

  useEffect(() => {
    const kw = search.trim().toLowerCase();
    setFiltered(kw
      ? sales.filter(s =>
          s.sale_id.toLowerCase().includes(kw) ||
          (s.invoice_id && s.invoice_id.toLowerCase().includes(kw)) ||
          (s.pay_method && s.pay_method.toLowerCase().includes(kw))
        )
      : sales
    );
    setPage(1);
  }, [search, sales]);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSales = async () => {
    try {
      const res = await request("/api/sales?limit=100", "GET");
      if (res.success && res.data) setSales(res.data);
    } catch { showAlert("error", "Error fetching sales"); }
  };

  const fetchProducts = async () => {
    try {
      const res = await request("/api/products?limit=100", "GET");
      if (res.success && res.data) setProducts(res.data);
    } catch {}
  };

  // ─── Cart logic ──────────────────────────────────────────────────────────────
  const calcTotals = (newCart) => {
    const sub = newCart.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = sub * 0.1;
    setSaleData(p => ({ ...p, sub_total:sub, tax, total:sub+tax, items:newCart.map(i=>({prd_id:i.prd_id,qty:i.qty,price:i.price})) }));
  };

  const addToCart = () => {
    if (!selProduct || qty <= 0) return;
    const updated = cart.find(i => i.prd_id === selProduct.prd_id)
      ? cart.map(i => i.prd_id === selProduct.prd_id ? { ...i, qty: i.qty + qty } : i)
      : [...cart, { prd_id:selProduct.prd_id, name:selProduct.name, price:parseFloat(selProduct.price), qty }];
    setCart(updated); calcTotals(updated);
    setSelProduct(null); setQty(1);
  };

  const updateQty = (prd_id, n) => {
    const updated = n <= 0 ? cart.filter(i => i.prd_id !== prd_id) : cart.map(i => i.prd_id===prd_id ? {...i,qty:n} : i);
    setCart(updated); calcTotals(updated);
  };

  const removeItem = (prd_id) => updateQty(prd_id, 0);

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  const handleViewDetails = async (id) => {
    try {
      const res = await request(`/api/sales/${id}`, "GET");
      if (res.success && res.data) { setDetailSale(res.data); setShowDetails(true); }
    } catch { showAlert("error", "Error fetching sale details"); }
  };

  const handleDelete = async (id) => {
    const r = await showConfirm("Are you sure?", `Delete sale "${id}"? This cannot be undone.`, "Yes, delete it!");
    if (!r.isConfirmed) return;
    try {
      const res = await request(`/api/sales/${id}`, "DELETE");
      if (res.success) { showAlert("success", "Sale deleted successfully"); fetchSales(); }
    } catch { showAlert("error", "Error deleting sale"); }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    if (!saleData.invoice_id || cart.length === 0) { showAlert("error", "Please fill invoice ID and add items to cart"); return; }
    if (saleData.pay_method === "KHQR" && !saleData.qr_code) { showAlert("error", "Please scan KHQR code for payment"); return; }
    setSaving(true);
    try {
      const res = await request("/api/sales", "POST", {
        invoice_id:saleData.invoice_id, sale_date:saleData.sale_date,
        amount:saleData.total, sub_total:saleData.sub_total, tax:saleData.tax,
        pay_method:saleData.pay_method, qr_code:saleData.qr_code,
        create_by:"admin", items:saleData.items,
      });
      if (res.success) {
        showAlert("success", "Sale created successfully");
        setShowPOS(false); resetForm(); fetchSales();
      }
    } catch { showAlert("error", "Error creating sale"); }
    finally { setSaving(false); }
  };

  const resetForm = () => { setSaleData(emptySale); setCart([]); setSelProduct(null); setQty(1); };

  const startScanning = async () => {
    setScanning(true);
    try {
      const QrScanner = (await import("qr-scanner")).default;
      const video = document.getElementById("qr-video");
      const scanner = new QrScanner(video, result => {
        setSaleData(p => ({ ...p, qr_code:result.data }));
        setScanning(false); scanner.stop(); scanner.destroy();
      });
      await scanner.start();
    } catch { setScanning(false); }
  };

  const setPayMethod = (m) => setSaleData(p => ({ ...p, pay_method:m, qr_code:"" }));

  // ─── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / perPage);
  const start      = (page - 1) * perPage;
  const rows       = filtered.slice(start, start + perPage);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="sp-root">

      {/* Header */}
      {/* <div className="sp-header">
        <h1 className="sp-title">Sales Management</h1>
        <button className="sp-btn-new" onClick={() => setShowPOS(true)}><PlusIcon /> New Sale</button>
      </div> */}

      {/* Controls */}
      <div className="sp-controls">
        <div className="sp-ctrl-left">
          <span>Show</span>
          <select className="sp-select" value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }}>
            {[5,10,20,50].map(n => <option key={n}>{n}</option>)}
          </select>
          <span>sales per page</span>
        </div>
        <div className="sp-search">
          <SearchIcon />
          <input placeholder="Search by sale ID, invoice, payment..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="sp-search-clear" onClick={() => setSearch("")}>×</button>}
        </div>
      </div>

      {/* Table */}
      <div className="sp-table-wrap">
        <table className="sp-table">
          <thead><tr>{["Sale ID","Invoice ID","Sale Date","Sub Total","Tax","Amount","Payment","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.length > 0
              ? rows.map(s => (
                <tr key={s.sale_id}>
                  <td><strong style={{fontFamily:"'Syne',sans-serif",fontSize:12.5}}>{s.sale_id}</strong></td>
                  <td>{s.invoice_id||"—"}</td>
                  <td>{fmtDt(s.sale_date)}</td>
                  <td className="sp-blue">{fmt(s.sub_total)}</td>
                  <td className="sp-orange">{fmt(s.tax)}</td>
                  <td className="sp-green">{fmt(s.amount)}</td>
                  <td><PayBadge method={s.pay_method} /></td>
                  <td>
                    <button className="sp-btn-view" onClick={() => handleViewDetails(s.sale_id)}><EyeIcon /> View</button>
                    <button className="sp-btn-del"  onClick={() => handleDelete(s.sale_id)}><TrashIcon /> Delete</button>
                  </td>
                </tr>
              ))
              : <tr><td colSpan="8" className="sp-no-data">No sales found{search&&` for "${search}"`}</td></tr>
            }
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="sp-pagination">
            <span>Showing {start+1}–{Math.min(start+perPage, filtered.length)} of {filtered.length} sales</span>
            <div className="sp-page-btns">
              <button className="sp-page-btn" disabled={page===1}          onClick={() => setPage(p=>p-1)}>← Prev</button>
              {Array.from({length:totalPages},(_,i) => (
                <button key={i} className={`sp-page-btn ${page===i+1?"active":""}`} onClick={() => setPage(i+1)}>{i+1}</button>
              ))}
              <button className="sp-page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Details Modal ── */}
      {showDetails && detailSale && (
        <div className="sp-overlay" onClick={() => setShowDetails(false)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-head">
              <span className="sp-modal-title">Sale — {detailSale.sale_id}</span>
              <button className="sp-modal-close" onClick={() => setShowDetails(false)}>×</button>
            </div>
            <div className="sp-modal-body">
              <div className="sp-detail-grid">
                {[["Invoice ID",detailSale.invoice_id||"—"],["Sale Date",fmtDt(detailSale.sale_date)],["Payment",detailSale.pay_method||"—"],["Created By",detailSale.create_by||"—"]].map(([l,v]) => (
                  <div className="sp-detail-item" key={l}><label>{l}</label><p>{v}</p></div>
                ))}
              </div>
              <div className="sp-section-label">Items</div>
              {detailSale.SaleItemsDetails?.length > 0 ? (
                <table className="sp-table">
                  <thead><tr>{["Product ID","Qty","Price","Total"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {detailSale.SaleItemsDetails.map(item => (
                      <tr key={item.std_id}>
                        <td><strong>{item.prd_id}</strong></td>
                        <td>{item.qty}</td>
                        <td>{fmt(item.price)}</td>
                        <td className="sp-green">{fmt(parseFloat(item.qty||0)*parseFloat(item.price||0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p style={{color:"#9aa0b4",fontSize:13}}>No items found</p>}

              <div className="sp-totals-box">
                <div className="sp-totals-row"><span>Sub Total</span><span className="sp-blue">{fmt(detailSale.sub_total)}</span></div>
                <div className="sp-totals-row"><span>Tax</span><span className="sp-orange">{fmt(detailSale.tax)}</span></div>
                <div className="sp-totals-row total"><span>Total Amount</span><span className="sp-green">{fmt(detailSale.amount)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── POS Modal ── */}
      {showPOS && (
        <div className="sp-overlay">
          <div className="sp-pos-modal">

            {/* POS Header */}
            <div className="sp-modal-head">
              <span className="sp-modal-title">🛒 Create New Sale</span>
              <button className="sp-modal-close" onClick={() => { setShowPOS(false); resetForm(); }}>×</button>
            </div>

            <div className="sp-pos-body">

              {/* Panel 1 — Products (hidden for KHQR) */}
              {saleData.pay_method !== "KHQR" && (
                <div className="sp-panel sp-panel-products">
                  <div className="sp-panel-title">📦 Products</div>
                  <select className="sp-prod-select" value={selProduct?.prd_id||""} onChange={e => setSelProduct(products.find(p=>p.prd_id===e.target.value)||null)}>
                    <option value="">— Select product —</option>
                    {products.map(p => <option key={p.prd_id} value={p.prd_id}>{p.name} — {fmt(p.price)}</option>)}
                  </select>
                  <div className="sp-qty-row">
                    <label>Qty</label>
                    <input className="sp-qty-input" type="number" min="1" value={qty} onChange={e => setQty(parseInt(e.target.value)||1)} />
                    <button className="sp-btn-add-cart" onClick={addToCart} disabled={!selProduct}><CartIcon /> Add to Cart</button>
                  </div>
                </div>
              )}

              {/* Panel 2 — Cart */}
              <div className="sp-panel sp-panel-cart" style={{display:"flex",flexDirection:"column"}}>
                <div className="sp-panel-title"><CartIcon /> Cart {cart.length > 0 && <span style={{background:"#22c55e",color:"#fff",borderRadius:"20px",padding:"1px 8px",fontSize:11,fontWeight:700}}>{cart.length}</span>}</div>
                <div className="sp-cart-list">
                  {cart.length === 0
                    ? <div className="sp-cart-empty">Cart is empty</div>
                    : cart.map(item => (
                      <div className="sp-cart-item" key={item.prd_id}>
                        <div>
                          <div className="sp-cart-name">{item.name}</div>
                          <div className="sp-cart-price">{fmt(item.price)} × {item.qty} = <strong style={{color:"#22c55e"}}>{fmt(item.price*item.qty)}</strong></div>
                        </div>
                        <div className="sp-cart-right">
                          <input className="sp-cart-qty" type="number" min="1" value={item.qty} onChange={e => updateQty(item.prd_id, parseInt(e.target.value)||1)} />
                          <button className="sp-cart-remove" onClick={() => removeItem(item.prd_id)}>×</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
                <div className="sp-totals">
                  <div className="sp-total-row"><span>Subtotal</span><span>{fmt(saleData.sub_total)}</span></div>
                  <div className="sp-total-row"><span>Tax (10%)</span><span>{fmt(saleData.tax)}</span></div>
                  <div className="sp-total-row final"><span>Total</span><span className="sp-green">{fmt(saleData.total)}</span></div>
                </div>
              </div>

              {/* Panel 3 — Payment */}
              <div className="sp-panel sp-panel-payment">
                <div className="sp-panel-title">💳 Payment</div>
                <form onSubmit={handleCreateSale}>
                  <div className="sp-form-field">
                    <label className="sp-form-label">Invoice ID <span style={{color:"#ef4444"}}>*</span></label>
                    <input className="sp-form-input" value={saleData.invoice_id} onChange={e => setSaleData(p=>({...p,invoice_id:e.target.value}))} placeholder="e.g. INV-001" required />
                  </div>
                  <div className="sp-form-field">
                    <label className="sp-form-label">Sale Date</label>
                    <input className="sp-form-input" type="datetime-local" value={saleData.sale_date?new Date(saleData.sale_date).toISOString().slice(0,16):""} onChange={e => setSaleData(p=>({...p,sale_date:new Date(e.target.value).toISOString()}))} required />
                  </div>
                  <div className="sp-form-field">
                    <label className="sp-form-label">Payment Method</label>
                    <div className="sp-pay-methods">
                      <button type="button" className={`sp-pay-btn ${saleData.pay_method==="Cash"?"active-cash":""}`} onClick={() => setPayMethod("Cash")}>💵 Cash</button>
                      <button type="button" className={`sp-pay-btn ${saleData.pay_method==="Card"?"active-card":""}`} onClick={() => setPayMethod("Card")}>💳 Card</button>
                      <button type="button" className={`sp-pay-btn full ${saleData.pay_method==="KHQR"?"active-khqr":""}`} onClick={() => setPayMethod("KHQR")}>📱 KHQR Payment</button>
                    </div>
                  </div>
                  <button type="submit" className="sp-btn-complete" disabled={saving}>
                    {saving ? <SpinIcon /> : "✓"} {saving ? "Processing…" : "Complete Sale"}
                  </button>
                  <button type="button" className="sp-btn-cancel" onClick={() => { setShowPOS(false); resetForm(); }}>Cancel</button>
                </form>
              </div>

              {/* Panel 4 — KHQR (conditional) */}
              {saleData.pay_method === "KHQR" && (
                <div className="sp-panel sp-panel-khqr">
                  <div className="sp-panel-title" style={{color:"#dc2626"}}>📱 KHQR</div>
                  <div className="sp-khqr-amount">
                    <label>Amount to Pay</label>
                    <strong>{fmt(saleData.total)}</strong>
                  </div>
                  <button type="button" className="sp-btn-scan" onClick={startScanning} disabled={scanning}>
                    {scanning ? <><SpinIcon /> Scanning…</> : "📷 Scan Customer KHQR"}
                  </button>
                  <video id="qr-video" className="sp-qr-video" />
                  <textarea className="sp-qr-textarea" rows="3" value={saleData.qr_code} onChange={e => setSaleData(p=>({...p,qr_code:e.target.value}))} placeholder="KHQR code will appear here after scanning..." />
                  {saleData.qr_code && (
                    <div className="sp-qr-success">
                      <strong>✅ KHQR Scanned Successfully</strong>
                      <p>{saleData.qr_code.substring(0,60)}…</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesPage;