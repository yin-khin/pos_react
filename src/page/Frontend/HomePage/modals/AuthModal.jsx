import { useState } from "react";
import { IClose, IEye, IEyeOff, ICheck } from "../utils/icons";
import request from "../../../../utils/request";

const Field = ({ label, type="text", value, onChange, error, placeholder, suffix }) => (
  <div>
    <label style={{ display:"block", fontSize:"9px", fontWeight:"700", letterSpacing:"0.24em", textTransform:"uppercase", color:error?"#e06060":"#777", fontFamily:"'DM Sans',sans-serif", marginBottom:"7px" }}>
      {label}
    </label>
    <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:"100%", background:"rgba(255,255,255,0.03)",
          border:`1px solid ${error?"#e06060":"rgba(245,240,232,0.12)"}`,
          color:"#f5f0e8", fontFamily:"'DM Sans',sans-serif",
          fontSize:"13px", letterSpacing:"0.04em",
          padding: suffix ? "12px 40px 12px 14px" : "12px 14px",
          outline:"none", transition:"border-color 0.2s",
        }}
        onFocus={e  => { if (!error) e.target.style.borderColor="#c9a84c"; }}
        onBlur={e   => { if (!error) e.target.style.borderColor="rgba(245,240,232,0.12)"; }}
      />
      {suffix && <div style={{ position:"absolute", right:"12px" }}>{suffix}</div>}
    </div>
    {error && (
      <p style={{ fontSize:"10px", color:"#e06060", fontFamily:"'DM Sans',sans-serif", marginTop:"5px", letterSpacing:"0.04em" }}>
        {error}
      </p>
    )}
  </div>
);

const AuthModal = ({ mode, onClose, onSwitch, onLogin }) => {
  const [form, setForm]         = useState({ name:"", email:"", pass:"", confirm:"", phone:"" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [apiError, setApiError] = useState("");
  const isLogin = mode === "login";

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); setApiError(""); };

  const validate = () => {
    const e = {};
    if (!isLogin && !form.name.trim())           e.name    = "Full name is required";
    if (!/\S+@\S+\.\S+/.test(form.email))        e.email   = "Enter a valid email address";
    if (form.pass.length < 6)                    e.pass    = "Password must be at least 6 characters";
    if (!isLogin && form.pass !== form.confirm)  e.confirm = "Passwords do not match";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    setLoading(true);
    setApiError("");

    try {
      if (isLogin) {
        // Login
        const response = await request("/api/customers/login", "POST", {
          email: form.email,
          password: form.pass
        });

        if (response.success && response.customer) {
          setDone(true);
          setTimeout(() => {
            onLogin(response.customer);
            onClose();
          }, 1200);
        } else {
          throw new Error(response.message || "Login failed");
        }
      } else {
        // Register
        const response = await request("/api/customers", "POST", {
          fullname: form.name,
          email: form.email,
          password: form.pass,
          phone: form.phone || ""
        });

        if (response.success && response.customer) {
          setDone(true);
          setTimeout(() => {
            onLogin(response.customer);
            onClose();
          }, 1200);
        } else {
          throw new Error(response.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setApiError(error.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(0,0,0,0.78)", backdropFilter:"blur(8px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"20px", animation:"fadeIn 0.2s ease",
      }}
    >
      <div style={{
        background:"#0f0f0f", border:"1px solid rgba(245,240,232,0.1)",
        width:"100%", maxWidth:"400px", padding:"44px 38px",
        position:"relative", animation:"slideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <button onClick={onClose} style={{ position:"absolute", top:"14px", right:"14px", background:"transparent", border:"none", color:"#555", cursor:"pointer", padding:"6px", display:"flex", transition:"color 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.color="#f5f0e8"} onMouseLeave={e=>e.currentTarget.style.color="#555"}>
          <IClose />
        </button>

        <div style={{ marginBottom:"28px" }}>
          <div style={{ fontSize:"9px", fontWeight:"700", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"10px", fontFamily:"'DM Sans',sans-serif" }}>
            {isLogin ? "Welcome back" : "New member"}
          </div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"32px", fontWeight:"300", color:"#f5f0e8", lineHeight:"1.1" }}>
            {isLogin ? "Sign In" : "Create Account"}
          </h2>
        </div>

        {done ? (
          <div style={{ textAlign:"center", padding:"28px 0" }}>
            <div style={{ width:"48px", height:"48px", border:"1px solid #c9a84c", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"#c9a84c", background:"rgba(201,168,76,0.08)" }}>
              <ICheck />
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px", color:"#f5f0e8", letterSpacing:"0.06em" }}>
              {isLogin ? "Welcome back!" : "Account created!"}
            </p>
          </div>
        ) : (
          <>
            {apiError && (
              <div style={{ background:"rgba(224,96,96,0.1)", border:"1px solid rgba(224,96,96,0.3)", padding:"12px", marginBottom:"16px", borderRadius:"4px" }}>
                <p style={{ fontSize:"11px", color:"#e06060", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.04em" }}>
                  {apiError}
                </p>
              </div>
            )}
            
            <div style={{ display:"flex", flexDirection:"column", gap:"14px", marginBottom:"20px" }}>
              {!isLogin && (
                <Field label="Full Name" value={form.name} onChange={v=>set("name",v)} error={errors.name} placeholder="Alexandra Chen" />
              )}
              <Field label="Email Address" type="email" value={form.email} onChange={v=>set("email",v)} error={errors.email} placeholder="you@example.com" />
              {!isLogin && (
                <Field label="Phone (Optional)" value={form.phone} onChange={v=>set("phone",v)} error={errors.phone} placeholder="+855 12 345 678" />
              )}
              <Field
                label="Password"
                type={showPass?"text":"password"}
                value={form.pass} onChange={v=>set("pass",v)}
                error={errors.pass} placeholder="••••••••"
                suffix={
                  <button type="button" onClick={()=>setShowPass(s=>!s)}
                    style={{ background:"transparent", border:"none", color:"#666", cursor:"pointer", display:"flex", padding:0, transition:"color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#f5f0e8"} onMouseLeave={e=>e.currentTarget.style.color="#666"}>
                    {showPass ? <IEyeOff/> : <IEye/>}
                  </button>
                }
              />
              {!isLogin && (
                <Field label="Confirm Password" type={showPass?"text":"password"} value={form.confirm} onChange={v=>set("confirm",v)} error={errors.confirm} placeholder="••••••••" />
              )}
            </div>

            {isLogin && (
              <div style={{ textAlign:"right", marginBottom:"18px" }}>
                <a href="#" style={{ fontSize:"11px", color:"#c9a84c", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", textDecoration:"none" }}>
                  Forgot password?
                </a>
              </div>
            )}

            <button
              onClick={submit} disabled={loading}
              style={{ width:"100%", background:loading?"#9a7c30":"#c9a84c", color:"#0a0a0a", border:"none", padding:"14px", fontFamily:"'DM Sans',sans-serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.22em", textTransform:"uppercase", cursor:loading?"wait":"pointer", marginBottom:"18px", transition:"background 0.2s" }}
            >
              {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
            </button>

            <p style={{ textAlign:"center", fontSize:"12px", color:"#666", fontFamily:"'DM Sans',sans-serif" }}>
              {isLogin ? "Don't have an account?" : "Already a member?"}{" "}
              <button onClick={onSwitch} style={{ background:"transparent", border:"none", color:"#c9a84c", cursor:"pointer", fontSize:"12px", fontFamily:"'DM Sans',sans-serif", fontWeight:"600" }}>
                {isLogin ? "Register" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
