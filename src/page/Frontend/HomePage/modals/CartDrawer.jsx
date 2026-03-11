import React from "react";
import { IClose, IPlus, IMinus, ITrash } from "../utils/icons";

const CartDrawer = ({ items, user, onClose, onQty, onRemove, onCheckout, onOpenAuth }) => {
  const subtotal  = items.reduce((s,i) => s + i.price * i.qty, 0);
  const shipping  = subtotal >= 150 ? 0 : 12;
  const total     = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      // User must login/register before checkout
      onOpenAuth("login");
      return;
    }
    onCheckout();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:900, display:"flex" }}>
      <div onClick={onClose} style={{ flex:1, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(5px)", animation:"fadeIn 0.22s ease" }} />

      <div style={{ width:"400px", maxWidth:"92vw", background:"#0d0d0d", borderLeft:"1px solid rgba(245,240,232,0.08)", display:"flex", flexDirection:"column", animation:"slideInRight 0.32s cubic-bezier(0.22,1,0.36,1)" }}>

        <div style={{ padding:"26px 26px 18px", borderBottom:"1px solid rgba(245,240,232,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:"8px", fontWeight:"700", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", fontFamily:"'DM Sans',sans-serif", marginBottom:"4px" }}>Your Selection</div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"24px", fontWeight:"300", color:"#f5f0e8" }}>
              Shopping Bag <span style={{ fontSize:"15px", color:"#555" }}>({items.length})</span>
            </h3>
          </div>
          <button onClick={onClose}
            style={{ background:"transparent", border:"1px solid rgba(245,240,232,0.1)", color:"#777", cursor:"pointer", padding:"8px", display:"flex", transition:"color 0.15s, border-color 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color="#f5f0e8"; e.currentTarget.style.borderColor="rgba(245,240,232,0.3)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="#777"; e.currentTarget.style.borderColor="rgba(245,240,232,0.1)";}}>
            <IClose />
          </button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"16px 26px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0 40px" }}>
              <div style={{ fontSize:"36px", marginBottom:"16px", opacity:0.3 }}>🛍</div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"20px", fontWeight:"300", color:"#555" }}>Your bag is empty</p>
              <p style={{ fontSize:"11px", color:"#444", fontFamily:"'DM Sans',sans-serif", marginTop:"8px", letterSpacing:"0.08em" }}>Add something beautiful</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ display:"flex", gap:"14px", padding:"16px 0", borderBottom:"1px solid rgba(245,240,232,0.05)" }}>
                <div style={{ width:"72px", height:"90px", flexShrink:0, overflow:"hidden", background:"#1a1a1a" }}>
                  <img src={item.image} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
                <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
                  <div>
                    <div style={{ fontSize:"8px", fontWeight:"700", letterSpacing:"0.2em", textTransform:"uppercase", color:"#c9a84c", fontFamily:"'DM Sans',sans-serif", marginBottom:"3px" }}>{item.brand}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"15px", color:"#f5f0e8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", border:"1px solid rgba(245,240,232,0.1)" }}>
                      {[{cb:()=>onQty(item.id,item.qty-1), icon:<IMinus/>}, null, {cb:()=>onQty(item.id,item.qty+1), icon:<IPlus/>}].map((btn, bi) =>
                        btn === null ? (
                          <span key="qty" style={{ fontSize:"12px", fontFamily:"'DM Sans',sans-serif", color:"#f5f0e8", minWidth:"26px", textAlign:"center", fontWeight:"500" }}>{item.qty}</span>
                        ) : (
                          <button key={bi} onClick={btn.cb}
                            style={{ background:"transparent", border:"none", color:"#777", cursor:"pointer", padding:"6px 9px", display:"flex", transition:"color 0.15s" }}
                            onMouseEnter={e=>e.currentTarget.style.color="#f5f0e8"} onMouseLeave={e=>e.currentTarget.style.color="#777"}>
                            {btn.icon}
                          </button>
                        )
                      )}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"17px", fontWeight:"500", color:"#f5f0e8" }}>${(item.price*item.qty).toFixed(2)}</span>
                      <button onClick={()=>onRemove(item.id)}
                        style={{ background:"transparent", border:"none", color:"#555", cursor:"pointer", display:"flex", padding:"3px", transition:"color 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.color="#e05555"} onMouseLeave={e=>e.currentTarget.style.color="#555"}>
                        <ITrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding:"18px 26px 28px", borderTop:"1px solid rgba(245,240,232,0.08)" }}>
            {[
              { label:"Subtotal", val:`${subtotal.toFixed(2)}`, dim:true },
              { label:"Shipping", val: shipping === 0 ? "Free" : `${shipping.toFixed(2)}`, gold: shipping===0 },
            ].map(row => (
              <div key={row.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:"7px" }}>
                <span style={{ fontSize:"10px", fontWeight:"400", letterSpacing:"0.1em", color:"#666", fontFamily:"'DM Sans',sans-serif" }}>{row.label}</span>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"14px", color: row.gold?"#c9a84c":"#888" }}>{row.val}</span>
              </div>
            ))}
            <div style={{ height:"1px", background:"rgba(245,240,232,0.08)", margin:"12px 0 16px" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"20px" }}>
              <span style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.14em", textTransform:"uppercase", color:"#f5f0e8", fontFamily:"'DM Sans',sans-serif" }}>Total</span>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"24px", fontWeight:"500", color:"#f5f0e8" }}>${total.toFixed(2)}</span>
            </div>

            <button onClick={handleCheckout}
              style={{ width:"100%", background:"#c9a84c", color:"#0a0a0a", border:"none", padding:"15px", fontFamily:"'DM Sans',sans-serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.24em", textTransform:"uppercase", cursor:"pointer", transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#dbb85a"} onMouseLeave={e=>e.currentTarget.style.background="#c9a84c"}>
              {user ? `Checkout — $${total.toFixed(2)}` : "Login to Checkout"}
            </button>

            {subtotal < 150 && (
              <p style={{ textAlign:"center", fontSize:"10px", color:"#555", fontFamily:"'DM Sans',sans-serif", marginTop:"10px", letterSpacing:"0.06em" }}>
                Add ${(150-subtotal).toFixed(2)} more for free shipping
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
