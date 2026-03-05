import { useMemo, useState, useEffect } from "react";
import { showAlert } from "../../../utils/alert";
import request from "../../../utils/request";
import "./pos.css";

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

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
    fetchPaymentMethods();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("Fetching products from API...");
      const response = await request("/api/products", "GET");
      console.log("Products response:", response);

      // Check both response.data and response.products for compatibility
      const productsData = response.data || response.products || [];

      if (response.success && productsData.length > 0) {
        console.log("Products loaded:", productsData.length);
        setProducts(productsData);
        // Extract unique categories
        const uniqueCategories = [
          "All Items",
          ...new Set(productsData.map((p) => p.category_id).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } else {
        console.warn("No products data in response:", response);
        setProducts([]); // Set empty array to stop loading
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Set empty array to stop loading
      showAlert("error", "Failed to load products: " + error.message);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      console.log("Fetching payment methods from API...");
      const response = await request("/api/payment-methods", "GET");
      console.log("Payment methods response:", response);

      // Check both response.data and response.paymentMethods for compatibility
      const methodsData = response.data || response.paymentMethods || [];

      if (response.success && methodsData.length > 0) {
        const activeMethods = methodsData.filter(
          (pm) => pm.status === "Active" || pm.is_active === 1,
        );
        console.log("Active payment methods:", activeMethods.length);
        setPaymentMethods(activeMethods);
        if (activeMethods.length > 0) {
          setPaymentMethod(activeMethods[0].code);
        }
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      // Don't show alert, just use default CASH method
      console.log("Using default CASH payment method");
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await request("/api/customers", "GET");
      const customersData = response.data || response.customers || [];
      if (response.success && customersData.length > 0) {
        setCustomers(customersData);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const visibleProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory =
        selectedCategory === "All Items" ||
        item.category_id === selectedCategory;
      const kw = searchKeyword.trim().toLowerCase();
      const matchSearch =
        kw.length === 0 ||
        item.prd_id?.toLowerCase().includes(kw) ||
        item.prd_name?.toLowerCase().includes(kw);
      return matchCategory && matchSearch;
    });
  }, [searchKeyword, selectedCategory, products]);

  const addToCart = (product) => {
    // Check if product is out of stock
    const stockQty = parseInt(product.qty || 0);
    if (stockQty <= 0) {
      showAlert("error", `${product.prd_name} is out of stock!`);
      return;
    }

    setCartItems((prev) => {
      const found = prev.find((item) => item.prd_id === product.prd_id);
      if (found) {
        // Check if we can add more
        if (found.qty >= stockQty) {
          showAlert("warning", `Only ${stockQty} items available in stock`);
          return prev;
        }
        return prev.map((item) =>
          item.prd_id === product.prd_id && item.qty < stockQty
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (prdId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.prd_id !== prdId) return item;
          const product = products.find((p) => p.prd_id === prdId);
          const maxQty = product?.qty || 999;
          const nextQty = Math.min(maxQty, Math.max(0, item.qty + delta));
          return { ...item, qty: nextQty };
        })
        .filter((item) => item.qty > 0),
    );
  };

  const removeItem = (prdId) => {
    setCartItems((prev) => prev.filter((item) => item.prd_id !== prdId));
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + parseFloat(item.qty) * parseFloat(item.unit_cost || item.price || 0),
        0,
      ),
    [cartItems],
  );
  const tax = subtotal * 0.0;
  const discount = 0;
  const grandTotal = subtotal + tax - discount;
  const paidAmount = parseFloat(cashReceived || "0") || 0;
  const change = Math.max(0, paidAmount - grandTotal);
  const orderNo = `#${String(Date.now()).slice(-6)}`;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showAlert("warning", "Cart is empty");
      return;
    }
    if (paymentMethod === "CASH" && paidAmount < grandTotal) {
      showAlert("warning", "Cash received is not enough");
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        invoice_id: `INV-${Date.now()}`,
        sale_date: new Date().toISOString().split("T")[0],
        amount: grandTotal,
        sub_total: subtotal,
        tax: tax,
        pay_method: paymentMethod,
        customer_id: selectedCustomer?.customer_id || null,
        create_by: "POS User",
        items: cartItems.map((item) => ({
          prd_id: item.prd_id,
          qty: item.qty,
          price: item.unit_cost || item.price || 0,
        })),
      };

      const response = await request("/api/sales", "POST", saleData);

      if (response.success) {
        showAlert("success", "Sale completed successfully");
        setCartItems([]);
        setCashReceived("");
        setPromoCode("");
        setSelectedCustomer(null);
        // Refresh products to update stock
        fetchProducts();
      } else {
        showAlert("error", response.message || "Failed to complete sale");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showAlert("error", "Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-screen">
      <div className="pos-main-grid">
        <section className="panel products-panel">
          <div className="panel-head">
            <div>
              <h2>All Products</h2>
              <div className="pos-tabs">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={selectedCategory === category ? "active" : ""}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Search products"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <div className="products-grid">
            {visibleProducts.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "40px",
                  color: "#8ea0b8",
                }}
              >
                {products.length === 0
                  ? "Loading products..."
                  : "No products found"}
              </div>
            ) : (
              visibleProducts.map((product) => {
                const stockQty = parseInt(product.qty || 0);
                const isOutOfStock = stockQty <= 0;
                
                return (
                  <article
                    key={product.prd_id}
                    className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    style={{
                      opacity: isOutOfStock ? 0.6 : 1,
                      cursor: isOutOfStock ? "not-allowed" : "pointer",
                      position: "relative",
                    }}
                  >
                    {isOutOfStock && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "#f44336",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          zIndex: 1,
                        }}
                      >
                        OUT OF STOCK
                      </div>
                    )}
                    <div className="product-image">
                      <div className="product-thumb">
                        {product.photo ? (
                          <img
                            src={product.photo}
                            alt={product.prd_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              filter: isOutOfStock ? "grayscale(100%)" : "none",
                            }}
                          />
                        ) : (
                          "📦"
                        )}
                      </div>
                    </div>
                    <div className="product-title">
                      <h3 style={{ color: isOutOfStock ? "#999" : "inherit" }}>
                        {product.prd_name}
                      </h3>
                      <div className="product-meta">
                        <strong style={{ color: isOutOfStock ? "#999" : "inherit" }}>
                          ${parseFloat(product.unit_cost || 0).toFixed(2)}
                        </strong>
                        <span
                          style={{
                            color: isOutOfStock ? "#f44336" : stockQty <= 10 ? "#ff9800" : "#4caf50",
                            fontWeight: "bold",
                          }}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : `${stockQty} Left`}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="panel cart-panel">
          <div className="panel-head middle-head">
            <div>
              <h2>Active Cart</h2>
              <p>Order {orderNo} • Walk-in Customer</p>
            </div>
            <button
              type="button"
              className="icon-clear"
              onClick={() => setCartItems([])}
            >
              🗑
            </button>
          </div>

          <div className="cart-scroll">
            {cartItems.length === 0 ? (
              <p className="pos-empty">No products selected.</p>
            ) : (
              cartItems.map((item) => (
                <article key={item.prd_id} className="cart-item-card">
                  <div className="cart-item-left">
                    <div className="cart-avatar">
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.prd_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div>
                      <h4>{item.prd_name}</h4>
                      <p>{item.prd_id}</p>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <div className="qty-box">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.prd_id, -1)}
                      >
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.prd_id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <strong>
                      $
                      {(parseFloat(item.qty) * parseFloat(item.unit_cost || item.price || 0)).toFixed(
                        2,
                      )}
                    </strong>
                    <button
                      type="button"
                      className="remove-x"
                      onClick={() => removeItem(item.prd_id)}
                    >
                      ×
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="promo-row">
            <input
              type="text"
              placeholder="Promo code..."
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button type="button">Apply</button>
          </div>
        </section>

        <aside className="panel payment-panel">
          <h2>Payment Details</h2>
          <div className="amount-list">
            <div>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div>
              <span>Tax (0%)</span>
              <strong>${tax.toFixed(2)}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>-${discount.toFixed(2)}</strong>
            </div>
          </div>
          <div className="total-row">
            <span>Total Payable</span>
            <strong>${grandTotal.toFixed(2)}</strong>
          </div>

          <div className="payment-methods">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <button
                  key={method.code}
                  type="button"
                  className={paymentMethod === method.code ? "active" : ""}
                  onClick={() => setPaymentMethod(method.code)}
                >
                  <span>
                    {method.type === "Cash"
                      ? "💵"
                      : method.type === "Card"
                        ? "💳"
                        : "💰"}
                  </span>
                  {method.type}
                </button>
              ))
            ) : (
              <button type="button" className="active">
                <span>💵</span>
                Cash
              </button>
            )}
          </div>

          <div className="cash-box">
            <label>Cash Received</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="0.00"
              disabled={paymentMethod !== "CASH"}
            />
            <div className="change-row">
              <span>Change</span>
              <strong>${change.toFixed(2)}</strong>
            </div>
          </div>

          <div className="customer-box">
            <div>
              <span>Customer</span>
              <strong>{selectedCustomer ? selectedCustomer.customer_name : "Guest Customer"}</strong>
            </div>
            <button type="button" onClick={() => setShowCustomerModal(true)}>✎</button>
          </div>

          {showCustomerModal && (
            <div className="customer-modal-overlay">
              <div className="customer-modal">
                <div className="modal-header">
                  <h3>Select Customer</h3>
                  <button type="button" onClick={() => setShowCustomerModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="modal-search"
                  />
                  <div className="customers-list">
                    <button
                      type="button"
                      className={!selectedCustomer ? "customer-item active" : "customer-item"}
                      onClick={() => {
                        setSelectedCustomer(null);
                        setShowCustomerModal(false);
                      }}
                    >
                      <strong>👤 Guest Customer</strong>
                      <p>Walk-in Customer</p>
                    </button>
                    {customers
                      .filter((c) =>
                        c.customer_name?.toLowerCase().includes(customerSearch.toLowerCase())
                      )
                      .map((customer) => (
                        <button
                          key={customer.customer_id}
                          type="button"
                          className={selectedCustomer?.customer_id === customer.customer_id ? "customer-item active" : "customer-item"}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerModal(false);
                          }}
                        >
                          <strong>👤 {customer.customer_name}</strong>
                          <p>{customer.customer_email || customer.customer_phone || "No contact"}</p>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Processing..." : "Checkout"}
          </button>
          <div className="bottom-actions">
            <button
              type="button"
              onClick={() =>
                showAlert("info", "Print bill feature coming soon")
              }
            >
              Print Bill
            </button>
            <button
              type="button"
              onClick={() => showAlert("info", "Order placed on hold")}
            >
              Hold Order
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PosPage;
