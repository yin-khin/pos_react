import React from "react";

const Ticker = () => {
  return (
    <div style={{ background:"#c9a84c", height:"33px", display:"flex", alignItems:"center", overflow:"hidden" }}>
      <div style={{ display:"flex", whiteSpace:"nowrap", animation:"ticker 26s linear infinite" }}>
        {[...Array(2)].flatMap((_,ri) =>
          ["Free shipping over $150","SS/26 Collection live now","Members get 20% off","Curated craft. Quiet luxury.","New arrivals every Thursday"].map((t,i)=>(
            <span key={`${ri}-${i}`} style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"0.22em", textTransform:"uppercase", padding:"0 30px", fontFamily:"'DM Sans',sans-serif", color:"#0a0a0a", display:"flex", alignItems:"center", gap:"12px" }}>
              {t}<span style={{ width:"3px", height:"3px", background:"rgba(10,10,10,0.4)", borderRadius:"50%", flexShrink:0 }}/>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default Ticker;
