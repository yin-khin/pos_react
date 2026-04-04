import { useEffect, useState, useCallback } from "react";
import request from "../../../utils/request";

// Components
import Ticker from "./components/Ticker";
import Header from "./components/Header";
import Hero from "./components/Hero";
import FilterSidebar from "./components/FilterSidebar";
import ProductGrid from "./components/ProductGrid";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

// Modals
import AuthModal from "./modals/AuthModal";
import CartDrawer from "./modals/CartDrawer";
import CheckoutModal from "./modals/CheckoutModal";

// Utils
import { mapProduct } from "./utils/helpers";
import { API_BASE_URL, PER_PAGE } from "./utils/constants";

// Styles
import "./styles/mainPage.css";

const MainPage = () => {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("maison_theme");
    return savedTheme ? savedTheme === "dark" : true; // Default to dark mode
  });

  // Auth state
  const [authModal, setAuthModal] = useState(null);
  const [user, setUser] = useState(() => {
    // Load user from localStorage on initial render
    const savedUser = localStorage.getItem("maison_user");
    return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem("maison_cart");
    return savedCart && savedCart !== "undefined" ? JSON.parse(savedCart) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // UI state
  const [scrolled, setScrolled] = useState(false);
  const [page, setPage] = useState(1);

  // API state
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setApiError("");

        const response = await request("/api/products", "GET");
        const rows = response.success && response.products ? response.products : [];

        setAllProducts(rows.map(item => mapProduct(item, API_BASE_URL)));
        setPage(1);
      } catch (err) {
        setApiError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load products. Please try again."
        );
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("maison_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("maison_user");
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("maison_cart", JSON.stringify(cart));
  }, [cart]);

  // Save theme to localStorage and apply to body
  useEffect(() => {
    localStorage.setItem("maison_theme", darkMode ? "dark" : "light");
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Scroll handler
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Computed values
  const totalPages = Math.ceil(allProducts.length / PER_PAGE);
  const pageProducts = allProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0) + (cart.reduce((s, i) => s + i.price * i.qty, 0) >= 150 ? 0 : 12);

  // Cart handlers
  const addToCart = useCallback((item) => {
    setCart(prev => {
      const found = prev.find(i => i.id === item.id);
      if (found) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const setQty = (id, qty) => {
    if (qty < 1) {
      setCart(prev => prev.filter(i => i.id !== id));
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const handlePage = (p) => {
    setPage(p);
    document.getElementById("shop-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = async (paymentMethod) => {
    try {
      // Prepare order data
      const orderData = {
        email: user?.email || "guest@example.com",
        fullname: user?.fullname || "Guest User",
        address: user?.address || "No address provided",
        postalcode: user?.postalcode || 0, // Use 0 instead of "N/A" for integer field
        customer_id: user?.customer_id || "GUEST",
        amount: cartTotal,
        status_payment: paymentMethod === "cash" ? "pending" : "completed",
        created_by: user?.fullname || "Guest",
        items: cart.map(item => ({
          prd_id: item.id,
          unit_price: item.price,
          qty: item.qty
        }))
      };

      // Create order in database
      const response = await request("/api/orders", "POST", orderData);

      if (response.success) {
        console.log("Order created successfully:", response.data);
        setCheckoutOpen(false);
        setCart([]);
        alert(`Order placed successfully! Order ID: ${response.data.order_id}\nPayment method: ${paymentMethod.toUpperCase()}`);
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert(`Failed to place order: ${error.message || "Unknown error"}. Please try again.`);
    }
  };

  return (
    <>
      <div className="sr">
        {/* Auth Modal */}
        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onSwitch={() => setAuthModal(m => m === "login" ? "register" : "login")}
            onLogin={customerData => { 
              setUser(customerData); 
              setAuthModal(null); 
            }}
          />
        )}

        {/* Cart Drawer */}
        {cartOpen && (
          <CartDrawer
            items={cart}
            user={user}
            onClose={() => setCartOpen(false)}
            onQty={setQty}
            onRemove={id => setCart(p => p.filter(i => i.id !== id))}
            onCheckout={handleCheckout}
            onOpenAuth={setAuthModal}
          />
        )}

        {/* Checkout Modal */}
        {checkoutOpen && (
          <CheckoutModal
            items={cart}
            user={user}
            total={cartTotal}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {/* Ticker */}
        <Ticker />

        {/* Header */}
        <Header
          scrolled={scrolled}
          user={user}
          cartCount={cartCount}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(d => !d)}
          onOpenAuth={setAuthModal}
          onLogout={() => setUser(null)}
          onOpenCart={() => setCartOpen(true)}
        />

        {/* Hero */}
        <Hero />

        {/* Shop Section */}
        <main id="shop-section" style={{ maxWidth: "1400px", margin: "0 auto", padding: "88px 40px 120px" }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "18px" }}>
            <div>
              <div className="slbl">Curated Selection</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,4vw,54px)", fontWeight: "300", letterSpacing: "-0.01em", lineHeight: "1", color: darkMode ? "#f5f0e8" : "#1a1a1a" }}>
                Featured <em style={{ fontStyle: "italic" }}>Pieces</em>
              </h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.08em", color: darkMode ? "#555" : "#999", fontFamily: "'DM Sans',sans-serif" }}>
                {isLoading ? "Loading…" : `${allProducts.length} items · page ${page}/${Math.max(totalPages, 1)}`}
              </span>
              <div style={{ position: "relative" }}>
                <select className="sselect">
                  <option>Newest First</option>
                  <option>Price: Low–High</option>
                  <option>Price: High–Low</option>
                  <option>Top Rated</option>
                </select>
                <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: darkMode ? "#555" : "#999" }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* 2-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "50px", alignItems: "start" }}>
            <FilterSidebar darkMode={darkMode} />
            <ProductGrid
              isLoading={isLoading}
              apiError={apiError}
              products={pageProducts}
              page={page}
              totalPages={totalPages}
              onPageChange={handlePage}
              onAddToCart={addToCart}
              perPage={PER_PAGE}
              darkMode={darkMode}
            />
          </div>
        </main>

        {/* Newsletter */}
        <Newsletter />

        {/* Footer */}
        <Footer
          cartCount={cartCount}
          onOpenAuth={setAuthModal}
          onOpenCart={() => setCartOpen(true)}
        />
      </div>
    </>
  );
};

export default MainPage;
