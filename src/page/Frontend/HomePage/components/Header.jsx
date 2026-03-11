/* eslint-disable no-undef */
import React, { useState, useRef, useEffect } from "react";
import {
  IHome,
  ISearch,
  IUser,
  IHeart,
  IBag,
  IMoon,
  ISun,
} from "../utils/icons";

const menus = [
  { name: "Home", link: "/frontend" },
  { name: "Shop", link: "#shop" },
  { name: "About", link: "#about" },
  { name: "Contact", link: "#contact" },
];

const UserMenu = ({ user, onOpenAuth, onLogout, darkMode }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const textColor = darkMode ? "#f5f0e8" : "#1a1a1a";
  const bgColor = darkMode ? "#111" : "#ffffff";
  const borderColor = darkMode ? "rgba(245,240,232,0.1)" : "rgba(0,0,0,0.1)";

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!user) {
    return (
      <button
        className="ibtn"
        onClick={() => onOpenAuth("login")}
        aria-label="Sign in"
        title="Sign in"
        style={{ color: textColor }}
      >
        <IUser />
      </button>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "rgba(201,168,76,0.12)",
          border: "1px solid rgba(201,168,76,0.35)",
          color: "#c9a84c",
          cursor: "pointer",
          padding: "7px 14px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "10px",
          fontWeight: "600",
          letterSpacing: "0.1em",
          display: "flex",
          alignItems: "center",
          gap: "7px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(201,168,76,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(201,168,76,0.12)";
        }}
      >
        <IUser />
        <span
          style={{
            maxWidth: "76px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.fullname
            ? user.fullname.split(" ")[0]
            : user.email?.split("@")[0] || "User"}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 7px)",
            background: bgColor,
            border: `1px solid ${borderColor}`,
            minWidth: "156px",
            zIndex: 200,
            animation: "slideUp 0.18s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {["My Orders", "Wishlist", "Settings"].map((item) => (
            <button
              key={item}
              style={{
                display: "block",
                width: "100%",
                background: "transparent",
                border: "none",
                color: darkMode ? "#aaa" : "#666",
                cursor: "pointer",
                padding: "11px 16px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                letterSpacing: "0.05em",
                textAlign: "left",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = darkMode ? "#f5f0e8" : "#1a1a1a";
                e.currentTarget.style.background = darkMode
                  ? "rgba(245,240,232,0.04)"
                  : "rgba(0,0,0,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = darkMode ? "#aaa" : "#666";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {item}
            </button>
          ))}

          <div
            style={{
              height: "1px",
              background: borderColor,
              margin: "3px 0",
            }}
          />

          <button
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
            style={{
              display: "block",
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#e06060",
              cursor: "pointer",
              padding: "11px 16px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.05em",
              textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(224,96,96,0.07)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

const Header = ({
  scrolled,
  user,
  cartCount,
  onOpenAuth,
  onLogout,
  onOpenCart,
  darkMode,
  onToggleDarkMode,
}) => {
  const textColor = darkMode ? "#f5f0e8" : "#1a1a1a";
  const mutedColor = darkMode ? "#555" : "#999";

  return (
    <header className={`hdr ${scrolled ? "on" : ""}`}>
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <IHome />
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "20px",
              fontWeight: "500",
              color: textColor,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Store KH
          </span>
        </div>

        <nav style={{ display: "flex", gap: "34px" }}>
          {menus.map((item) => (
            <a
              key={item.name}
              href={item.link}
              style={{
                color: textColor,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#c9a84c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = textColor;
              }}
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ position: "relative", marginRight: "8px" }}>
            <div
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: mutedColor,
                pointerEvents: "none",
              }}
            >
              <ISearch />
            </div>

            <input
              type="text"
              placeholder="Search…"
              className="sinput"
              style={{
                paddingLeft: "34px",
              }}
            />
          </div>

          <button
            className="ibtn"
            onClick={onToggleDarkMode}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Light mode" : "Dark mode"}
            style={{ color: textColor }}
          >
            {darkMode ? <ISun /> : <IMoon />}
          </button>

          <UserMenu
            user={user}
            onOpenAuth={onOpenAuth}
            onLogout={onLogout}
            darkMode={darkMode}
          />

          {!user && (
            <button
              onClick={() => onOpenAuth("register")}
              style={{
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "#c9a84c",
                cursor: "pointer",
                padding: "6px 13px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "10px",
                fontWeight: "600",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                transition: "background 0.2s",
                marginLeft: "4px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(201,168,76,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Register
            </button>
          )}

          <button
            className="ibtn"
            aria-label="Wishlist"
            style={{ color: textColor }}
          >
            <IHeart />
          </button>

          <button
            className="ibtn"
            aria-label={`Cart (${cartCount})`}
            onClick={onOpenCart}
            style={{ color: textColor, position: "relative" }}
          >
            <IBag />
            {cartCount > 0 && (
              <span className="badge">{cartCount > 9 ? "9+" : cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
