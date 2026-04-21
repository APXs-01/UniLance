// Member 4 - AnalyticsPage (Freelancer Analytics Dashboard)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userAPI } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const StatCard = ({ icon, label, value, sub, color = "#4F46E5", bg = "#EEF2FF" }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: "24px 20px", boxShadow: "0 1px 8px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 4 }}>
      {icon}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color }}>{value ?? "—"}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: "#9CA3AF" }}>{sub}</div>}
  </div>
);

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    userAPI.getAnalytics()
      .then(r => setData(r.data.analytics))
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page flex-center" style={{ height: "60vh" }}>
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600, textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{error}</div>
        <Link to="/profile" className="btn btn-primary">Back to Profile</Link>
      </div>
    </div>
  );

  const a = data;
  const completionPct = user ? Math.round(
    Object.values(user.profileCompletionSteps || {}).filter(Boolean).length /
    Math.max(Object.keys(user.profileCompletionSteps || {}).length, 1) * 100
  ) : 0;

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Analytics Dashboard</h1>
          <p style={{ color: "#6B7280", fontSize: 15 }}>Overview of your performance on UniLance</p>
        </div>

        {/* Top Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 32 }}>
          <StatCard icon="👁️" label="Profile Views"       value={a.profileViews}          color="#4F46E5" bg="#EEF2FF" />
          <StatCard icon="✅" label="Orders Completed"    value={a.totalOrdersCompleted}   color="#10B981" bg="#D1FAE5" />
          <StatCard icon="💰" label="Wallet Balance"      value={`$${(a.walletBalance||0).toFixed(2)}`} color="#F59E0B" bg="#FEF3C7" />
          <StatCard icon="🏅" label="Verified Skills"     value={a.verifiedSkills}         color="#7C3AED" bg="#EDE9FE" sub={`of ${a.totalSkills} total skills`} />
          <StatCard icon="⭐" label="Average Rating"      value={a.averageRating || "New"} color="#EF4444" bg="#FEE2E2" />
          <StatCard icon="📦" label="Total Gigs"          value={a.totalGigs}              color="#0EA5E9" bg="#E0F2FE" sub={`${a.activeGigs} active`} />
        </div>

        {/* Two column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Profile Completion */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Profile Completion</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}>
              {/* Circle progress */}
              <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="36" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  <circle cx="45" cy="45" r="36" fill="none" stroke="#4F46E5" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - completionPct / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#4F46E5" }}>
                  {completionPct}%
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                  {completionPct < 50 ? "Getting started" : completionPct < 80 ? "Looking good!" : "Almost there!"}
                </div>
                <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
                  Complete your profile to attract more clients and improve visibility.
                </div>
              </div>
            </div>

            {/* Step checklist */}
            {user?.profileCompletionSteps && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(user.profileCompletionSteps).map(([key, done]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                    <span style={{ fontSize: 16 }}>{done ? "✅" : "⭕"}</span>
                    <span style={{ color: done ? "#374151" : "#9CA3AF", textTransform: "capitalize" }}>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/profile" className="btn btn-primary btn-sm mt-3" style={{ width: "100%", justifyContent: "center" }}>
              Complete Profile →
            </Link>
          </div>

          {/* Gig Performance */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Gig Performance</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F9FAFB", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>📦</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Total Gigs</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, color: "#4F46E5" }}>{a.totalGigs}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F9FAFB", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🟢</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Active Gigs</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, color: "#10B981" }}>{a.activeGigs}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F9FAFB", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⭐</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Average Rating</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, color: "#F59E0B" }}>{a.averageRating || "—"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F9FAFB", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Completed Orders</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, color: "#10B981" }}>{a.totalOrdersCompleted}</span>
              </div>
            </div>

            <Link to="/dashboard/gigs" className="btn btn-secondary btn-sm mt-3" style={{ width: "100%", justifyContent: "center" }}>
              Manage Gigs →
            </Link>
          </div>

          {/* Skills & Badges */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Skills & Verification</h3>

            {/* Skills bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#6B7280" }}>Verified Skills</span>
                <span style={{ fontWeight: 700, color: "#4F46E5" }}>{a.verifiedSkills}/{a.totalSkills}</span>
              </div>
              <div style={{ height: 8, background: "#E5E7EB", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  width: a.totalSkills > 0 ? `${(a.verifiedSkills / a.totalSkills) * 100}%` : "0%",
                  background: "linear-gradient(90deg,#4F46E5,#7C3AED)",
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>

            {/* Skill list */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {(user?.skills || []).map(s => (
                <span key={s._id} style={{
                  padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: s.verified ? "#D1FAE5" : "#F3F4F6",
                  color: s.verified ? "#065F46" : "#374151",
                  border: `1.5px solid ${s.verified ? "#10B981" : "#E5E7EB"}`,
                }}>
                  {s.verified ? "✓ " : ""}{s.name}
                </span>
              ))}
              {(!user?.skills || user.skills.length === 0) && (
                <span style={{ color: "#9CA3AF", fontSize: 13 }}>No skills added yet.</span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/profile?tab=skills" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>Manage Skills</Link>
              <Link to="/smartquest" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>Take SmartQuest 🤖</Link>
            </div>
          </div>

          {/* Earnings & Wallet */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Earnings & Wallet</h3>

            <div style={{ textAlign: "center", padding: "24px 0", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 6 }}>Available Balance</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#4F46E5" }}>
                ${(a.walletBalance || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>USD</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>🏅</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#7C3AED" }}>{a.totalBadges}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Badges Earned</div>
              </div>
              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#10B981" }}>{a.totalOrdersCompleted}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Orders Done</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/dashboard/payouts" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>Withdraw →</Link>
              <Link to="/dashboard/transactions" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>Transactions</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
