import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../style/Layout.css";

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    // redirect after 1 minute
    const timer = setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/login");
    }, 1 *60 * 60 * 1000); // 1 minute
    // cleanup
    return () => clearTimeout(timer);
  }, [navigate, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <div className="main-layout">
        <Sidebar />
        <div className="content-area">
          <Navbar />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
