/* eslint-disable no-unused-vars */
import { useMemo, useState, useEffect, useCallback } from "react";
import { showAlert } from "../../../utils/alert";
import request from "../../../utils/request";
import { generateInvoicePDF } from "./generatePDF";
import {
  formatCambodiaDate,
  formatCambodiaDateLong,
} from "../../../utils/dateHelper";
import { QRCodeSVG } from "qrcode.react";

/* ─────────────────────────────────────────────
   Lazy-load jsPDF
───────────────────────────────────────────── */
const loadJsPDF = () =>
  new Promise((resolve) => {
    if (window.jspdf?.jsPDF) {
      resolve(window.jspdf.jsPDF);
      return;
    }
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    document.head.appendChild(s);
  });

/* ─────────────────────────────────────────────
   Google Font
───────────────────────────────────────────── */
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
);

/* ─────────────────────────────────────────────
   Product emoji fallback
───────────────────────────────────────────── */
const ProductIcon = ({ category }) => {
  const map = {
    Coffee: "☕",
    Tea: "🍵",
    Accessories: "🎧",
    Food: "🍱",
    Drink: "🥤",
    Laptops: "💻",
    Phones: "📱",
    Tablets: "📲",
    Desktops: "🖥",
  };
  return (
    <span style={{ fontSize: 32, lineHeight: 1 }} className="select-none">
      {map[category] || "📦"}
    </span>
  );
};

/* ─────────────────────────────────────────────
   Design tokens — clean white theme
───────────────────────────────────────────── */
const T = {
  bg: "#f4f6f9",
  surface: "#ffffff",
  card: "#ffffff",
  cardHov: "#fafbff",
  border: "#e8ecf2",
  borderHov: "rgba(245,160,40,0.5)",
  text: "#111827",
  sub: "#374151",
  muted: "#6b7280",
  faint: "#9ca3af",
  gold: "#f5a028",
  goldDk: "#d4820a",
  goldDim: "rgba(245,160,40,0.09)",
  goldBdr: "rgba(245,160,40,0.35)",
  green: "#16a34a",
  greenDim: "rgba(22,163,74,0.09)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.08)",
  orange: "#f97316",
  shadow: "0 1px 4px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
  shadowGold: "0 6px 20px rgba(245,160,40,0.25)",
};

/* ═══════════════════════════════════════════════════════════
   KHQR PAYMENT MODAL
═══════════════════════════════════════════════════════════ */
const QrModal = ({ amount, invoiceId, onClose, onPaymentConfirmed }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await request("/api/khqr/generate", "POST", {
          amount: parseFloat(amount),
          currency: "USD",
          billNumber: invoiceId,
        });
        res.success
          ? setQrData(res.data)
          : setError("Failed to generate QR code");
      } catch (e) {
        console.error("KHQR:", e);
        setError("Failed to generate QR code");
      } finally {
        setLoading(false);
      }
    })();
  }, [amount, invoiceId]);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(17,24,39,0.4)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          background: T.surface,
          borderRadius: 24,
          border: `1px solid ${T.border}`,
          width: 420,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: T.surface,
          }}
        >
          <div>
            <p
              style={{
                color: T.text,
                fontWeight: 800,
                fontSize: 15,
                margin: 0,
              }}
            >
              🏦 KHQR Payment
            </p>
            <p
              style={{
                color: T.muted,
                fontSize: 11,
                marginTop: 3,
                fontFamily: "monospace",
              }}
            >
              {invoiceId}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              background: T.bg,
              color: T.muted,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            background: T.bg,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: `3px solid ${T.goldBdr}`,
                  borderTopColor: T.gold,
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <p style={{ color: T.muted, fontSize: 13 }}>
                Generating QR code…
              </p>
            </div>
          )}
          {error && !loading && (
            <div
              style={{
                background: T.redDim,
                border: `1px solid rgba(239,68,68,0.25)`,
                borderRadius: 12,
                padding: "12px 16px",
                width: "100%",
                textAlign: "center",
              }}
            >
              <p style={{ color: T.red, fontWeight: 600, fontSize: 13 }}>
                {error}
              </p>
            </div>
          )}
          {qrData && !loading && (
            <>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 16,
                  boxShadow: `0 0 0 1.5px ${T.goldBdr}, ${T.shadowMd}`,
                }}
              >
                {qrData.qrCode ? (
                  <QRCodeSVG
                    value={qrData.qrCode}
                    size={220}
                    level="H"
                    includeMargin
                  />
                ) : (
                  <div
                    style={{
                      width: 220,
                      height: 220,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f9fafb",
                      borderRadius: 8,
                    }}
                  >
                    <p style={{ color: T.faint, fontSize: 13 }}>
                      QR unavailable
                    </p>
                  </div>
                )}
              </div>

              <div
                style={{
                  background: T.goldDim,
                  border: `1.5px solid ${T.goldBdr}`,
                  borderRadius: 14,
                  padding: "14px 24px",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <p
                  style={{
                    color: T.goldDk,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 4,
                  }}
                >
                  Amount to Pay / ចំនួនទឹកប្រាក់
                </p>
                <p style={{ color: T.gold, fontSize: 32, fontWeight: 900 }}>
                  ${parseFloat(amount).toFixed(2)}
                </p>
              </div>

              <div
                style={{
                  background: "rgba(59,130,246,0.07)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 10,
                  padding: "8px 14px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#2563eb", fontSize: 11, fontWeight: 600 }}>
                  Account: {qrData.accountNumber || "100169854"} (YIN KHIN)
                </p>
              </div>

              <p
                style={{
                  color: T.muted,
                  fontSize: 11,
                  textAlign: "center",
                  lineHeight: 1.7,
                }}
              >
                ស្គែន QR ដើម្បីបង់ប្រាក់ · Scan to pay
                <br />
                Works with Wing, ABA, ACLEDA &amp; all banks
                <br />
                <span style={{ color: T.gold, fontWeight: 600 }}>
                  After scanning, click Confirm below
                </span>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0 24px 24px",
            display: "flex",
            gap: 10,
            background: T.surface,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 12,
              border: `1.5px solid ${T.border}`,
              background: T.bg,
              color: T.muted,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel / បោះបង់
          </button>
          <button
            onClick={() => {
              showAlert("success", "Payment confirmed!");
              onPaymentConfirmed?.();
            }}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
            }}
          >
            ✓ Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN POS PAGE
═══════════════════════════════════════════════════════════ */
const PosPage = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [cartItems, setCartItems] = useState([]);
  const [cashReceived, setCashReceived] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All Items"]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const invoiceId = useMemo(() => `INV-${Date.now()}`, []);
  const orderNo = useMemo(() => `#${String(Date.now()).slice(-6)}`, []);

  useEffect(() => {
    loadJsPDF();
    fetchProducts();
    fetchPaymentMethods();
    fetchCustomers();
    fetchStoreInfo();
  }, []);

  // const fetchProducts = async () => {
  //   try {
  //     const r = await request("/api/products", "GET");
  //     const d = r.data || r.products || [];
  //     if (r.success && d.length > 0) {
  //       setProducts(d);
  //       // setCategories(["All Items", ...new Set(d.map((p) => p.category_id || p.desc ).filter(Boolean))]);
  //       setCategories([
  //     "All Items",
  //     ...new Set(d.map((p) => p.category?.desc).filter(Boolean)),
  //   ]);
  //     } else setProducts([]);
  //   } catch (e) { setProducts([]); showAlert("error", "Failed to load products: " + e.message); }
  // };
  const fetchProducts = async () => {
    try {
      const r = await request("/api/products", "GET");
      const d = r.data || r.products || [];

      if (r.success && d.length > 0) {
        setProducts(d);

        const uniqueCategories = [
          { code: "All Items", name: "All Items" },
          ...Array.from(
            new Map(
              d.map((p) => [
                p.category_id,
                {
                  code: p.category_id,
                  name: p.category?.desc || p.desc || p.category_id,
                },
              ]),
            ).values(),
          ),
        ];
        setCategories(uniqueCategories);
      } else {
        setProducts([]);
        setCategories([{ code: "All Items", name: "All Items" }]);
      }
    } catch (e) {
      setProducts([]);
      setCategories([{ code: "All Items", name: "All Items" }]);
      showAlert("error", "Failed to load products: " + e.message);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const r = await request("/api/payment-methods", "GET");
      const d = r.data || r.paymentMethods || [];
      if (r.success && d.length > 0) {
        const active = d.filter(
          (pm) => pm.status === "Active" || pm.is_active === 1,
        );
        setPaymentMethods(active);
        if (active.length > 0) setPaymentMethod(active[0].code);
      }
    } catch (e) {
      console.error("fetchPaymentMethods:", e);
    }
  };

  const fetchCustomers = async () => {
    try {
      const r = await request("/api/customers", "GET");
      const d = r.data || r.customers || [];
      if (r.success && d.length > 0) setCustomers(d);
    } catch (e) {
      console.error("fetchCustomers:", e);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const r = await request("/api/store-info", "GET");
      setStoreInfo(
        r.success && r.data
          ? r.data
          : { store_name: "MY STORE", email: "", website: "" },
      );
    } catch (e) {
      console.error("fetchStoreInfo:", e);
      setStoreInfo({ store_name: "MY STORE", email: "", website: "" });
    }
  };

  // const visibleProducts = useMemo(() =>
  //   products.filter((item) => {
  //     const matchCat = selectedCategory === "All Items" || item.category_id === selectedCategory;
  //     const kw = searchKeyword.trim().toLowerCase();
  //     return matchCat && (!kw || item.prd_id?.toLowerCase().includes(kw) || item.prd_name?.toLowerCase().includes(kw));
  //   }),
  //   [searchKeyword, selectedCategory, products]
  // );
  const visibleProducts = useMemo(
    () =>
      products.filter((item) => {
        const matchCat =
          selectedCategory === "All Items" ||
          item.category_id === selectedCategory;

        const kw = searchKeyword.trim().toLowerCase();

        return (
          matchCat &&
          (!kw ||
            item.prd_id?.toLowerCase().includes(kw) ||
            item.prd_name?.toLowerCase().includes(kw))
        );
      }),
    [searchKeyword, selectedCategory, products],
  );
  const addToCart = useCallback((product) => {
    const stock = parseInt(product.qty || 0);
    if (stock <= 0) {
      showAlert("error", `${product.prd_name} is out of stock!`);
      return;
    }
    setAddedId(product.prd_id);
    setTimeout(() => setAddedId(null), 400);
    setCartItems((prev) => {
      const found = prev.find((i) => i.prd_id === product.prd_id);
      if (found) {
        if (found.qty >= stock) {
          showAlert("warning", `Only ${stock} available`);
          return prev;
        }
        return prev.map((i) =>
          i.prd_id === product.prd_id
            ? { ...i, qty: Math.min(i.qty + 1, stock) }
            : i,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const updateCartQty = (prdId, delta) =>
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.prd_id !== prdId) return item;
          const max = products.find((p) => p.prd_id === prdId)?.qty || 999;
          return { ...item, qty: Math.min(max, Math.max(0, item.qty + delta)) };
        })
        .filter((i) => i.qty > 0),
    );

  const removeItem = (id) =>
    setCartItems((prev) => prev.filter((i) => i.prd_id !== id));

  const subtotal = useMemo(() => {
    const t = cartItems.reduce(
      (s, i) =>
        s +
        (parseInt(i.qty) || 0) * (parseFloat(i.unit_cost || i.price || 0) || 0),
      0,
    );
    return isNaN(t) ? 0 : Math.max(0, t);
  }, [cartItems]);

  const tax = 0;
  const discount = 0;
  const grandTotal = Math.max(0, subtotal + tax - discount);
  const paidAmount = parseFloat(cashReceived || "0") || 0;
  const change = Math.max(0, paidAmount - grandTotal);

  const handleCheckout = async () => {
    if (!cartItems.length) {
      showAlert("warning", "Cart is empty");
      return;
    }
    if (paymentMethod === "CASH" && paidAmount < grandTotal) {
      showAlert("warning", `Need $${grandTotal.toFixed(2)}`);
      return;
    }
    if (
      ["KHQR", "QRCODE", "QRPAY", "QR"].includes(paymentMethod?.toUpperCase())
    ) {
      setShowQrModal(true);
      return;
    }
    if (isNaN(grandTotal) || grandTotal < 0) {
      showAlert("error", "Invalid total");
      return;
    }
    await completeSale();
  };

  const completeSale = async () => {
    setLoading(true);
    try {
      const res = await request("/api/sales", "POST", {
        invoice_id: invoiceId,
        sale_date: new Date().toISOString(),
        amount: parseFloat(grandTotal.toFixed(2)),
        sub_total: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        pay_method: paymentMethod,
        customer_id: selectedCustomer?.customer_id || null,
        create_by: storeInfo?.website || "Sale Staff",
        items: cartItems.map((i) => ({
          prd_id: i.prd_id,
          qty: i.qty,
          price: parseFloat(parseFloat(i.unit_cost || i.price || 0).toFixed(2)),
        })),
      });
      if (res.success) {
        await generateInvoicePDF({
          invoiceId,
          saleDate: formatCambodiaDate(new Date()),
          items: [...cartItems],
          subtotal,
          tax,
          discount,
          grandTotal,
          paymentMethod,
          cashReceived: paidAmount,
          change,
          customer: selectedCustomer,
          storeInfo,
        });
        setCartItems([]);
        setCashReceived("");
        setPromoCode("");
        setSelectedCustomer(null);
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

  const resolvedMethods =
    paymentMethods.length > 0
      ? paymentMethods
      : [
          { code: "CASH", type: "Cash" },
          { code: "QRCODE", type: "QR Code" },
        ];

  const isQR = ["QRCODE", "QRPAY", "QR"].includes(paymentMethod?.toUpperCase());

  /* ──────────────────────────────────────────
     RENDER
  ────────────────────────────────────────── */
  return (
    <>
      <FontLink />
      <style>{`
        *, *::before, *::after { font-family:'Outfit',sans-serif !important; box-sizing:border-box; }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
        @keyframes popIn   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:99px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        input::placeholder { color:#c0c4ce !important; }
      `}</style>

      {showQrModal && (
        <QrModal
          amount={grandTotal}
          invoiceId={invoiceId}
          onClose={() => setShowQrModal(false)}
          onPaymentConfirmed={async () => {
            setShowQrModal(false);
            await completeSale();
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: T.bg,
        }}
      >
        {/* ══════════════════════════════
            LEFT — Products
        ══════════════════════════════ */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            background: T.surface,
            borderRight: `1px solid ${T.border}`,
          }}
        >
          {/* Top bar */}
          <div
            style={{
              padding: "18px 24px 14px",
              borderBottom: `1px solid ${T.border}`,
              background: T.surface,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <h1
                  style={{
                    color: T.text,
                    fontSize: 20,
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  🏪 Point of Sale
                </h1>
                <p style={{ color: T.muted, fontSize: 11, marginTop: 3 }}>
                  {formatCambodiaDateLong(new Date())}
                </p>
              </div>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: T.faint,
                    fontSize: 14,
                    pointerEvents: "none",
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search products…"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  style={{
                    background: T.bg,
                    border: `1.5px solid ${T.border}`,
                    borderRadius: 12,
                    color: T.text,
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "10px 16px 10px 36px",
                    width: 220,
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = T.gold;
                    e.target.style.boxShadow = `0 0 0 3px ${T.goldDim}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = T.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Category tabs */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map((cat) => {
                const active = selectedCategory === cat.code;

                return (
                  <button
                    key={cat.code}
                    onClick={() => setSelectedCategory(cat.code)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: active ? T.gold : T.bg,
                      color: active ? "#fff" : T.muted,
                      border: active ? "none" : `1px solid ${T.border}`,
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 20,
              background: T.bg,
            }}
          >
            {products.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 36,
                    animation: "spin 2s linear infinite",
                    display: "block",
                  }}
                >
                  ⚙️
                </span>
                <p style={{ color: T.faint, fontSize: 13, fontWeight: 600 }}>
                  Loading inventory…
                </p>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <p style={{ color: T.faint, fontSize: 13 }}>
                  No products found
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
                  gap: 14,
                }}
              >
                {visibleProducts.map((product, idx) => {
                  const stock = parseInt(product.qty || 0);
                  const isOut = stock <= 0;
                  const isLow = !isOut && stock <= 10;
                  const isAdded = addedId === product.prd_id;
                  return (
                    <button
                      key={product.prd_id}
                      type="button"
                      onClick={() => !isOut && addToCart(product)}
                      disabled={isOut}
                      style={{
                        background: isAdded ? "rgba(245,160,40,0.06)" : T.card,
                        border: `1.5px solid ${isAdded ? T.goldBdr : T.border}`,
                        borderRadius: 16,
                        padding: 14,
                        cursor: isOut ? "not-allowed" : "pointer",
                        opacity: isOut ? 0.5 : 1,
                        textAlign: "left",
                        position: "relative",
                        transition: "all 0.18s",
                        animation: `fadeIn 0.3s ease both`,
                        animationDelay: `${idx * 0.03}s`,
                        boxShadow: T.shadow,
                      }}
                      onMouseEnter={(e) => {
                        if (!isOut) {
                          e.currentTarget.style.borderColor = T.gold;
                          e.currentTarget.style.boxShadow = T.shadowGold;
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = T.border;
                        e.currentTarget.style.boxShadow = T.shadow;
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      {/* OUT badge */}
                      {isOut && (
                        <span
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            background: T.red,
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 900,
                            padding: "3px 7px",
                            borderRadius: 6,
                            letterSpacing: "0.06em",
                          }}
                        >
                          OUT
                        </span>
                      )}

                      {/* Product image */}
                      <div
                        style={{
                          width: "100%",
                          height: 110,
                          borderRadius: 12,
                          overflow: "hidden",
                          background: T.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 12,
                        }}
                      >
                        {product.photo ? (
                          <img
                            src={product.photo}
                            alt={product.prd_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              filter: isOut ? "grayscale(1)" : "none",
                              transition: "transform 0.3s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isOut)
                                e.target.style.transform = "scale(1.06)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                            }}
                          />
                        ) : (
                          <ProductIcon category={product.category_id} />
                        )}
                      </div>

                      <p
                        style={{
                          color: T.text,
                          fontSize: 13,
                          fontWeight: 700,
                          margin: "0 0 2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.prd_name}
                      </p>
                      <p
                        style={{
                          color: T.faint,
                          fontSize: 10,
                          marginBottom: 10,
                          fontFamily: "monospace",
                        }}
                      >
                        {product.prd_id}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            color: T.gold,
                            fontSize: 15,
                            fontWeight: 800,
                          }}
                        >
                          ${parseFloat(product.unit_cost || 0).toFixed(2)}
                        </span>
                        <span
                          style={{
                            color: isOut ? T.red : isLow ? T.orange : T.green,
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
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

        {/* ══════════════════════════════
            MIDDLE — Cart
        ══════════════════════════════ */}
        <div
          style={{
            width: 340,
            display: "flex",
            flexDirection: "column",
            background: T.surface,
            borderRight: `1px solid ${T.border}`,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 20px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  color: T.text,
                  fontSize: 14,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Active Cart
              </p>
              <p
                style={{
                  color: T.muted,
                  fontSize: 11,
                  marginTop: 2,
                  fontFamily: "monospace",
                }}
              >
                Order {orderNo}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCartItems([])}
              title="Clear cart"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.bg,
                color: T.muted,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.redDim;
                e.currentTarget.style.color = T.red;
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = T.bg;
                e.currentTarget.style.color = T.muted;
                e.currentTarget.style.borderColor = T.border;
              }}
            >
              🗑
            </button>
          </div>

          {/* Items */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 16px",
              background: T.bg,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {cartItems.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 52, opacity: 0.18 }}>🛒</span>
                <p style={{ color: T.faint, fontSize: 12, fontWeight: 600 }}>
                  Cart is empty
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.prd_id}
                  style={{
                    background: T.card,
                    border: `1.5px solid ${T.border}`,
                    borderRadius: 14,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    animation: "fadeIn 0.2s ease both",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxShadow: T.shadow,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.goldBdr;
                    e.currentTarget.style.boxShadow = `0 2px 10px rgba(245,160,40,0.1)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.boxShadow = T.shadow;
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 10,
                      overflow: "hidden",
                      background: T.bg,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt={item.prd_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <ProductIcon category={item.category_id} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        color: T.text,
                        fontSize: 12,
                        fontWeight: 700,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.prd_name}
                    </p>
                    <p
                      style={{
                        color: T.muted,
                        fontSize: 10,
                        margin: "1px 0 0",
                        fontFamily: "monospace",
                      }}
                    >
                      {item.prd_id}
                    </p>
                    <p
                      style={{
                        color: T.gold,
                        fontSize: 12,
                        fontWeight: 800,
                        marginTop: 3,
                      }}
                    >
                      $
                      {(
                        item.qty * parseFloat(item.unit_cost || item.price || 0)
                      ).toFixed(2)}
                    </p>
                  </div>

                  {/* Qty */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.prd_id, -1)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        border: `1.5px solid ${T.border}`,
                        background: T.bg,
                        color: T.muted,
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        color: T.text,
                        fontSize: 13,
                        fontWeight: 800,
                        minWidth: 20,
                        textAlign: "center",
                      }}
                    >
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.prd_id, 1)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        border: `1.5px solid ${T.goldBdr}`,
                        background: T.goldDim,
                        color: T.gold,
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.prd_id)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: "none",
                        background: "transparent",
                        color: T.faint,
                        cursor: "pointer",
                        fontSize: 16,
                        marginLeft: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = T.red)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = T.faint)
                      }
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Promo */}
          <div
            style={{
              padding: "12px 16px 16px",
              borderTop: `1px solid ${T.border}`,
              background: T.surface,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Promo code…"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{
                  flex: 1,
                  background: T.bg,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 10,
                  color: T.text,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "9px 14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = T.gold)}
                onBlur={(e) => (e.target.style.borderColor = T.border)}
              />
              <button
                type="button"
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${T.border}`,
                  background: T.bg,
                  color: T.muted,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT — Payment
        ══════════════════════════════ */}
        <aside
          style={{
            width: 288,
            display: "flex",
            flexDirection: "column",
            background: T.surface,
            borderLeft: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              padding: "18px 20px 14px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <p
              style={{
                color: T.text,
                fontSize: 14,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Payment Details
            </p>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Summary rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Subtotal", `$${subtotal.toFixed(2)}`],
                ["Tax (0%)", "$0.00"],
                [`Discount`, `-$${discount.toFixed(2)}`],
              ].map(([l, v]) => (
                <div
                  key={l}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: T.muted, fontSize: 12 }}>{l}</span>
                  <span style={{ color: T.sub, fontSize: 12, fontWeight: 600 }}>
                    {v}
                  </span>
                </div>
              ))}

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: T.goldDim,
                  border: `1.5px solid ${T.goldBdr}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginTop: 4,
                }}
              >
                <span
                  style={{ color: T.goldDk, fontSize: 13, fontWeight: 700 }}
                >
                  Total Payable
                </span>
                <span
                  style={{
                    color: T.gold,
                    fontSize: 26,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment method buttons */}
            <div>
              <p
                style={{
                  color: T.faint,
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: 10,
                }}
              >
                Payment Method
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    resolvedMethods.length <= 2 ? "1fr 1fr" : "repeat(3,1fr)",
                  gap: 8,
                }}
              >
                {resolvedMethods.map((method) => {
                  const active = paymentMethod === method.code;
                  const isQrBtn = ["QRCODE", "QRPAY", "QR"].includes(
                    method.code?.toUpperCase(),
                  );
                  const icon = isQrBtn
                    ? "▦"
                    : method.type === "Cash"
                      ? "💵"
                      : method.type === "Card"
                        ? "💳"
                        : "💰";
                  return (
                    <button
                      key={method.code}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method.code);
                        if (isQrBtn) setShowQrModal(true);
                      }}
                      style={{
                        padding: "12px 6px",
                        borderRadius: 12,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        transition: "all 0.18s",
                        background: active ? T.gold : T.bg,
                        color: active ? "#fff" : T.muted,
                        border: active ? "none" : `1.5px solid ${T.border}`,
                        boxShadow: active ? T.shadowGold : T.shadow,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      <span>{method.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QR inline preview */}
            {isQR && (
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                style={{
                  background: T.goldDim,
                  border: `1.5px solid ${T.goldBdr}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = T.shadowGold)
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`PAY|${invoiceId}|${grandTotal}`)}&bgcolor=fffbeb&color=d4820a&margin=4`}
                  alt="QR preview"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    flexShrink: 0,
                    border: `1px solid ${T.goldBdr}`,
                  }}
                />
                <div style={{ textAlign: "left", flex: 1 }}>
                  <p
                    style={{
                      color: T.goldDk,
                      fontSize: 11,
                      fontWeight: 800,
                      margin: 0,
                    }}
                  >
                    Tap to open full QR
                  </p>
                  <p
                    style={{
                      color: T.gold,
                      fontSize: 14,
                      fontWeight: 900,
                      margin: "3px 0 2px",
                    }}
                  >
                    ${grandTotal.toFixed(2)}
                  </p>
                  <p style={{ color: T.muted, fontSize: 10 }}>
                    ចុចដើម្បីបង្ហាញ QR ពេញ
                  </p>
                </div>
                <span style={{ color: T.gold, fontSize: 18 }}>↗</span>
              </button>
            )}

            {/* Cash received */}
            {!isQR && (
              <div>
                <label
                  style={{
                    color: T.faint,
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Cash Received
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  disabled={paymentMethod !== "CASH"}
                  style={{
                    width: "100%",
                    background: T.bg,
                    border: `1.5px solid ${T.border}`,
                    borderRadius: 12,
                    color: T.text,
                    fontSize: 22,
                    fontWeight: 800,
                    padding: "12px 16px",
                    outline: "none",
                    textAlign: "right",
                    opacity: paymentMethod !== "CASH" ? 0.4 : 1,
                    cursor: paymentMethod !== "CASH" ? "not-allowed" : "text",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = T.gold;
                    e.target.style.boxShadow = `0 0 0 3px ${T.goldDim}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = T.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <span style={{ color: T.muted, fontSize: 12 }}>Change</span>
                  <span
                    style={{
                      color: change > 0 ? T.green : T.faint,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    ${change.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Customer */}
            <div>
              <p
                style={{
                  color: T.faint,
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: 8,
                }}
              >
                Customer
              </p>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                style={{
                  width: "100%",
                  background: T.bg,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "border-color 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.gold;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${T.goldDim}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <p
                    style={{
                      color: T.text,
                      fontSize: 12,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {selectedCustomer
                      ? selectedCustomer.customer_name
                      : "Guest Customer"}
                  </p>
                  <p style={{ color: T.faint, fontSize: 10, marginTop: 2 }}>
                    {selectedCustomer
                      ? selectedCustomer.customer_email ||
                        selectedCustomer.customer_phone ||
                        "No contact"
                      : "Walk-in Customer"}
                  </p>
                </div>
                <span style={{ color: T.muted, fontSize: 13 }}>✎</span>
              </button>
            </div>
          </div>

          {/* Checkout */}
          <div
            style={{
              padding: "12px 20px 20px",
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              style={{
                width: "100%",
                padding: "15px 0",
                borderRadius: 14,
                border: "none",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.02em",
                cursor:
                  loading || cartItems.length === 0 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                background:
                  loading || cartItems.length === 0
                    ? T.bg
                    : "linear-gradient(135deg,#f5a028 0%,#f97316 100%)",
                color: loading || cartItems.length === 0 ? T.faint : "#fff",
                boxShadow:
                  loading || cartItems.length === 0 ? "none" : T.shadowGold,
              }}
              onMouseEnter={(e) => {
                if (!loading && cartItems.length > 0)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }}
                  >
                    ⊙
                  </span>
                  Generating PDF…
                </span>
              ) : (
                <span>📄 Checkout · ${grandTotal.toFixed(2)}</span>
              )}
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 8,
              }}
            >
              {[
                ["⏸ Hold", () => showAlert("info", "Order held")],
                ["＋ New", () => showAlert("info", "New order")],
              ].map(([label, fn]) => (
                <button
                  key={label}
                  type="button"
                  onClick={fn}
                  style={{
                    padding: "10px 0",
                    borderRadius: 10,
                    border: `1.5px solid ${T.border}`,
                    background: T.bg,
                    color: T.muted,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = T.surface;
                    e.currentTarget.style.color = T.sub;
                    e.currentTarget.style.boxShadow = T.shadowMd;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = T.bg;
                    e.currentTarget.style.color = T.muted;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════
            CUSTOMER MODAL
        ══════════════════════════════ */}
        {showCustomerModal && (
          <div
            onClick={(e) =>
              e.target === e.currentTarget && setShowCustomerModal(false)
            }
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(17,24,39,0.35)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                width: 380,
                overflow: "hidden",
                boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
                animation: "fadeIn 0.2s ease both",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: `1px solid ${T.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    color: T.text,
                    fontWeight: 800,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  Select Customer
                </p>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: `1px solid ${T.border}`,
                    background: T.bg,
                    color: T.muted,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <input
                  type="text"
                  placeholder="Search customers…"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  autoFocus
                  style={{
                    background: T.bg,
                    border: `1.5px solid ${T.border}`,
                    borderRadius: 10,
                    color: T.text,
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "10px 14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = T.gold)}
                  onBlur={(e) => (e.target.style.borderColor = T.border)}
                />

                <div
                  style={{
                    maxHeight: 280,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerModal(false);
                    }}
                    style={{
                      background: !selectedCustomer ? T.goldDim : T.bg,
                      border: !selectedCustomer
                        ? `1.5px solid ${T.goldBdr}`
                        : `1px solid ${T.border}`,
                      borderRadius: 12,
                      padding: "11px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <p
                      style={{
                        color: !selectedCustomer ? T.gold : T.text,
                        fontSize: 12,
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      👤 Guest Customer
                    </p>
                    <p style={{ color: T.faint, fontSize: 10, marginTop: 2 }}>
                      Walk-in Customer
                    </p>
                  </button>

                  {customers
                    .filter((c) =>
                      c.customer_name
                        ?.toLowerCase()
                        .includes(customerSearch.toLowerCase()),
                    )
                    .map((c) => {
                      const sel =
                        selectedCustomer?.customer_id === c.customer_id;
                      return (
                        <button
                          key={c.customer_id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(c);
                            setShowCustomerModal(false);
                          }}
                          style={{
                            background: sel ? T.goldDim : T.bg,
                            border: sel
                              ? `1.5px solid ${T.goldBdr}`
                              : `1px solid ${T.border}`,
                            borderRadius: 12,
                            padding: "11px 14px",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            if (!sel)
                              e.currentTarget.style.borderColor = T.gold;
                          }}
                          onMouseLeave={(e) => {
                            if (!sel)
                              e.currentTarget.style.borderColor = T.border;
                          }}
                        >
                          <p
                            style={{
                              color: sel ? T.gold : T.text,
                              fontSize: 12,
                              fontWeight: 700,
                              margin: 0,
                            }}
                          >
                            👤 {c.customer_name}
                          </p>
                          <p
                            style={{
                              color: T.faint,
                              fontSize: 10,
                              marginTop: 2,
                            }}
                          >
                            {c.customer_email ||
                              c.customer_phone ||
                              "No contact"}
                          </p>
                        </button>
                      );
                    })}
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
