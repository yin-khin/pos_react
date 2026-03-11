import { useEffect, useState } from "react";
import request from "../../../../utils/request";

const FilterSidebar = ({ darkMode }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Theme-aware colors
  const labelColor = darkMode ? "#c9a84c" : "#c9a84c"; // Gold color stays the same
  const textColor = darkMode ? "rgba(245,240,232,0.5)" : "rgba(26,26,26,0.6)";
  const textHoverColor = darkMode ? "#f5f0e8" : "#1a1a1a";
  const mutedColor = darkMode ? "#555" : "#999";
  const dividerColor = darkMode ? "rgba(245,240,232,0.08)" : "rgba(26,26,26,0.1)";

  // Fetch categories and brands from API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories
        const categoryResponse = await request("/api/categories", "GET");
        if (categoryResponse.success && categoryResponse.category) {
          setCategories(categoryResponse.category);
        }

        // Fetch brands
        const brandResponse = await request("/api/brands", "GET");
        if (brandResponse.success && brandResponse.brand) {
          setBrands(brandResponse.brand);
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const labelStyle = {
    fontSize:"8px", 
    fontWeight:"700", 
    letterSpacing:"0.26em", 
    textTransform:"uppercase", 
    color:labelColor, 
    marginBottom:"13px", 
    fontFamily:"'DM Sans',sans-serif"
  };

  const optionStyle = {
    display:"flex", 
    alignItems:"center", 
    gap:"9px", 
    padding:"5px 0", 
    cursor:"pointer"
  };

  const textStyle = {
    fontSize:"11px", 
    letterSpacing:"0.04em", 
    color:textColor, 
    fontFamily:"'DM Sans',sans-serif", 
    transition:"color 0.15s"
  };

  return (
    <aside style={{ position:"sticky", top:"78px" }}>
      <div style={{ marginBottom:"32px" }}>
        <div style={labelStyle}>Category</div>
        {isLoading ? (
          <div style={{ fontSize:"10px", color:mutedColor, padding:"8px 0" }}>Loading...</div>
        ) : categories.length > 0 ? (
          categories.map((c, i) => (
            <label key={c.code} style={optionStyle}>
              <input type="checkbox" defaultChecked={i<2} style={{ width:"11px", height:"11px", accentColor:"#c9a84c", cursor:"pointer" }} />
              <span style={textStyle}>{c.desc || c.code}</span>
            </label>
          ))
        ) : (
          <div style={{ fontSize:"10px", color:mutedColor, padding:"8px 0" }}>No categories</div>
        )}
      </div>
      <div style={{ height:"1px", background:dividerColor, marginBottom:"28px" }} />
      <div style={{ marginBottom:"32px" }}>
        <div style={labelStyle}>Price Range</div>
        <input type="range" min="0" max="500" defaultValue="420" style={{ width:"100%", accentColor:"#c9a84c", marginBottom:"7px" }} />
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:"10px", color:mutedColor, fontFamily:"'DM Sans',sans-serif" }}>$0</span>
          <span style={{ fontSize:"10px", color:"#c9a84c", fontFamily:"'DM Sans',sans-serif", fontWeight:"600" }}>$420</span>
        </div>
      </div>
      <div style={{ height:"1px", background:dividerColor, marginBottom:"28px" }} />
      <div style={{ marginBottom:"32px" }}>
        <div style={labelStyle}>Brand</div>
        {isLoading ? (
          <div style={{ fontSize:"10px", color:mutedColor, padding:"8px 0" }}>Loading...</div>
        ) : brands.length > 0 ? (
          brands.map((b, i) => (
            <label key={b.code} style={optionStyle}>
              <input type="checkbox" defaultChecked={i<3} style={{ width:"11px", height:"11px", accentColor:"#c9a84c", cursor:"pointer" }} />
              <span style={textStyle}>{b.desc || b.code}</span>
            </label>
          ))
        ) : (
          <div style={{ fontSize:"10px", color:mutedColor, padding:"8px 0" }}>No brands</div>
        )}
      </div>
      <div style={{ height:"1px", background:dividerColor, marginBottom:"22px" }} />
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        <button className="btnp" style={{ padding:"11px 0", width:"100%" }}>Apply</button>
        <button className="btng" style={{ padding:"10px 0", width:"100%" }}>Reset</button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
