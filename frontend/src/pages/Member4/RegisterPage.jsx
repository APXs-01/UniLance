// Member 4 - RegisterPage (Role selection + SL university email validation)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/axios";
import "../auth.css";

const SL_DOMAINS = ["my.sliit.lk","nibm.lk","cinec.edu.lk","uom.lk","cmb.ac.lk","pdn.ac.lk",
  "kln.ac.lk","sjp.ac.lk","ruh.ac.lk","sab.ac.lk","seu.ac.lk","wyb.ac.lk","ou.ac.lk",
  "nsbm.ac.lk","iit.ac.lk","apiit.lk","horizon.ac.lk","rajarata.ac.lk","esn.ac.lk","vau.ac.lk"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep]   = useState(1);
  const [role, setRole]   = useState("");
  const [form, setForm]   = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isUniversityEmail = (email) => {
    const domain = email.toLowerCase().split("@")[1] || "";
    return SL_DOMAINS.some((d) => domain === d || domain.endsWith("." + d));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (role === "freelancer" && !isUniversityEmail(form.email)) {
      setError("Freelancers must use a Sri Lankan university email (e.g., @my.sliit.lk, @uom.lk).");
      return;
    }
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role });
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">

      {/* Left Panel */}
      <div className="auth-split-left">
        {/* Decorative circles */}
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: -80, right: -80 }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: 60, left: -60 }} />

        <img src="/Home/UniLance-Logo.png" alt="UniLance" style={{ height: 200, objectFit: "contain", objectPosition: "left", marginBottom: 48, filter: "brightness(0) invert(1)" }} />

        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
          Start your freelance<br />journey today
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
          Join thousands of Sri Lankan university students earning money with their skills on UniLance.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: "🎓", text: "Verified skill badges via SmartQuest" },
            { icon: "💳", text: "Secure Stripe payments with OTP" },
            { icon: "💬", text: "Join student communities by field" },
            { icon: "📄", text: "Auto-generated portfolio PDF" },
          ].map((f) => (
            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {f.icon}
              </div>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-split-right">
        <div style={{ width: "100%", maxWidth: 480 }}>

          {step === 1 ? (
            <>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Join UniLance</h2>
              <p style={{ color: "#6B7280", marginBottom: 32 }}>How do you want to use UniLance?</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                {/* Freelancer card */}
                <button onClick={() => { setRole("freelancer"); setStep(2); }} style={{
                  background: "#fff", border: "2px solid #E5E7EB", borderRadius: 16, padding: "28px 20px",
                  cursor: "pointer", textAlign: "center", transition: "all .2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#4F46E5"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(79,70,229,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                >
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#EEF2FF,#C7D2FE)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", overflow: "hidden" }}><img src="/Home/Signup/Freelancer.png" alt="Freelancer" style={{ width: 56, height: 56, objectFit: "contain" }} /></div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 8 }}>Student Freelancer</div>
                  <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginBottom: 12 }}>Offer services, join communities, earn money while studying</div>
                  <div style={{ fontSize: 11, color: "#4F46E5", fontWeight: 600, background: "#EEF2FF", borderRadius: 20, padding: "4px 10px", display: "inline-block" }}>Requires SL university email</div>
                </button>

                {/* Buyer card */}
                <button onClick={() => { setRole("buyer"); setStep(2); }} style={{
                  background: "#fff", border: "2px solid #E5E7EB", borderRadius: 16, padding: "28px 20px",
                  cursor: "pointer", textAlign: "center", transition: "all .2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#10B981"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                >
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#ECFDF5,#A7F3D0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", overflow: "hidden" }}><img src="/Home/Signup/Buyer.png" alt="Buyer" style={{ width: 56, height: 56, objectFit: "contain" }} /></div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 8 }}>Buyer</div>
                  <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginBottom: 12 }}>Hire talented students for your projects and business needs</div>
                  <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, background: "#ECFDF5", borderRadius: 20, padding: "4px 10px", display: "inline-block" }}>Any email accepted</div>
                </button>
              </div>

              <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14 }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 24, padding: 0 }}>
                ← Back
              </button>

              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Create Account</h2>
              <p style={{ color: "#6B7280", marginBottom: 24, fontSize: 14 }}>
                Joining as{" "}
                <span style={{ background: role === "freelancer" ? "#EEF2FF" : "#ECFDF5", color: role === "freelancer" ? "#4F46E5" : "#059669", fontWeight: 700, padding: "2px 10px", borderRadius: 20, fontSize: 13 }}>
                  {role === "freelancer" ? "Student Freelancer" : "Buyer"}
                </span>
              </p>

              {role === "freelancer" && (
                <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#4338CA" }}>
                  🎓 <strong>University students only.</strong> Use your SL university email (e.g., @my.sliit.lk, @uom.lk)
                </div>
              )}

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#DC2626" }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Full Name</label>
                  <input name="name" className="form-control" placeholder="Sahan Perera" value={form.name} onChange={handle} required
                    style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "10px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email Address</label>
                  <input name="email" type="email" className="form-control"
                    placeholder={role === "freelancer" ? "you@my.sliit.lk" : "you@company.com"}
                    value={form.email} onChange={handle} required
                    style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "10px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
                    <input name="password" type="password" className="form-control" placeholder="Min. 6 characters"
                      value={form.password} onChange={handle} required
                      style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "10px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Confirm Password</label>
                    <input name="confirmPassword" type="password" className="form-control" placeholder="••••••••"
                      value={form.confirmPassword} onChange={handle} required
                      style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "10px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none",
                  borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1, marginTop: 4
                }}>
                  {loading ? "Creating account..." : "Create Account →"}
                </button>
              </form>

              <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginTop: 20 }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
