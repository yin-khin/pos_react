import React from "react";
import ProductCard from "./ProductCard";
import { SkeletonCard } from "../utils/helpers";
import Paginator from "./Paginator";

const ProductGrid = ({ 
  isLoading, 
  apiError, 
  products, 
  page, 
  totalPages, 
  onPageChange, 
  onAddToCart,
  perPage,
  darkMode
}) => {
  // Loading skeletons
  if (isLoading) {
    return (
      <div className="pgrid">
        {Array.from({ length: perPage }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // API error
  if (apiError) {
    return (
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"80px 0", gap:"16px", textAlign:"center",
      }}>
        <div style={{ fontSize:"32px", opacity:0.3 }}>⚠</div>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"22px", fontWeight:"300", color:"#888" }}>
          Could not load products
        </p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px", color:"#555", letterSpacing:"0.06em", maxWidth:"320px", lineHeight:"1.7" }}>
          {apiError}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop:"8px", background:"transparent", border:"1px solid rgba(201,168,76,0.35)", color:"#c9a84c", cursor:"pointer", padding:"9px 22px", fontFamily:"'DM Sans',sans-serif", fontSize:"10px", fontWeight:"600", letterSpacing:"0.18em", textTransform:"uppercase", transition:"background 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"80px 0" }}>
        <div style={{ fontSize:"32px", opacity:0.3, marginBottom:"16px" }}>🏷</div>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"22px", fontWeight:"300", color:"#666" }}>
          No products available
        </p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px", color:"#444", letterSpacing:"0.06em", marginTop:"8px" }}>
          Check back soon for new arrivals.
        </p>
      </div>
    );
  }

  // Products
  return (
    <div style={{ position: "relative" }}>
      <div className="pgrid">
        {products.map((item, idx) => (
          <ProductCard key={item.id} item={item} index={idx} onAddToCart={onAddToCart} darkMode={darkMode} />
        ))}
      </div>
      <Paginator current={page} total={totalPages} onChange={onPageChange} />
    </div>
  );
};

export default ProductGrid;
