/* eslint-disable no-unused-vars */

import { useMemo, useState, useEffect } from "react";
import { showAlert } from "../../../utils/alert";
import request from "../../../utils/request";
import { generateInvoicePDF } from "./generatePDF";
import { formatCambodiaDate, formatCambodiaDateLong } from "../../../utils/dateHelper";
import { QRCodeSVG } from 'qrcode.react';

const loadJsPDF = () =>
  new Promise((resolve) => {
    if (window.jspdf?.jsPDF) { resolve(window.jspdf.jsPDF); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    document.head.appendChild(s);
  });
/* fetch image URL → base64 via canvas (for QR in PDF) */
const fetchImageAsBase64 = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });

/* ── Google Font ───────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
);

/* ── ProductIcon ───────────────────────────────────────────────────── */
const ProductIcon = ({ category }) => {
  const map = { Coffee: "☕", Tea: "🍵", Accessories: "🛠", Food: "🍱", Drink: "🥤" };
  return <span className="text-2xl select-none">{map[category] || "📦"}</span>;
};

/* ══════════════════════════════════════════════════════════════════════
   KHQR MODAL - Wing Direct Payment QR Code
══════════════════════════════════════════════════════════════════════ */
const QrModal = ({ amount, invoiceId, onClose, onPaymentConfirmed }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate KHQR code when modal opens
  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        const response = await request('/api/khqr/generate', 'POST', {
          amount: parseFloat(amount),
          currency: 'USD',
          billNumber: invoiceId
        });

        if (response.success) {
          setQrData(response.data);
          console.log('✅ KHQR generated:', response.data);
        } else {
          setError('Failed to generate QR code');
        }
      } catch (err) {
        console.error('QR generation error:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [amount, invoiceId]);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rounded-3xl overflow-hidden"
        style={{ background: "#fff", border: "1.5px solid #e2e8f0",
          boxShadow: "0 32px 80px rgba(0,0,0,0.18)", width: 400 }}>
        <div className="px-6 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h3 className="font-extrabold text-base" style={{ color: "#0f172a" }}>🏦 KHQR Payment</h3>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{invoiceId}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>✕</button>
        </div>
        
        <div className="flex flex-col items-center px-6 pt-6 pb-4 gap-4">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-sm" style={{ color: "#64748b" }}>Generating QR code...</p>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
              <p className="text-sm font-semibold" style={{ color: "#991b1b" }}>{error}</p>
            </div>
          )}

          {qrData && !loading && (
            <>
              <div className="rounded-2xl p-4" style={{ background: "#f8fafc", border: "2px solid #e2e8f0" }}>
                {qrData.qrCode ? (
                  <QRCodeSVG 
                    value={qrData.qrCode} 
                    size={250}
                    level="H"
                    includeMargin={true}
                  />
                ) : (
                  <div className="w-[250px] h-[250px] flex items-center justify-center bg-gray-100 rounded">
                    <p className="text-sm text-gray-500">QR Code unavailable</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 rounded-2xl text-center w-full"
                style={{ background: "#fffbeb", border: "1.5px solid #fcd34d" }}>
                <p className="text-xs font-bold mb-1" style={{ color: "#92400e" }}>Amount to Pay / ចំនួនទឹកប្រាក់</p>
                <p className="text-3xl font-extrabold" style={{ color: "#f59e0b" }}>
                  ${parseFloat(amount).toFixed(2)}
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl" style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}>
                <p className="text-xs font-semibold text-center" style={{ color: "#1e40af" }}>
                  Account: {qrData.accountNumber || '100169854'} (YIN KHIN)
                </p>
              </div>

              {/* {qrData.md5Hash && (
                <div className="px-4 py-2 rounded-xl" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
                  <p className="text-xs font-semibold text-center mb-1" style={{ color: "#166534" }}>
                    🔐 Verification Hash (MD5)
                  </p>
                  <p className="text-xs font-mono text-center break-all" style={{ color: "#15803d" }}>
                    {qrData.md5Hash}
                  </p>
                  <p className="text-xs text-center mt-1" style={{ color: "#16a34a" }}>
                    Use this to verify on Bakong gateway
                  </p>
                </div>
              )} */}

              <p className="text-xs text-center" style={{ color: "#94a3b8" }}>
                ស្គែន QR ដើម្បីបង់ប្រាក់ · Scan to pay<br />
                Works with Wing, ABA, ACLEDA, all banks<br />
                <span style={{ color: "#f59e0b", fontWeight: "600" }}>After scanning, click "Confirm" button below</span>
              </p>
            </>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
            Cancel / បោះបង់
          </button>
          <button 
            onClick={() => {
              showAlert('success', 'Payment confirmed! Sale completed.');
              onPaymentConfirmed?.();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#10b981", color: "#fff", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
            ✓ Confirm Payment 
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   MAIN POS PAGE
══════════════════════════════════════════════════════════════════════ */
const PosPage = () => {
  const [searchKeyword, setSearchKeyword]         = useState("");
  const [selectedCategory, setSelectedCategory]   = useState("All Items");
  const [cartItems, setCartItems]                 = useState([]);
  const [cashReceived, setCashReceived]           = useState("");
  const [promoCode, setPromoCode]                 = useState("");
  const [paymentMethod, setPaymentMethod]         = useState("CASH");
  const [currency, setCurrency]                   = useState("USD"); // USD or KHR
  const [products, setProducts]                   = useState([]);
  const [categories, setCategories]               = useState(["All Items"]);
  const [paymentMethods, setPaymentMethods]       = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [customers, setCustomers]                 = useState([]);
  const [selectedCustomer, setSelectedCustomer]   = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch]       = useState("");
  const [showQrModal, setShowQrModal]             = useState(false);
  const [storeInfo, setStoreInfo]                 = useState(null);

  const invoiceId = useMemo(() => `INV-${Date.now()}`, []);
  
  // Exchange rate: 1 USD = 4100 KHR (approximate)
  const exchangeRate = 4100;

  useEffect(() => {
    loadJsPDF();
    fetchProducts();
    fetchPaymentMethods();
    fetchCustomers();
    fetchStoreInfo();
  }, []);

  const fetchProducts = async () => {
    try {
      const r = await request("/api/products", "GET");
      const d = r.data || r.products || [];
      if (r.success && d.length > 0) {
        setProducts(d);
        setCategories(["All Items", ...new Set(d.map((p) => p.category_id).filter(Boolean))]);
      } else setProducts([]);
    } catch (e) { setProducts([]); showAlert("error", "Failed to load products: " + e.message); }
  };

  const fetchPaymentMethods = async () => {
    try {
      const r = await request("/api/payment-methods", "GET");
      const d = r.data || r.paymentMethods || [];
      if (r.success && d.length > 0) {
        const active = d.filter((pm) => pm.status === "Active" || pm.is_active === 1);
        setPaymentMethods(active);
        if (active.length > 0) setPaymentMethod(active[0].code);
      }
    } catch (e) { console.error(e); }
  };

  const fetchCustomers = async () => {
    try {
      const r = await request("/api/customers", "GET");
      const d = r.data || r.customers || [];
      if (r.success && d.length > 0) setCustomers(d);
    } catch (e) { console.error(e); }
  };

  const fetchStoreInfo = async () => {
    try {
      const r = await request("/api/store-info", "GET");
      if (r.success && r.data) {
        setStoreInfo(r.data);
      }
    } catch (e) {
      console.error("Failed to fetch store info:", e);
      // Set default store info if fetch fails
      setStoreInfo({
        store_name: "MY STORE",
        email: "",
        website: ""
      });
    }
  };

  const visibleProducts = useMemo(() =>
    products.filter((item) => {
      const matchCat = selectedCategory === "All Items" || item.category_id === selectedCategory;
      const kw = searchKeyword.trim().toLowerCase();
      return matchCat && (!kw || item.prd_id?.toLowerCase().includes(kw) || item.prd_name?.toLowerCase().includes(kw));
    }),
    [searchKeyword, selectedCategory, products]
  );

  const addToCart = (product) => {
    const stock = parseInt(product.qty || 0);
    if (stock <= 0) { showAlert("error", `${product.prd_name} is out of stock!`); return; }
    setCartItems((prev) => {
      const found = prev.find((i) => i.prd_id === product.prd_id);
      if (found) {
        if (found.qty >= stock) { showAlert("warning", `Only ${stock} available`); return prev; }
        return prev.map((i) => i.prd_id === product.prd_id ? { ...i, qty: Math.min(i.qty + 1, stock) } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (prdId, delta) =>
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.prd_id !== prdId) return item;
        const max = products.find((p) => p.prd_id === prdId)?.qty || 999;
        return { ...item, qty: Math.min(max, Math.max(0, item.qty + delta)) };
      }).filter((i) => i.qty > 0)
    );

  const removeItem = (id) => setCartItems((prev) => prev.filter((i) => i.prd_id !== id));

  // Currency formatting helper
  const formatCurrency = (amount, curr = currency) => {
    const num = parseFloat(amount) || 0;
    if (curr === "KHR") {
      return `${Math.round(num).toLocaleString('en-US')}៛`; // Riel symbol
    }
    // USD - support up to 3 decimal places for precision
    return `$${num.toFixed(3).replace(/\.?0+$/, '')}`; // Remove trailing zeros
  };

  // Convert between currencies
  const convertCurrency = (amount, fromCurr, toCurr) => {
    if (fromCurr === toCurr) return amount;
    if (fromCurr === "USD" && toCurr === "KHR") return amount * exchangeRate;
    if (fromCurr === "KHR" && toCurr === "USD") return amount / exchangeRate;
    return amount;
  };

  const subtotal   = useMemo(() => {
    const total = cartItems.reduce((s, i) => {
      const price = parseFloat(i.unit_cost || i.price || 0) || 0;
      const qty = parseInt(i.qty || 0) || 0;
      return s + (qty * price);
    }, 0);
    return isNaN(total) ? 0 : Math.max(0, total); // Ensure non-negative
  }, [cartItems]);
  const tax        = 0;
  const discount   = 0;
  const grandTotal = Math.max(0, subtotal + tax - discount); // Ensure non-negative
  
  // Convert grand total to selected currency for display
  const grandTotalInCurrency = currency === "KHR" ? grandTotal * exchangeRate : grandTotal;
  
  const paidAmount = parseFloat(cashReceived || "0") || 0;
  const change     = Math.max(0, paidAmount - grandTotalInCurrency);
  const orderNo    = `#${String(Date.now()).slice(-6)}`;

  const handleCheckout = async () => {
    if (!cartItems.length) { showAlert("warning", "Cart is empty"); return; }
    if (paymentMethod === "CASH" && paidAmount < grandTotalInCurrency) { 
      showAlert("warning", `Cash received is not enough. Need ${formatCurrency(grandTotalInCurrency)}`); 
      return; 
    }
    
    // For KHQR payment, show QR modal first
    const isKHQR = ["KHQR", "QRCODE", "QRPAY", "QR"].includes(paymentMethod?.toUpperCase());
    if (isKHQR) {
      setShowQrModal(true);
      return;
    }
    
    // Validate totals before sending
    if (isNaN(grandTotal) || grandTotal < 0) {
      showAlert("error", "Invalid order total. Please check cart items.");
      return;
    }

    await completeSale();
  };

  const completeSale = async () => {
    setLoading(true);
    try {
      const res = await request("/api/sales", "POST", {
        invoice_id:  invoiceId,
        sale_date:   new Date().toISOString(),
        amount:      parseFloat(grandTotal.toFixed(2)),
        sub_total:   parseFloat(subtotal.toFixed(2)),
        tax:         parseFloat(tax.toFixed(2)),
        pay_method:  paymentMethod,
        customer_id: selectedCustomer?.customer_id || null,
        create_by:   "POS User",
        items: cartItems.map((i) => ({ 
          prd_id: i.prd_id, 
          qty: i.qty, 
          price: parseFloat(parseFloat(i.unit_cost || i.price || 0).toFixed(2))
        })),
      });

      if (res.success) {
        await generateInvoicePDF({
          invoiceId, saleDate: formatCambodiaDate(new Date()),
          items: [...cartItems], subtotal, tax, discount, grandTotal,
          paymentMethod, cashReceived: paidAmount, change,
          customer: selectedCustomer,
          storeInfo: storeInfo,
        });
        setCartItems([]); setCashReceived(""); setPromoCode(""); setSelectedCustomer(null);
        fetchProducts();
        showAlert("success", "Sale completed — PDF downloaded!");
      } else {
        showAlert("error", res.message || "Failed to complete sale");
      }
    } catch (e) {
      console.error(e);
      showAlert("error", "Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  const resolvedMethods = paymentMethods.length > 0
    ? paymentMethods
    : [{ code: "CASH", type: "Cash" }, { code: "QRCODE", type: "QR Code" }];

  const isQR = ["QRCODE","QRPAY","QR"].includes(paymentMethod?.toUpperCase());

  const C = {
    bg: "#f8fafc", panel: "#ffffff", alt: "#f1f5f9",
    border: "#e2e8f0", text: "#0f172a", muted: "#64748b", faint: "#94a3b8",
    accent: "#f59e0b", accentBg: "#fffbeb", accentBdr: "#fcd34d",
    green: "#16a34a", orange: "#ea580c", red: "#dc2626",
  };
  const inp = { background: C.alt, border: `1.5px solid ${C.border}`, color: C.text, outline: "none", borderRadius: 12 };

  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { font-family: 'Plus Jakarta Sans', sans-serif !important; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
      `}</style>

      {showQrModal && (
        <QrModal 
          amount={grandTotal} 
          invoiceId={invoiceId} 
          onClose={() => setShowQrModal(false)}
          onPaymentConfirmed={async () => {
            await completeSale();
          }}
        />
      )}

      <div className="flex h-screen overflow-hidden" style={{ background: C.bg }}>

        {/* ══ LEFT — Products ════════════════════════════════════════ */}
        <div className="flex flex-col flex-1 min-w-0" style={{ background: C.panel, borderRight: `1px solid ${C.border}` }}>
          <div className="px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-extrabold" style={{ color: C.text }}>🏪 Point of Sale</h1>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                  {formatCambodiaDateLong(new Date())}
                </p>
              </div>
              <div className="relative">
                <input type="text" placeholder="Search products…" value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="text-sm w-56 px-4 py-2.5 pl-10 rounded-xl transition-all" style={inp}
                  onFocus={(e) => (e.target.style.borderColor = C.accentBdr)}
                  onBlur={(e)  => (e.target.style.borderColor = C.border)} />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: C.faint }}>🔍</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={selectedCategory === cat
                    ? { background: C.accent, color: "#fff", border: `1.5px solid ${C.accent}` }
                    : { background: C.alt, color: C.muted, border: `1px solid ${C.border}` }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5" style={{ background: C.bg }}>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <span className="text-4xl animate-pulse">⏳</span>
                <p className="text-sm font-semibold" style={{ color: C.faint }}>Loading inventory…</p>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: C.faint }}>No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {visibleProducts.map((product) => {
                  const stock = parseInt(product.qty || 0);
                  const isOut = stock <= 0; const isLow = !isOut && stock <= 10;
                  return (
                    <button key={product.prd_id} type="button"
                      onClick={() => !isOut && addToCart(product)} disabled={isOut}
                      className="relative text-left rounded-2xl p-4 transition-all active:scale-95"
                      style={{ background: C.panel, border: `1.5px solid ${C.border}`,
                        opacity: isOut ? 0.5 : 1, cursor: isOut ? "not-allowed" : "pointer",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                      onMouseEnter={(e) => { if (!isOut) { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = "0 4px 16px rgba(245,158,11,0.15)"; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>
                     
                      <div className="w-25 h-25 relative rounded-xl flex items-center justify-center mb-3 " style={{ background: C.alt }}>
                        {product.photo ? <img src={product.photo} alt={product.prd_name} className={` w-full h-full  object-cover rounded-xl ${isOut ? "grayscale" : ""}`} /> : <ProductIcon category={product.category_id} />}
                      </div>
                       {isOut && <span className=" absolute top-1  right-3 text-white text-[10px] font-black px-2 py-0.5 rounded-md" style={{ background: C.red }}>OUT</span>}
                      <p className="text-sm font-bold truncate mb-1" style={{ color: C.text }}>{product.prd_name}</p>
                      <p className="text-[11px] mb-2" style={{ color: C.faint }}>{product.prd_id}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold" style={{ color: C.accent }}>${parseFloat(product.unit_cost || 0).toFixed(2)}</span>
                        <span className="text-[11px] font-bold" style={{ color: isOut ? C.red : isLow ? C.orange : C.green }}>
                          {isOut ? "Out of stock" : `${stock} left`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ MIDDLE — Cart ══════════════════════════════════════════ */}
        <div className="flex flex-col w-[22rem]" style={{ background: C.panel, borderRight: `1px solid ${C.border}` }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div>
              <h2 className="font-extrabold text-sm" style={{ color: C.text }}>Active Cart</h2>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>Order {orderNo}</p>
            </div>
            <button type="button" onClick={() => setCartItems([])}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
              style={{ background: C.alt, color: C.muted, border: `1px solid ${C.border}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = C.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.alt; e.currentTarget.style.color = C.muted; }}>🗑</button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ background: C.bg }}>
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pb-8 gap-3">
                <span className="text-5xl" style={{ opacity: 0.2 }}>🛒</span>
                <p className="text-xs font-semibold" style={{ color: C.faint }}>Cart is empty</p>
              </div>
            ) : cartItems.map((item) => (
              <div key={item.prd_id} className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: C.panel, border: `1.5px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.alt }}>
                  {item.photo ? <img src={item.photo} alt={item.prd_name} className="w-full h-full object-cover rounded-lg" /> : <ProductIcon category={item.category_id} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: C.text }}>{item.prd_name}</p>
                  <p className="text-[10px]" style={{ color: C.faint }}>{item.prd_id}</p>
                  <p className="text-[11px] font-extrabold mt-0.5" style={{ color: C.accent }}>
                    ${(item.qty * parseFloat(item.unit_cost || item.price || 0)).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => updateCartQty(item.prd_id, -1)}
                    className="w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center"
                    style={{ background: C.alt, color: C.muted, border: `1px solid ${C.border}` }}>−</button>
                  <span className="text-xs font-extrabold w-6 text-center" style={{ color: C.text }}>{item.qty}</span>
                  <button type="button" onClick={() => updateCartQty(item.prd_id, 1)}
                    className="w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center"
                    style={{ background: C.accentBg, color: C.accent, border: `1px solid ${C.accentBdr}` }}>+</button>
                  <button type="button" onClick={() => removeItem(item.prd_id)}
                    className="w-6 h-6 rounded-lg text-xs flex items-center justify-center ml-1"
                    style={{ color: C.faint }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.red)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C.faint)}>×</button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4 pt-3" style={{ borderTop: `1px solid ${C.border}`, background: C.panel }}>
            <div className="flex gap-2">
              <input type="text" placeholder="Promo code…" value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 text-xs px-3 py-2.5 rounded-xl transition-all" style={inp}
                onFocus={(e) => (e.target.style.borderColor = C.accentBdr)}
                onBlur={(e)  => (e.target.style.borderColor = C.border)} />
              <button type="button" className="px-4 py-2 rounded-xl text-xs font-bold"
                style={{ background: C.alt, color: C.muted, border: `1px solid ${C.border}` }}>Apply</button>
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Payment ════════════════════════════════════════ */}
        <aside className="flex flex-col w-72" style={{ background: C.panel, borderLeft: `1px solid ${C.border}` }}>
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <h2 className="font-extrabold text-sm" style={{ color: C.text }}>Payment Details</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* breakdown */}
            <div className="space-y-2.5">
              {[
                ["Subtotal",  `$${subtotal.toFixed(2)}`],
                ["Tax (0%)", `$${(0).toFixed(2)}`],
                ["Discount", `-$${discount.toFixed(2)}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-xs" style={{ color: C.muted }}>{l}</span>
                  <span className="text-xs font-semibold" style={{ color: C.text }}>{v}</span>
                </div>
              ))}
              {/* highlighted total */}
              <div className="flex justify-between items-center px-4 py-3 rounded-2xl mt-1"
                style={{ background: C.accentBg, border: `1.5px solid ${C.accentBdr}` }}>
                <span className="text-sm font-bold" style={{ color: "#92400e" }}>Total Payable</span>
                <span className="text-2xl font-extrabold" style={{ color: C.accent }}>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* payment methods */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: C.faint }}>Payment Method</p>
              <div className={`grid gap-2 ${resolvedMethods.length <= 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {resolvedMethods.map((method) => {
                  const active  = paymentMethod === method.code;
                  const isQrBtn = ["QRCODE","QRPAY","QR"].includes(method.code?.toUpperCase());
                  const icon    = isQrBtn ? "▦" : method.type === "Cash" ? "💵" : method.type === "Card" ? "💳" : "💰";
                  return (
                    <button key={method.code} type="button"
                      onClick={() => { setPaymentMethod(method.code); if (isQrBtn) setShowQrModal(true); }}
                      className="py-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all"
                      style={active
                        ? { background: C.accent, color: "#fff", border: `1.5px solid ${C.accent}`, boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }
                        : { background: C.alt, color: C.muted, border: `1.5px solid ${C.border}` }}>
                      <span className="text-lg">{icon}</span>
                      <span>{method.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QR inline preview */}
            {isQR && (
              <button type="button" onClick={() => setShowQrModal(true)}
                className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all"
                style={{ background: C.accentBg, border: `1.5px solid ${C.accentBdr}` }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(245,158,11,0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`PAY|${invoiceId}|${grandTotal}`)}&bgcolor=fffbeb&color=0f172a&margin=4`}
                  alt="QR" className="rounded-lg shrink-0"
                  style={{ width: 54, height: 54, border: `1px solid ${C.accentBdr}` }} />
                <div className="text-left flex-1">
                  <p className="text-xs font-extrabold" style={{ color: "#92400e" }}>Tap to open full QR</p>
                  <p className="text-[11px] mt-0.5 font-bold" style={{ color: C.accent }}>${grandTotal.toFixed(2)}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#b45309" }}>ចុចដើម្បីបង្ហាញ QR ពេញ</p>
                </div>
                <span style={{ color: C.accent, fontSize: 18 }}>↗</span>
              </button>
            )}

            {/* cash received */}
            {!isQR && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: C.faint }}>Cash Received</label>
                <input type="number" min="0" step="0.01" value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00" disabled={paymentMethod !== "CASH"}
                  className="w-full text-right text-xl font-extrabold px-4 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={inp}
                  onFocus={(e) => (e.target.style.borderColor = C.accentBdr)}
                  onBlur={(e)  => (e.target.style.borderColor = C.border)} />
                <div className="flex justify-between mt-2">
                  <span className="text-xs" style={{ color: C.muted }}>Change</span>
                  <span className="text-xs font-extrabold" style={{ color: change > 0 ? C.green : C.faint }}>${change.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* customer */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.faint }}>Customer</p>
              <button type="button" onClick={() => setShowCustomerModal(true)}
                className="w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all"
                style={{ background: C.alt, border: `1.5px solid ${C.border}` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}>
                <div className="text-left">
                  <p className="text-xs font-bold" style={{ color: C.text }}>
                    {selectedCustomer ? selectedCustomer.customer_name : "Guest Customer"}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: C.faint }}>
                    {selectedCustomer ? selectedCustomer.customer_email || selectedCustomer.customer_phone || "No contact" : "Walk-in Customer"}
                  </p>
                </div>
                <span style={{ color: C.faint, fontSize: 12 }}>✎</span>
              </button>
            </div>
          </div>

          {/* checkout */}
          <div className="px-5 pb-5 pt-3 space-y-2" style={{ borderTop: `1px solid ${C.border}` }}>
            <button type="button" onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              className="w-full py-4 rounded-2xl font-extrabold text-sm tracking-wide transition-all"
              style={loading || cartItems.length === 0
                ? { background: C.alt, color: C.faint, cursor: "not-allowed", border: `1px solid ${C.border}` }
                : { background: C.accent, color: "#fff", boxShadow: "0 4px 16px rgba(245,158,11,0.35)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block">⊙</span> Generating PDF…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  📄 Checkout & Download · ${grandTotal.toFixed(2)}
                </span>
              )}
            </button>
            <div className="grid grid-cols-2 gap-2">
              {[["⏸ Hold", () => showAlert("info", "Order held")], ["＋ New", () => showAlert("info", "New order")]].map(([label, fn]) => (
                <button key={label} type="button" onClick={fn}
                  className="py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: C.alt, color: C.muted, border: `1px solid ${C.border}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.border)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = C.alt)}>{label}</button>
              ))}
            </div>
          </div>
        </aside>

        {/* ══ Customer Modal ════════════════════════════════════════ */}
        {showCustomerModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(6px)" }}
            onClick={(e) => e.target === e.currentTarget && setShowCustomerModal(false)}>
            <div className="w-96 rounded-2xl overflow-hidden"
              style={{ background: C.panel, border: `1.5px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
                <h3 className="font-extrabold text-sm" style={{ color: C.text }}>Select Customer</h3>
                <button type="button" onClick={() => setShowCustomerModal(false)}
                  className="w-7 h-7 rounded-lg text-xs flex items-center justify-center"
                  style={{ background: C.alt, color: C.muted, border: `1px solid ${C.border}` }}>✕</button>
              </div>
              <div className="p-4 space-y-3">
                <input type="text" placeholder="Search customers…" value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)} autoFocus
                  className="w-full text-sm px-4 py-2.5 rounded-xl transition-all" style={inp}
                  onFocus={(e) => (e.target.style.borderColor = C.accentBdr)}
                  onBlur={(e)  => (e.target.style.borderColor = C.border)} />
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  <button type="button" onClick={() => { setSelectedCustomer(null); setShowCustomerModal(false); }}
                    className="w-full text-left px-4 py-3 rounded-xl transition-all"
                    style={!selectedCustomer
                      ? { background: C.accentBg, border: `1.5px solid ${C.accentBdr}`, color: C.accent }
                      : { background: C.alt, border: `1px solid ${C.border}`, color: C.text }}>
                    <p className="text-xs font-bold">👤 Guest Customer</p>
                    <p className="text-[11px] mt-0.5" style={{ color: C.faint }}>Walk-in Customer</p>
                  </button>
                  {customers
                    .filter((c) => c.customer_name?.toLowerCase().includes(customerSearch.toLowerCase()))
                    .map((c) => (
                      <button key={c.customer_id} type="button"
                        onClick={() => { setSelectedCustomer(c); setShowCustomerModal(false); }}
                        className="w-full text-left px-4 py-3 rounded-xl transition-all"
                        style={selectedCustomer?.customer_id === c.customer_id
                          ? { background: C.accentBg, border: `1.5px solid ${C.accentBdr}`, color: C.accent }
                          : { background: C.alt, border: `1px solid ${C.border}`, color: C.text }}>
                        <p className="text-xs font-bold">👤 {c.customer_name}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: C.faint }}>
                          {c.customer_email || c.customer_phone || "No contact"}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PosPage;
