const Newsletter = () => {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#0c0c0c",
        minHeight: "280px",
        display: "flex",
        alignItems: "center",
        borderTop: "1px solid rgba(245,240,232,0.06)",
        borderBottom: "1px solid rgba(245,240,232,0.06)",
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.18,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "60px 40px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "32px",
        }}
      >
        <div>
          <div className="slbl">Tech Insider</div>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(26px,3.5vw,44px)",
              fontWeight: "300",
              // color: "white",
              // color: "black"
              color: "#f5f0e8",
              lineHeight: "1.1",
              letterSpacing: "-0.01em",
              background: "linear-gradient(90deg,#c9a84c 0%,#c9a84c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Stay updated with tech.
            <br />
            <em>Exclusive deals & launches.</em>
          </h3>
        </div>
        <div style={{ display: "flex" }}>
          <input
            type="email"
            placeholder="Your email address"
            style={{
              background: "transparent",
              border: "1px solid rgba(245,240,232,0.1)",
              borderRight: "none",
              color: "#f5f0e8",
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "12px",
              letterSpacing: "0.06em",
              padding: "12px 18px",
              outline: "none",
              minWidth: "220px",
            }}
          />
          <button className="btnp" style={{ whiteSpace: "nowrap" }}>
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
