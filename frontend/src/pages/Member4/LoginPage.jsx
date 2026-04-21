// Member 4 - LoginPage (Email + Password login with JWT)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../auth.css";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.token, data.user);
      if (data.user.role === "admin")           navigate("/admin");
      else if (data.user.role === "freelancer") navigate("/dashboard/gigs");
      else                                      navigate("/gigs");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      if (err.response?.data?.requiresVerification) {
        navigate("/verify-email", { state: { email: form.email } });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">

      {/* Left Panel */}
      <div className="auth-split-left">
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: -80, right: -80 }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: 60, left: -60 }} />

        <img src="/Home/UniLance-Logo.png" alt="UniLance" style={{ height: 200, objectFit: "contain", objectPosition: "left", marginBottom: 48, filter: "brightness(0) invert(1)" }} />

        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
          Welcome back to<br />UniLance
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
          Sri Lanka's #1 student freelance platform. Connect, earn, and grow your career.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: "🔒", text: "Secure OTP-verified payments" },
            { icon: "🎓", text: "AI-powered skill verification" },
            { icon: "💬", text: "Active student communities" },
            { icon: "📊", text: "Real-time order tracking" },
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
        <div style={{ width: "100%", maxWidth: 420 }}>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Welcome Back</h2>
          <p style={{ color: "#6B7280", marginBottom: 32, fontSize: 14 }}>Sign in to your UniLance account</p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#DC2626" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email Address</label>
              <input name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handle} required
                style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "11px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box", background: "#fff" }} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: "#4F46E5", textDecoration: "none", fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <input name="password" type="password" placeholder="••••••••"
                value={form.password} onChange={handle} required
                style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "11px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box", background: "#fff" }} />
            </div>

            <button type="submit" disabled={loading} style={{
              background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none",
              borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4
            }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginTop: 24 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
