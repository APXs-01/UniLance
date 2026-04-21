// Member 4 - VerifyEmailPage (OTP verification after registration)
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../auth.css";

const VerifyEmailPage = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const email      = location.state?.email || "";
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (value, idx) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      const { data } = await authAPI.verifyEmail({ email, otp: code });
      login(data.token, data.user);
      navigate("/profile?setup=true");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await authAPI.resendOTP({ email, type: "email_verification" });
      setSuccess("OTP resent to your email.");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Failed to resend OTP.");
    }
  };

  return (
    <div className="auth-split">

      {/* Left Panel */}
      <div className="auth-split-left">
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: -80, right: -80 }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: 60, left: -60 }} />

        <img src="/Home/UniLance-Logo.png" alt="UniLance" style={{ height: 200, objectFit: "contain", objectPosition: "left", marginBottom: 48, filter: "brightness(0) invert(1)" }} />

        <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <img src="/Home/Signup/Mail.png" alt="Mail" style={{ width: 52, height: 52, objectFit: "contain" }} />
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
          Check your<br />inbox
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 320 }}>
          We sent a 6-digit verification code to your email. Enter it to activate your account.
        </p>

        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Sending to</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", wordBreak: "break-all" }}>{email || "your email"}</div>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 20 }}>⏱ OTP expires in 10 minutes</p>
      </div>

      {/* Right Panel */}
      <div className="auth-split-right">
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Verify Your Email</h2>
          <p style={{ color: "#6B7280", marginBottom: 32, fontSize: 14 }}>
            Enter the 6-digit code sent to <strong style={{ color: "#111827" }}>{email}</strong>
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#DC2626" }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#065F46" }}>
              ✅ {success}
            </div>
          )}

          <form onSubmit={submit}>
            {/* OTP inputs */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32 }}>
              {otp.map((digit, i) => (
                <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  style={{
                    width: 56, height: 64, textAlign: "center", fontSize: 26, fontWeight: 700,
                    border: `2px solid ${digit ? "#4F46E5" : "#E5E7EB"}`,
                    borderRadius: 12, outline: "none",
                    background: digit ? "#EEF2FF" : "#fff",
                    color: "#111827", transition: "border-color .15s, background .15s",
                    boxShadow: digit ? "0 0 0 3px rgba(79,70,229,0.1)" : "none"
                  }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading} style={{
              background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none",
              borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, width: "100%",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1
            }}>
              {loading ? "Verifying..." : "Verify Email →"}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 14, color: "#6B7280" }}>
            Didn't receive it?{" "}
            <button onClick={resend} style={{ background: "none", border: "none", color: "#4F46E5", fontWeight: 600, cursor: "pointer", fontSize: 14, padding: 0 }}>
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
