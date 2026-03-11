import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IHeart, ICheck } from "../utils/icons";
import { Stars } from "../utils/helpers";

const ProductCard = ({ item, index, onAddToCart, darkMode }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  // Theme-aware colors
  const textColor = darkMode ? "#f5f0e8" : "#1a1a1a";
  const btnBg = darkMode ? "#f5f0e8" : "#1a1a1a";
  const btnText = darkMode ? "#0a0a0a" : "#ffffff";
  const btnBorder = darkMode ? "rgba(245,240,232,0.6)" : "rgba(26,26,26,0.3)";
  const imgBg = darkMode ? "#111" : "#f5f5f5";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 65);
    return () => clearTimeout(t);
  }, [index]);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleCardClick = () => {
    navigate(`/frontend/product/${item.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 65}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 65}ms`,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          aspectRatio: "3/4",
          background: imgBg,
          objectFit: "cover",
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition:
              "transform 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.4s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            filter: hovered ? "brightness(0.7)" : "brightness(0.88)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "#c9a84c",
            color: "#0a0a0a",
            fontSize: "8px",
            fontWeight: "700",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "3px 9px",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          New
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "14px",
            left: "50%",
            transform: hovered ? "translate(-50%,0)" : "translate(-50%,10px)",
            opacity: hovered ? 1 : 0,
            transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
            display: "flex",
            gap: "7px",
            whiteSpace: "nowrap",
          }}
        >
          <button
            onClick={handleAdd}
            style={{
              background: added ? "#c9a84c" : btnBg,
              color: added ? "#0a0a0a" : btnText,
              border: "none",
              padding: "10px 16px",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "'DM Sans',sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.2s, transform 0.15s",
              transform: added ? "scale(0.97)" : "scale(1)",
            }}
          >
            {added ? (
              <>
                <ICheck />
                &nbsp;Added
              </>
            ) : (
              "Add to Bag"
            )}
          </button>
          <button
            style={{
              background: "transparent",
              border: `1px solid ${btnBorder}`,
              color: textColor,
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <IHeart />
          </button>
        </div>
      </div>
      <div style={{ padding: "13px 4px 18px" }}>
        <div
          style={{
            fontSize: "9px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#c9a84c",
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: "600",
            marginBottom: "4px",
          }}
        >
          {item.brand}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "17px",
            fontWeight: "400",
            color: textColor,
            lineHeight: "1.2",
            marginBottom: "8px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stars n={item.rating} />
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "18px",
              fontWeight: "600",
              color: textColor,
            }}
          >
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
