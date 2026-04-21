// Member 4 - ResetPasswordPage (Enter OTP + new password)
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../api/axios";
import "../auth.css";

const ResetPasswordPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [form, setForm] = useState({
    email:       location.state?.email || "",
    otp:         "",
    newPassword: "",
    confirm:     "",
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [done, setDone]         = useState(false);

  const handle = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.newPassword !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ email: form.email, otp: form.otp, newPassword: form.newPassword });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Please try again.");
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

        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
          Set a New<br />Password
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>
          Enter the 6-digit OTP sent to your email and choose a strong new password.
        </p>

        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
          {["Check your inbox for the OTP", "OTP expires in 10 minutes", "Choose a password with 6+ characters"].map(tip => (
            <div key={tip} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
              <span style={{ fontSize: 16 }}>✓</span> {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-split-right">
        <div style={{ width: "100%", maxWidth: 420 }}>

          {!done ? (
            <>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Reset Password</h2>
                <p style={{ color: "#6B7280", fontSize: 14 }}>Enter the OTP and your new password below.</p>
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#DC2626" }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Email (prefilled) */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email Address</label>
                  <input name="email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={handle} required
                    style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "11px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box", background: form.email ? "#F9FAFB" : "#fff" }}
                  />
                </div>

                {/* OTP */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>6-Digit OTP</label>
                  <input name="otp" type="text" placeholder="• • • • • •"
                    value={form.otp} onChange={handle} required maxLength={6}
                    style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "11px 14px", fontSize: 22, letterSpacing: 12, width: "100%", outline: "none", boxSizing: "border-box", textAlign: "center", fontWeight: 700, background: "#fff" }}
                  />
                </div>

                {/* New Password */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input name="newPassword" type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                      value={form.newPassword} onChange={handle} required minLength={6}
                      style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "11px 40px 11px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box", background: "#fff" }}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}>
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {form.newPassword.length > 0 && (
                    <div style={{ marginTop: 6, height: 4, borderRadius: 4, background: "#E5E7EB", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, transition: "width 0.3s",
                        width: form.newPassword.length < 6 ? "30%" : form.newPassword.length < 10 ? "60%" : "100%",
                        background: form.newPassword.length < 6 ? "#EF4444" : form.newPassword.length < 10 ? "#F59E0B" : "#10B981",
                      }} />
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Confirm Password</label>
                  <input name="confirm" type={showPass ? "text" : "password"} placeholder="Repeat new password"
                    value={form.confirm} onChange={handle} required
                    style={{ borderRadius: 10, border: `1.5px solid ${form.confirm && form.confirm !== form.newPassword ? "#EF4444" : "#E5E7EB"}`, padding: "11px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box", background: "#fff" }}
                  />
                  {form.confirm && form.confirm !== form.newPassword && (
                    <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>Passwords do not match</div>
                  )}
                </div>

                <button type="submit" disabled={loading} style={{
                  background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none",
                  borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4,
                }}>
                  {loading ? "Resetting..." : "Reset Password →"}
                </button>
              </form>

              <p style={{ textAlign: "center", color: "#6B7280", fontSize: 13, marginTop: 20 }}>
                Didn't receive the OTP?{" "}
                <Link to="/forgot-password" style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>Resend</Link>
              </p>
            </>
          ) : (
            /* Success */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 24px" }}>
                ✅
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Password Reset!</h2>
              <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "13px", fontSize: 15, fontWeight: 700, borderRadius: 10 }}
                onClick={() => navigate("/login")}
              >
                Go to Sign In →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
