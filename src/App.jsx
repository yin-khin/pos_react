// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Layout from "./components/Layout";
// import Dashboard from "./page/Dashboard";
// import SalesPage from "./page/SalesPage";
// import ReportsPage from "./page/ReportsPage";
// import CategoryPage from "./page/feature/category/category";
// //import Category_Page from "./page/feature/category/Category_Page";
// import BrandPage from "./page/feature/brand/BrandPage";
// import ProductPage from "./page/feature/products/ProductPage";
// import CustomerPage from "./page/feature/customer/CustomersPage";
// const App = () => {
//   return (
//     <Routes>
//       <Route element={<Layout />}>
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/products" element={<ProductPage />} />
//         <Route path="/sales" element={<SalesPage />} />
//         <Route path="/customers" element={<CustomerPage />} />
//         <Route path="/reports" element={<ReportsPage />} />
//         <Route path="/categories" element={<CategoryPage />} />
//         <Route path="/brands" element={<BrandPage />} />
//       </Route>
//     </Routes>
//   );
// };

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";

// Layout and Common Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute component

// Page Components
import Dashboard from "./page/Dashboard";
import SalesPage from "./page/SalesPage";
import ReportsPage from "./page/ReportsPage";
import CategoryPage from "./page/feature/category/category";
import BrandPage from "./page/feature/brand/BrandPage";
import ProductPage from "./page/feature/products/ProductPage";
import CustomerPage from "./page/feature/customer/CustomersPage";
import PaymentMethodPage from "./page/feature/payment/PaymentMethodPage";
import SettingPage from "./page/feature/setting/SettingPage";
import StockAlertSettingPage from "./page/feature/setting/StockAlertSettingPage";
import StoreInfoPage from "./page/feature/storeinfo/StoreInfoPage";
import TelegramPage from "./page/feature/telegram/TelegramPage";
import SalesReportPage from "./page/feature/reports/SalesReportPage";
import InventoryReportPage from "./page/feature/reports/InventoryReportPage";
import CustomerReportPage from "./page/feature/reports/CustomerReportPage";

// Auth Components
import LoginPage from "./page/auth/LoginPage";
import RegisterPage from "./page/auth/RegisterPage";
import ForgetPage from "./page/auth/ForgetPage";

//Frontend
import MainPage from "./page/Frontend/HomePage/MainPage";
import ProductDetailPage from "./page/Frontend/HomePage/ProductDetailPage";
import PosPage from "./page/feature/pos/PosPage";
const App = () => {
  return (
    <Routes>
      {/* Public Routes: Login, Register, Forget Password */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forget" element={<ForgetPage />} />

      {/* Protected Routes: Dashboard and Features */}
      {/* Users must be logged in to access these routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products/master" element={<ProductPage />} />
          <Route path="/sales/history" element={<SalesPage />} />
          <Route path="/sales/new" element={<PosPage />} />
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/sales" element={<SalesReportPage />} />
          <Route path="/reports/inventory" element={<InventoryReportPage />} />
          <Route path="/reports/customer" element={<CustomerReportPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/brands" element={<BrandPage />} />
          <Route path="/payment-methods" element={<PaymentMethodPage />} />
          <Route path="/settings" element={<SettingPage />} />
          <Route path="/settings/stock-alerts" element={<StockAlertSettingPage />} />
          <Route path="/store-info" element={<StoreInfoPage />} />
          <Route path="/telegram" element={<TelegramPage />} />
        </Route>
       </Route>
        <Route path="/frontend" element={<MainPage/>} />
        <Route path="/frontend/product/:id" element={<ProductDetailPage/>} />

      {/* 404 - Not Found (Redirect to login or dashboard) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
