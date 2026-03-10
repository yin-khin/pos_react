import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, LogIn, LayoutDashboard } from "lucide-react";
import "../style/Navbar.css";

// Map route paths to human-readable page names
const PAGE_LABELS = {
  "/dashboard": "Dashboard",
  "/products": "Product Management",
  "/products/master": "Products",
  "/categories": "Categories",
  "/brands": "Brands",
  "/sales/new": "New Sale",
  "/sales/history": "Sales History",
  "/customers": "Customers",
  "/reports/sales": "Sales Report",
  "/reports/inventory": "Inventory Report",
  "/reports/customer": "Customer Report",
  "/settings": "App Settings",
  "/settings/stock-alerts": "Stock Alerts",
  "/payment-methods": "Payment Methods",
  "/store-info": "Store Information",
  "/telegram": "Telegram Config",
  "/frontend": "Frontend",
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthenticated = !!localStorage.getItem("token");
  const pageLabel = PAGE_LABELS[location.pathname] ?? "Page";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ── Brand ── */}
        <div className="navbar-brand" onClick={() => navigate("/dashboard")}>
          <div className="navbar-brand-dot" />
          <h2>POS System</h2>
        </div>

        {/* ── Breadcrumb ── */}
        <div className="navbar-breadcrumb">
          <LayoutDashboard size={13} />
          <span>Home</span>
          <span className="navbar-breadcrumb-sep">›</span>
          <span className="navbar-breadcrumb-current">{pageLabel}</span>
        </div>

        {/* ── Right ── */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              {/* Online status pill */}
              <div className="navbar-pill">
                <span className="navbar-pill-dot" />
                Online
              </div>

              <div className="navbar-divider" />

              <div className="navbar-user">
                <span className="navbar-username">
                  Welcome, <strong>{user?.username || "User"}</strong>
                </span>

                <button
                  className="navbar-btn navbar-btn-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button
              className="navbar-btn navbar-btn-login"
              onClick={() => navigate("/login")}
            >
              <LogIn size={14} />
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
