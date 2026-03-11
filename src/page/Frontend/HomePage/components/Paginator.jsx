import React from "react";
import { IChevL, IChevR } from "../utils/icons";

const Paginator = ({ current, total, onChange }) => {
  if (total <= 1) return null;

  const getPages = () => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
    if (current >= total - 3)
      return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
  };

  const base = {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "1px solid rgba(245,240,232,0.1)",
    color: "#777",
    cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: "12px",
    fontWeight: "500",
    letterSpacing: "0.04em",
    transition: "all 0.18s",
    pointerEvents: "auto",
  };

  const ArrowBtn = ({ disabled, onClick, children }) => (
    <button
      onClick={() => !disabled && onChange(onClick)}
      style={{
        ...base,
        opacity: disabled ? 0.22 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = "rgba(245,240,232,0.3)";
          e.currentTarget.style.color = "#f5f0e8";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(245,240,232,0.1)";
        e.currentTarget.style.color = "#777";
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        marginTop: "64px",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 10,
      }}
    >
      <ArrowBtn disabled={current === 1} onClick={current - 1}>
        <IChevL />
      </ArrowBtn>

      {getPages().map((p, i) =>
        p === "…" ? (
          <span
            key={`e${i}`}
            style={{
              width: "36px",
              textAlign: "center",
              color: "#444",
              fontSize: "14px",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...base,
              ...(p === current
                ? {
                    background: "#c9a84c",
                    borderColor: "#c9a84c",
                    color: "#0a0a0a",
                    fontWeight: "700",
                  }
                : {}),
            }}
            onMouseEnter={(e) => {
              if (p !== current) {
                e.currentTarget.style.borderColor = "rgba(245,240,232,0.3)";
                e.currentTarget.style.color = "#f5f0e8";
              }
            }}
            onMouseLeave={(e) => {
              if (p !== current) {
                e.currentTarget.style.borderColor = "rgba(245,240,232,0.1)";
                e.currentTarget.style.color = "#777";
              }
            }}
          >
            {p}
          </button>
        ),
      )}

      <ArrowBtn disabled={current === total} onClick={current + 1}>
        <IChevR />
      </ArrowBtn>
    </div>
  );
};

export default Paginator;
