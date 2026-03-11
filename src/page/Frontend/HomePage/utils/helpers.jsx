/* eslint-disable react-refresh/only-export-components */
import React from "react";

// Map a raw API product row → internal product shape
export const mapProduct = (item, apiBaseUrl) => ({
  id:     item.prd_id,
  brand:  item.brand?.desc || item.brand_id || "Generic Brand",
  name:   item.prd_name   || item.prd_id || "Unnamed Product",
  price:  Number(item.unit_cost || 0),
  rating: typeof item.rating === "number" ? item.rating : 4,
  image:  item.photo || null, // Photo is stored as base64 or URL in database
});

// Stars component
export const Stars = ({ n }) => (
  <div style={{ display:"flex", gap:"2px" }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="11" height="11" viewBox="0 0 24 24"
        fill={i<=n?"#c9a84c":"none"} stroke={i<=n?"#c9a84c":"#444"} strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ))}
  </div>
);

// Skeleton Card (loading state)
export const SkeletonCard = () => (
  <div style={{ display:"flex", flexDirection:"column" }}>
    <div style={{
      aspectRatio:"3/4", background:"#1a1a1a", position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)",
        animation:"shimmer 1.6s infinite",
      }}/>
    </div>
    <div style={{ padding:"13px 4px 18px", display:"flex", flexDirection:"column", gap:"8px" }}>
      <div style={{ height:"9px",  width:"40%", background:"#1e1e1e", borderRadius:"2px" }}/>
      <div style={{ height:"14px", width:"75%", background:"#1e1e1e", borderRadius:"2px" }}/>
      <div style={{ height:"11px", width:"55%", background:"#1e1e1e", borderRadius:"2px" }}/>
    </div>
  </div>
);
