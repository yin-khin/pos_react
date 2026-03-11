import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import request from "../../../utils/request";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModal from "./modals/AuthModal";
import CartDrawer from "./modals/CartDrawer";
import { IMinus, IPlus, IHeart } from "./utils/icons";
import { Stars } from "./utils/helpers";
import "./styles/productDetail.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("maison_theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  // User state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("maison_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("maison_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [authModal, setAuthModal] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("maison_cart", JSON.stringify(cart));
  }, [cart]);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("maison_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("maison_user");
    }
  }, [user]);

  // Save theme to localStorage
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

  useEffect(() => {
    loadProduct();
    loadRelatedProducts();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await request(`/api/products/${id}`, "GET");
      if (response.success && response.product) {
        console.log("Product data received:", response.product);
        console.log("Brand data:", response.product.brand);
        console.log("Category data:", response.product.category);
        setProduct(response.product);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      const response = await request("/api/products", "GET");
      if (response.success && response.products) {
        // Get 4 random products
        const shuffled = response.products.sort(() => 0.5 - Math.random());
        setRelatedProducts(shuffled.slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to load related products:", error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.prd_id,
      name: product.prd_name,
      price: Number(product.unit_cost || 0),
      image: product.photo,
      brand: product.brand?.desc || product.brand_id || "Generic",
      qty: quantity
    };

    setCart(prev => {
      const found = prev.find(i => i.id === cartItem.id);
      if (found) {
        return prev.map(i => i.id === cartItem.id ? { ...i, qty: i.qty + quantity } : i);
      }
      return [...prev, cartItem];
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const setQty = (id, qty) => {
    if (qty < 1) {
      setCart(prev => prev.filter(i => i.id !== id));
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <div className="error">Product not found</div>
      </div>
    );
  }

  const productImage = product.photo || null;
  const images = productImage ? [productImage] : [];
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="product-detail-page">
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
          onCheckout={() => {
            setCartOpen(false);
            navigate("/frontend");
          }}
          onOpenAuth={setAuthModal}
        />
      )}

      {/* Use the same Header component as MainPage */}
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

      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <div className="pd-container">
          <a href="/frontend">Home</a>
          <span>/</span>
          <a href="/frontend">Shop</a>
          <span>/</span>
          <span>{product.prd_name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <main className="pd-main">
        <div className="pd-container">
          <div className="pd-grid">
            {/* Images */}
            <div className="pd-images">
              <div className="pd-main-image">
                {productImage ? (
                  <img src={images[selectedImage]} alt={product.prd_name} />
                ) : (
                  <div className="pd-no-image">No Image Available</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="pd-thumbnails">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`pd-thumbnail ${selectedImage === idx ? "active" : ""}`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img src={img} alt={`${product.prd_name} ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="pd-info">
              <div className="pd-category">{product.brand?.desc || product.brand_id || "Product"}</div>
              <h1 className="pd-title">{product.prd_name}</h1>
              
              <div className="pd-rating">
                <Stars n={4} />
                <span className="pd-rating-text">(24 reviews)</span>
              </div>

              <div className="pd-price">${Number(product.unit_cost || 0).toFixed(2)}</div>

              <div className="pd-description">
                <p>
                  {product.remark || "No description available."}
                </p>
              </div>

              <div className="pd-stock">
                <span className="pd-stock-label">Availability:</span>
                <span className="pd-stock-value">
                  {product.qty > 0 ? `${product.qty} in stock` : "Out of stock"}
                </span>
              </div>

              {/* Quantity */}
              <div className="pd-quantity-section">
                <label className="pd-label">Quantity</label>
                <div className="pd-quantity">
                  <button
                    className="pd-qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <IMinus />
                  </button>
                  <span className="pd-qty-value">{quantity}</span>
                  <button
                    className="pd-qty-btn"
                    onClick={() => setQuantity(Math.min(product.qty || 99, quantity + 1))}
                  >
                    <IPlus />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pd-actions-section">
                <button
                  className={`pd-btn-primary ${added ? "added" : ""}`}
                  onClick={handleAddToCart}
                  disabled={product.qty === 0}
                >
                  {added ? "Added to Cart!" : "Add to Cart"}
                </button>
                <button className="pd-btn-secondary">
                  <IHeart />
                  Add to Wishlist
                </button>
              </div>

              {/* Details */}
              <div className="pd-details">
                <div className="pd-detail-item">
                  <span className="pd-detail-label">SKU:</span>
                  <span className="pd-detail-value">{product.prd_id}</span>
                </div>
                <div className="pd-detail-item">
                  <span className="pd-detail-label">Category:</span>
                  <span className="pd-detail-value">{product.category?.desc || product.category_id || "General"}</span>
                </div>
                <div className="pd-detail-item">
                  <span className="pd-detail-label">Brand:</span>
                  <span className="pd-detail-value">{product.brand?.desc || product.brand_id || "Generic"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pd-related">
              <h2 className="pd-related-title">You May Also Like</h2>
              <div className="pd-related-grid">
                {relatedProducts.map((item) => (
                  <div
                    key={item.prd_id}
                    className="pd-related-card"
                    onClick={() => navigate(`/frontend/product/${item.prd_id}`)}
                  >
                    <div className="pd-related-image">
                      {item.photo ? (
                        <img src={item.photo} alt={item.prd_name} />
                      ) : (
                        <div className="pd-no-image-small">No Image</div>
                      )}
                    </div>
                    <div className="pd-related-info">
                      <div className="pd-related-brand">{item.brand?.desc || item.brand_id || "Brand"}</div>
                      <div className="pd-related-name">{item.prd_name}</div>
                      <div className="pd-related-price">${Number(item.unit_cost || 0).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Use the same Footer component as MainPage */}
      <Footer
        cartCount={cartCount}
        onOpenAuth={setAuthModal}
        onOpenCart={() => setCartOpen(true)}
      />
    </div>
  );
};

export default ProductDetailPage;
