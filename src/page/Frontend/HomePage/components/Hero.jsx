const Hero = () => {
  return (
    <section style={{ position:"relative", minHeight:"88vh", display:"flex", alignItems:"flex-end", overflow:"hidden" }}>
      <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80" alt="Tech Collection"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.4)" }} />
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,10,10,0.72) 0%, transparent 58%)" }} />
      <div style={{ position:"relative", zIndex:2, padding:"0 8vw 10vh", maxWidth:"860px" }}>
        <div className="slbl" style={{ marginBottom:"16px" }}>Latest Technology</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(50px,8vw,106px)", fontWeight:"300", lineHeight:"0.92", color:"#f5f0e8", letterSpacing:"-0.02em", marginBottom:"24px" }}>
          Innovation<br />Meets <em style={{ fontStyle:"italic", color:"#c9a84c" }}>Excellence</em>
        </h2>
        <p style={{ fontSize:"14px", fontWeight:"300", letterSpacing:"0.06em", color:"rgba(245,240,232,0.58)", marginBottom:"36px", maxWidth:"360px", lineHeight:"1.78" }}>
          Discover premium computers, smartphones, and cutting-edge technology for modern living.
        </p>
        <div style={{ display:"flex", gap:"12px" }}>
          <button className="btnp">Shop Now</button>
          <button className="btng">View Catalog</button>
        </div>
      </div>
      <div style={{ position:"absolute", right:"44px", bottom:"44px", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
        <div style={{ width:"1px", height:"48px", background:"linear-gradient(to bottom,transparent,rgba(245,240,232,0.3))" }}/>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"8px", fontWeight:"600", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(245,240,232,0.3)", writingMode:"vertical-rl" }}>Scroll</span>
      </div>
    </section>
  );
};

export default Hero;
