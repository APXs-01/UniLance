// Member 4 - ForgotPasswordPage (Request password reset OTP)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/axios";
import "../auth.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
          Reset Your<br />Password
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>
          Enter your registered email address and we'll send you a one-time OTP to reset your password.
        </p>
      </div>

      {/* Right Panel */}
      <div className="auth-split-right">
        <div style={{ width: "100%", maxWidth: 420 }}>

          {!sent ? (
            <>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Forgot Password?</h2>
                <p style={{ color: "#6B7280", fontSize: 14 }}>No worries — we'll send a reset OTP to your email.</p>
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#DC2626" }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email Address</label>
                  <input
                    type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ borderRadius: 10, border: "1.5px solid #E5E7EB", padding: "11px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box", background: "#fff" }}
                  />
                </div>

                <button type="submit" disabled={loading || !email.trim()} style={{
                  background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none",
                  borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer", opacity: (loading || !email.trim()) ? 0.7 : 1,
                }}>
                  {loading ? "Sending OTP..." : "Send Reset OTP →"}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>
                📧
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Check your email</h2>
              <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
                We've sent a 6-digit OTP to
              </p>
              <p style={{ fontWeight: 700, color: "#4F46E5", fontSize: 15, marginBottom: 28 }}>{email}</p>
              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "13px", fontSize: 15, fontWeight: 700, borderRadius: 10, marginBottom: 16 }}
                onClick={() => navigate("/reset-password", { state: { email } })}
              >
                Enter OTP & Reset Password →
              </button>
              <button
                style={{ background: "none", border: "none", color: "#6B7280", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
                onClick={() => { setSent(false); setEmail(""); }}
              >
                Use a different email
              </button>
            </div>
          )}

          <p style={{ textAlign: "center", color: "#6B7280", fontSize: 14, marginTop: 32 }}>
            Remember your password?{" "}
            <Link to="/login" style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
