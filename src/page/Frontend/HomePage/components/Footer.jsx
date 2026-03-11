import React from "react";
import { IHome } from "../utils/icons";

const Footer = ({ cartCount, onOpenAuth, onOpenCart }) => {
  return (
    <footer
      style={{
        background: "#070707",
        borderTop: "1px solid rgba(245,240,232,0.06)",
        padding: "64px 40px 32px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                marginBottom: "16px",
              }}
            >
              <IHome />
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "19px",
                  fontWeight: "500",
                  color: "#f5f0e8",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Store KH
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "300",
                letterSpacing: "0.04em",
                color: "#555",
                lineHeight: "1.85",
                maxWidth: "210px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Premium technology products. Quality you can trust. Innovation you
              can experience.
            </p>
          </div>
          {[
            {
              t: "Shop",
              l: [
                "New Arrivals",
                "Computers",
                "Phones",
                "Accessories",
                "Deals",
              ],
            },
            { t: "Company", l: ["Our Story", "Careers", "Press", "Warranty"] },
            { t: "Support", l: ["Contact Us", "FAQ", "Shipping", "Returns"] },
          ].map((col) => (
            <div key={col.t}>
              <div
                style={{
                  fontSize: "8px",
                  fontWeight: "700",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#c9a84c",
                  marginBottom: "16px",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {col.t}
              </div>
              {col.l.map((l) => (
                <a key={l} href="#" className="flink">
                  {l}
                </a>
              ))}
            </div>
          ))}
          <div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: "700",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#c9a84c",
                marginBottom: "16px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Account
            </div>
            <button
              onClick={() => onOpenAuth("login")}
              className="flink"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                textAlign: "left",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth("register")}
              className="flink"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                textAlign: "left",
              }}
            >
              Create Account
            </button>
            <button
              onClick={onOpenCart}
              className="flink"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                textAlign: "left",
              }}
            >
              Shopping Bag {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>
        </div>
        <div style={{ height: "1px", background: "rgba(245,240,232,0.06)" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "22px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: "300",
              letterSpacing: "0.08em",
              color: "#3a3a3a",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            © 2026 TechStore. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  color: "#3a3a3a",
                  textDecoration: "none",
                  fontFamily: "'DM Sans',sans-serif",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3a")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
