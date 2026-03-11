import React, { useState } from "react";
import { IClose, ICheck, ICash, IQRCode, ICreditCard } from "../utils/icons";
import { PAYMENT_METHODS } from "../utils/constants";
import request from "../../../../utils/request";

const CheckoutModal = ({ items, user, total, onClose, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CASH);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [cardErrors, setCardErrors] = useState({});

  const paymentMethods = [
    { id: PAYMENT_METHODS.CASH, label: "Cash", icon: <ICash />, desc: "Pay with cash on delivery" },
    { id: PAYMENT_METHODS.KHQR, label: "KHQR", icon: <IQRCode />, desc: "Scan QR code to pay" },
    { id: PAYMENT_METHODS.MASTERCARD, label: "Mastercard", icon: <ICreditCard />, desc: "Pay with Mastercard" },
    { id: PAYMENT_METHODS.VISA, label: "Visa", icon: <ICreditCard />, desc: "Pay with Visa" },
  ];

  const validateCard = () => {
    const errors = {};
    if (!/^\d{16}$/.test(cardForm.number.replace(/\s/g, ""))) {
      errors.number = "Invalid card number";
    }
    if (!cardForm.name.trim()) {
      errors.name = "Cardholder name required";
    }
    if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) {
      errors.expiry = "Format: MM/YY";
    }
    if (!/^\d{3,4}$/.test(cardForm.cvv)) {
      errors.cvv = "Invalid CVV";
    }
    return errors;
  };

  const generateKHQR = async () => {
    try {
      setLoading(true);
      const response = await request("/api/khqr/generate", "POST", {
        amount: total,
        currency: "USD",
        billNumber: `ORDER-${Date.now()}`
      });

      if (response.success && response.qrCode) {
        setQrCode(response.qrCode);
      }
    } catch (error) {
      console.error("KHQR generation failed:", error);
      alert("Failed to generate KHQR code. Please try another payment method.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (selectedMethod === PAYMENT_METHODS.KHQR) {
      if (!qrCode) {
        await generateKHQR();
        return;
      }
    }

    if (selectedMethod === PAYMENT_METHODS.MASTERCARD || selectedMethod === PAYMENT_METHODS.VISA) {
      const errors = validateCard();
      if (Object.keys(errors).length > 0) {
        setCardErrors(errors);
        return;
      }
    }

    setLoading(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      setLoading(false);
      // Pass the payment method to parent
      onSuccess(selectedMethod);
    }, 1500);
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").substring(0, 19);
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, zIndex:1100,
        background:"rgba(0,0,0,0.82)", backdropFilter:"blur(10px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"20px", animation:"fadeIn 0.2s ease",
      }}
    >
      <div style={{
        background:"#0f0f0f", border:"1px solid rgba(245,240,232,0.1)",
        width:"100%", maxWidth:"520px", maxHeight:"90vh", overflowY:"auto",
        padding:"44px 38px", position:"relative",
        animation:"slideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <button onClick={onClose}
          style={{ position:"absolute", top:"14px", right:"14px", background:"transparent", border:"none", color:"#555", cursor:"pointer", padding:"6px", display:"flex", transition:"color 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f5f0e8"} onMouseLeave={e=>e.currentTarget.style.color="#555"}>
          <IClose />
        </button>

        <div style={{ marginBottom:"32px" }}>
          <div style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"10px", fontFamily:"'DM Sans',sans-serif" }}>
            Complete Order
          </div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"32px", fontWeight:"300", color:"#f5f0e8", lineHeight:"1.1", marginBottom:"8px" }}>
            Payment Method
          </h2>
          <p style={{ fontSize:"12px", color:"#666", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.04em" }}>
            Total: <span style={{ color:"#c9a84c", fontWeight:"600" }}>${total.toFixed(2)}</span>
          </p>
        </div>

        {/* Payment Method Selection */}
        <div style={{ marginBottom:"28px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id);
                  setQrCode(null);
                  setCardErrors({});
                }}
                style={{
                  background: selectedMethod === method.id ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedMethod === method.id ? "rgba(201,168,76,0.4)" : "rgba(245,240,232,0.1)"}`,
                  color: selectedMethod === method.id ? "#c9a84c" : "#888",
                  padding:"16px 14px", cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                  letterSpacing:"0.06em", textAlign:"left",
                  transition:"all 0.2s", display:"flex", flexDirection:"column", gap:"8px"
                }}
                onMouseEnter={e => {
                  if (selectedMethod !== method.id) {
                    e.currentTarget.style.borderColor = "rgba(245,240,232,0.25)";
                  }
                }}
                onMouseLeave={e => {
                  if (selectedMethod !== method.id) {
                    e.currentTarget.style.borderColor = "rgba(245,240,232,0.1)";
                  }
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  {method.icon}
                  <span style={{ fontWeight:"600" }}>{method.label}</span>
                </div>
                <span style={{ fontSize:"9px", color:"#555", letterSpacing:"0.04em" }}>{method.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        <div style={{ marginBottom:"28px" }}>
          {/* Cash Payment */}
          {selectedMethod === PAYMENT_METHODS.CASH && (
            <div style={{ background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.2)", padding:"20px", borderRadius:"4px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                <ICash />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px", fontWeight:"600", color:"#c9a84c", letterSpacing:"0.08em" }}>
                  Cash on Delivery
                </span>
              </div>
              <p style={{ fontSize:"11px", color:"#888", fontFamily:"'DM Sans',sans-serif", lineHeight:"1.7", letterSpacing:"0.04em" }}>
                Pay ${total.toFixed(2)} in cash when your order is delivered. Please have exact change ready.
              </p>
            </div>
          )}

          {/* KHQR Payment */}
          {selectedMethod === PAYMENT_METHODS.KHQR && (
            <div style={{ background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.2)", padding:"20px", borderRadius:"4px", textAlign:"center" }}>
              {qrCode ? (
                <>
                  <div style={{ marginBottom:"16px" }}>
                    <img src={qrCode} alt="KHQR Code" style={{ width:"200px", height:"200px", margin:"0 auto", background:"white", padding:"10px" }} />
                  </div>
                  <p style={{ fontSize:"11px", color:"#888", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.04em", marginBottom:"8px" }}>
                    Scan this QR code with your banking app
                  </p>
                  <p style={{ fontSize:"10px", color:"#666", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.04em" }}>
                    Amount: <span style={{ color:"#c9a84c", fontWeight:"600" }}>${total.toFixed(2)}</span>
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize:"48px", marginBottom:"12px", opacity:0.3 }}>📱</div>
                  <p style={{ fontSize:"11px", color:"#888", fontFamily:"'DM Sans',sans-serif", lineHeight:"1.7", letterSpacing:"0.04em" }}>
                    Click "Generate QR Code" to create your payment QR code
                  </p>
                </>
              )}
            </div>
          )}

          {/* Card Payment (Mastercard/Visa) */}
          {(selectedMethod === PAYMENT_METHODS.MASTERCARD || selectedMethod === PAYMENT_METHODS.VISA) && (
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <div>
                <label style={{ display:"block", fontSize:"9px", fontWeight:"700", letterSpacing:"0.24em", textTransform:"uppercase", color:cardErrors.number?"#e06060":"#777", fontFamily:"'DM Sans',sans-serif", marginBottom:"7px" }}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardForm.number}
                  onChange={e => {
                    setCardForm({...cardForm, number: formatCardNumber(e.target.value)});
                    setCardErrors({...cardErrors, number: ""});
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  style={{
                    width:"100%", background:"rgba(255,255,255,0.03)",
                    border:`1px solid ${cardErrors.number?"#e06060":"rgba(245,240,232,0.12)"}`,
                    color:"#f5f0e8", fontFamily:"'DM Sans',sans-serif",
                    fontSize:"13px", letterSpacing:"0.08em", padding:"12px 14px",
                    outline:"none", transition:"border-color 0.2s",
                  }}
                  onFocus={e => { if (!cardErrors.number) e.target.style.borderColor="#c9a84c"; }}
                  onBlur={e => { if (!cardErrors.number) e.target.style.borderColor="rgba(245,240,232,0.12)"; }}
                />
                {cardErrors.number && <p style={{ fontSize:"10px", color:"#e06060", fontFamily:"'DM Sans',sans-serif", marginTop:"5px" }}>{cardErrors.number}</p>}
              </div>

              <div>
                <label style={{ display:"block", fontSize:"9px", fontWeight:"700", letterSpacing:"0.24em", textTransform:"uppercase", color:cardErrors.name?"#e06060":"#777", fontFamily:"'DM Sans',sans-serif", marginBottom:"7px" }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardForm.name}
                  onChange={e => {
                    setCardForm({...cardForm, name: e.target.value});
                    setCardErrors({...cardErrors, name: ""});
                  }}
                  placeholder="JOHN DOE"
                  style={{
                    width:"100%", background:"rgba(255,255,255,0.03)",
                    border:`1px solid ${cardErrors.name?"#e06060":"rgba(245,240,232,0.12)"}`,
                    color:"#f5f0e8", fontFamily:"'DM Sans',sans-serif",
                    fontSize:"13px", letterSpacing:"0.08em", padding:"12px 14px",
                    outline:"none", transition:"border-color 0.2s", textTransform:"uppercase"
                  }}
                  onFocus={e => { if (!cardErrors.name) e.target.style.borderColor="#c9a84c"; }}
                  onBlur={e => { if (!cardErrors.name) e.target.style.borderColor="rgba(245,240,232,0.12)"; }}
                />
                {cardErrors.name && <p style={{ fontSize:"10px", color:"#e06060", fontFamily:"'DM Sans',sans-serif", marginTop:"5px" }}>{cardErrors.name}</p>}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                <div>
                  <label style={{ display:"block", fontSize:"9px", fontWeight:"700", letterSpacing:"0.24em", textTransform:"uppercase", color:cardErrors.expiry?"#e06060":"#777", fontFamily:"'DM Sans',sans-serif", marginBottom:"7px" }}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardForm.expiry}
                    onChange={e => {
                      setCardForm({...cardForm, expiry: formatExpiry(e.target.value)});
                      setCardErrors({...cardErrors, expiry: ""});
                    }}
                    placeholder="MM/YY"
                    maxLength="5"
                    style={{
                      width:"100%", background:"rgba(255,255,255,0.03)",
                      border:`1px solid ${cardErrors.expiry?"#e06060":"rgba(245,240,232,0.12)"}`,
                      color:"#f5f0e8", fontFamily:"'DM Sans',sans-serif",
                      fontSize:"13px", letterSpacing:"0.08em", padding:"12px 14px",
                      outline:"none", transition:"border-color 0.2s",
                    }}
                    onFocus={e => { if (!cardErrors.expiry) e.target.style.borderColor="#c9a84c"; }}
                    onBlur={e => { if (!cardErrors.expiry) e.target.style.borderColor="rgba(245,240,232,0.12)"; }}
                  />
                  {cardErrors.expiry && <p style={{ fontSize:"10px", color:"#e06060", fontFamily:"'DM Sans',sans-serif", marginTop:"5px" }}>{cardErrors.expiry}</p>}
                </div>

                <div>
                  <label style={{ display:"block", fontSize:"9px", fontWeight:"700", letterSpacing:"0.24em", textTransform:"uppercase", color:cardErrors.cvv?"#e06060":"#777", fontFamily:"'DM Sans',sans-serif", marginBottom:"7px" }}>
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardForm.cvv}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, "");
                      setCardForm({...cardForm, cvv: value.substring(0, 4)});
                      setCardErrors({...cardErrors, cvv: ""});
                    }}
                    placeholder="123"
                    maxLength="4"
                    style={{
                      width:"100%", background:"rgba(255,255,255,0.03)",
                      border:`1px solid ${cardErrors.cvv?"#e06060":"rgba(245,240,232,0.12)"}`,
                      color:"#f5f0e8", fontFamily:"'DM Sans',sans-serif",
                      fontSize:"13px", letterSpacing:"0.08em", padding:"12px 14px",
                      outline:"none", transition:"border-color 0.2s",
                    }}
                    onFocus={e => { if (!cardErrors.cvv) e.target.style.borderColor="#c9a84c"; }}
                    onBlur={e => { if (!cardErrors.cvv) e.target.style.borderColor="rgba(245,240,232,0.12)"; }}
                  />
                  {cardErrors.cvv && <p style={{ fontSize:"10px", color:"#e06060", fontFamily:"'DM Sans',sans-serif", marginTop:"5px" }}>{cardErrors.cvv}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width:"100%", background:loading?"#9a7c30":"#c9a84c",
            color:"#0a0a0a", border:"none", padding:"15px",
            fontFamily:"'DM Sans',sans-serif", fontSize:"10px",
            fontWeight:"700", letterSpacing:"0.24em", textTransform:"uppercase",
            cursor:loading?"wait":"pointer", transition:"background 0.2s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:"8px"
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background="#dbb85a"; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background="#c9a84c"; }}
        >
          {loading ? (
            "Processing..."
          ) : selectedMethod === PAYMENT_METHODS.KHQR && !qrCode ? (
            "Generate QR Code"
          ) : (
            <>
              <ICheck />
              Complete Payment — ${total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutModal;
