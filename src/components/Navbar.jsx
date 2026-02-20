import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  
  // Retrieve user info from localStorage (saved during login)
  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = () => {
    // 1. Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. Redirect to login page
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2 onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            Dashboard
          </h2>
        </div>

        <ul className="navbar-menu">
          {/* You can uncomment these links as needed */}
          {/* 
          <li><a href="/products">Products</a></li>
          <li><a href="/sales">Sales</a></li>
          */}
        </ul>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div style={styles.userSection}>
              <span style={styles.username}>Welcome, {user?.username || "User"}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => navigate("/login")} style={styles.loginBtn}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  username: {
    fontSize: "14px",
    color: "#333",
    fontWeight: "500",
  },
  logoutBtn: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.3s",
  },
  loginBtn: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Navbar;
