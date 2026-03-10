import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import {
  Package, Tags, Layers, ShoppingCart, History,
  Users, BarChart3, FileText, Settings, Bell,
  CreditCard, Store, Send, Globe, ChevronDown,
} from "lucide-react";
import "../style/Sidebar.css";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: <MdOutlineSpaceDashboard size={18} />,
  },
  {
    id: "products",
    label: "Inventory",
    path: "/products",
    icon: <Package size={18} />,
    submenu: [
      { id: "categories",  label: "Categories", path: "/categories",       icon: <Layers size={15} /> },
      { id: "brands",      label: "Brands",     path: "/brands",           icon: <Tags size={15} /> },
      { id: "products",    label: "Products",   path: "/products/master",  icon: <Package size={15} /> },
    ],
  },
  {
    id: "sales",
    label: "Point Of Sale",
    path: "/sales",
    icon: <ShoppingCart size={18} />,
    submenu: [
      { id: "newsale",    label: "New Sale",      path: "/sales/new",     icon: <ShoppingCart size={15} /> },
      { id: "sales-list", label: "Sales History", path: "/sales/history", icon: <History size={15} /> },
    ],
  },
  {
    id: "customers",
    label: "Customer",
    path: "/customers",
    icon: <Users size={18} />,
  },
  {
    id: "reports",
    label: "Report",
    path: "/reports",
    icon: <BarChart3 size={18} />,
    submenu: [
      { id: "sales-report",     label: "Sales Report",     path: "/reports/sales",     icon: <FileText size={15} /> },
      { id: "inventory-report", label: "Inventory Report", path: "/reports/inventory", icon: <Package size={15} /> },
      { id: "customer-report",  label: "Customer Report",  path: "/reports/customer",  icon: <Users size={15} /> },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: <Settings size={18} />,
    submenu: [
      { id: "app-settings",    label: "App Settings",      path: "/settings",              icon: <Settings size={15} /> },
      { id: "stock-alerts",    label: "Stock Alerts",      path: "/settings/stock-alerts", icon: <Bell size={15} /> },
      { id: "payment-methods", label: "Payment Methods",   path: "/payment-methods",       icon: <CreditCard size={15} /> },
      { id: "store-info",      label: "Store Information", path: "/store-info",            icon: <Store size={15} /> },
      { id: "telegram",        label: "Telegram Config",   path: "/telegram",              icon: <Send size={15} /> },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    path: "/frontend",
    icon: <Globe size={18} />,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const isActiveParent = (item) => {
    if (location.pathname === item.path) return true;
    if (item.submenu) return item.submenu.some((s) => location.pathname === s.path);
    return false;
  };

  const handleItemClick = (item) => {
    if (item.submenu) {
      setExpandedMenu(expandedMenu === item.id ? null : item.id);
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">P</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">POS System</span>
            <span className="sidebar-logo-sub">Operation Center</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="nav-item-wrapper">
            <button
              className={`nav-item ${isActiveParent(item) ? "active" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
              {item.submenu && (
                <ChevronDown
                  size={14}
                  className={`nav-item-chevron ${expandedMenu === item.id ? "open" : ""}`}
                />
              )}
            </button>

            {item.submenu && expandedMenu === item.id && (
              <div className="submenu">
                {item.submenu.map((sub) => (
                  <button
                    key={sub.id}
                    className={`submenu-item ${location.pathname === sub.path ? "active" : ""}`}
                    onClick={() => navigate(sub.path)}
                  >
                    <span className="submenu-item-icon">{sub.icon}</span>
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

     
    </div>
  );
};

export default Sidebar;