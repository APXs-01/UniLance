// Member 4 - PublicPortfolioPage (Public portfolio by portfolioSlug)
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { userAPI, reviewAPI } from "../../api/axios";

const DAY_COLORS = {
  Monday: "#4F46E5", Tuesday: "#7C3AED", Wednesday: "#0EA5E9",
  Thursday: "#059669", Friday: "#D97706", Saturday: "#EF4444", Sunday: "#EC4899",
};

const PublicPortfolioPage = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    userAPI.getPublicProfile(slug)
      .then(res => {
        setProfile(res.data);
        return reviewAPI.getByFreelancer(res.data.user._id);
      })
      .then(res => setReviews(res.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );

  if (!profile?.user) return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 64, fontWeight: 900, color: "#4F46E5" }}>404</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Portfolio not found</div>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );

  const { user, gigs } = profile;
  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating?.overall || 5), 0) / reviews.length).toFixed(1)
    : null;
  const verifiedSkills = user.skills?.filter(s => s.verified) || [];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "gigs",     label: `Gigs (${gigs?.length || 0})` },
    { key: "reviews",  label: `Reviews (${reviews.length})` },
    ...(user.availability?.length ? [{ key: "availability", label: "Availability" }] : []),
  ];

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh" }}>

      {/* ── Hero Banner ── */}
      <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)", position: "relative", overflow: "hidden" }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.03)", top: -80, right: -80 }} />
        <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.03)", bottom: -40, left: -40 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#4F46E5,#7C3AED,#EC4899)" }} />

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 40px", position: "relative" }}>
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* Avatar */}
            <div style={{ width: 100, height: 100, borderRadius: "50%", flexShrink: 0, border: "3px solid rgba(255,255,255,0.3)", overflow: "hidden", background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 700, color: "#fff" }}>
              {user.profilePicture
                ? <img src={user.profilePicture} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: 0 }}>{user.name}</h1>
                <span style={{ background: "#4F46E5", color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>FREELANCER</span>
              </div>

              {user.university && (
                <div style={{ color: "#94A3B8", fontSize: 14, marginBottom: 4 }}>🎓 {user.university}</div>
              )}
              {user.location && (
                <div style={{ color: "#94A3B8", fontSize: 14, marginBottom: 12 }}>📍 {user.location}</div>
              )}

              {/* Stats */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { value: user.totalOrdersCompleted || 0, label: "Orders" },
                  { value: user.profileViews || 0,         label: "Views" },
                  { value: user.skills?.length || 0,        label: "Skills" },
                  ...(avgRating ? [{ value: `⭐ ${avgRating}`, label: "Rating" }] : []),
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{s.value}</div>
                    <div style={{ color: "#94A3B8", fontSize: 11, fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified badges */}
            {verifiedSkills.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignSelf: "flex-end" }}>
                {verifiedSkills.slice(0, 3).map((s, i) => (
                  <span key={i} style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#34D399", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                    ✓ {s.verifiedBadgeTitle || s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: activeTab === t.key ? "#4F46E5" : "#6B7280", borderBottom: activeTab === t.key ? "2px solid #4F46E5" : "2px solid transparent", transition: "all .15s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
            <div>
              {/* Bio */}
              {user.bio && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 4, height: 20, background: "#4F46E5", borderRadius: 2 }} />
                    <h2 style={{ fontWeight: 700, fontSize: 16, margin: 0, color: "#111827" }}>About</h2>
                  </div>
                  <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{user.bio}</p>
                </div>
              )}

              {/* Recent Gigs */}
              {gigs?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 20, background: "#4F46E5", borderRadius: 2 }} />
                      <h2 style={{ fontWeight: 700, fontSize: 16, margin: 0, color: "#111827" }}>Gigs</h2>
                    </div>
                    {gigs.length > 3 && (
                      <button onClick={() => setActiveTab("gigs")} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        View all →
                      </button>
                    )}
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {gigs.slice(0, 3).map(g => <GigCard key={g._id} gig={g} />)}
                  </div>
                </div>
              )}

              {/* Recent Reviews */}
              {reviews.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 20, background: "#F59E0B", borderRadius: 2 }} />
                      <h2 style={{ fontWeight: 700, fontSize: 16, margin: 0, color: "#111827" }}>Reviews</h2>
                    </div>
                    {reviews.length > 2 && (
                      <button onClick={() => setActiveTab("reviews")} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        View all →
                      </button>
                    )}
                  </div>
                  {reviews.slice(0, 2).map(r => <ReviewCard key={r._id} review={r} />)}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Skills */}
              {user.skills?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, background: "#7C3AED", borderRadius: 2 }} />
                    <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Skills</h3>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {user.skills.map((s, i) => (
                      <span key={i} style={{ background: s.verified ? "#EEF2FF" : "#F3F4F6", color: s.verified ? "#4F46E5" : "#374151", border: `1px solid ${s.verified ? "#C7D2FE" : "#E5E7EB"}`, borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 500 }}>
                        {s.verified ? "✓ " : ""}{s.name}
                        <span style={{ color: "#9CA3AF", fontSize: 11 }}> · {s.proficiency}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability snippet */}
              {user.availability?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, background: "#F59E0B", borderRadius: 2 }} />
                    <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Availability</h3>
                  </div>
                  {user.availability.slice(0, 4).map((a, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, padding: "6px 8px", borderRadius: 6, background: (DAY_COLORS[a.day] || "#4F46E5") + "10" }}>
                      <span style={{ fontWeight: 600, color: DAY_COLORS[a.day] || "#4F46E5" }}>{a.day}</span>
                      <span style={{ color: "#374151" }}>{a.startTime} – {a.endTime}</span>
                    </div>
                  ))}
                  {user.availability.length > 4 && (
                    <button onClick={() => setActiveTab("availability")} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
                      +{user.availability.length - 4} more days →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gigs Tab */}
        {activeTab === "gigs" && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20, color: "#111827" }}>All Gigs</h2>
            {gigs?.length > 0
              ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {gigs.map(g => <GigCard key={g._id} gig={g} large />)}
                </div>
              : <div style={{ textAlign: "center", color: "#9CA3AF", padding: "60px 0", fontSize: 15 }}>No gigs posted yet.</div>
            }
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <h2 style={{ fontWeight: 700, fontSize: 20, margin: 0, color: "#111827" }}>All Reviews</h2>
              {avgRating && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 20, padding: "4px 14px" }}>
                  <span style={{ color: "#F59E0B", fontSize: 16 }}>★</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#92400E" }}>{avgRating}</span>
                  <span style={{ color: "#92400E", fontSize: 13 }}>({reviews.length} reviews)</span>
                </div>
              )}
            </div>
            {reviews.length > 0
              ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
                </div>
              : <div style={{ textAlign: "center", color: "#9CA3AF", padding: "60px 0", fontSize: 15 }}>No reviews yet.</div>
            }
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20, color: "#111827" }}>Availability Schedule</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {user.availability.map((a, i) => {
                const c = DAY_COLORS[a.day] || "#4F46E5";
                return (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px", border: "1px solid #E5E7EB", borderLeft: `4px solid ${c}` }}>
                    <div style={{ fontWeight: 700, color: c, fontSize: 13, marginBottom: 4 }}>{a.day}</div>
                    <div style={{ color: "#374151", fontSize: 15, fontWeight: 600 }}>{a.startTime} – {a.endTime}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const GigCard = ({ gig, large }) => (
  <Link to={`/gigs/${gig._id}`} style={{ textDecoration: "none" }}>
    <div style={{ display: "flex", gap: large ? 16 : 12, padding: large ? 16 : 12, border: "1px solid #E5E7EB", borderRadius: 10, background: "#fff", transition: "box-shadow .15s, border-color .15s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(79,70,229,.1)"; e.currentTarget.style.borderColor = "#C7D2FE"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#E5E7EB"; }}>
      <div style={{ width: large ? 64 : 52, height: large ? 64 : 52, borderRadius: 8, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: large ? 28 : 22, flexShrink: 0 }}>
        {gig.images?.[0] ? <img src={gig.images[0]} alt="" style={{ width: "100%", height: "100%", borderRadius: 8, objectFit: "cover" }} /> : "🎨"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: "#111827", fontSize: large ? 15 : 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gig.title}</div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{gig.category}</div>
        <div style={{ fontSize: 13, color: "#4F46E5", fontWeight: 700, marginTop: 4 }}>from ${gig.price}</div>
      </div>
    </div>
  </Link>
);

const ReviewCard = ({ review: r }) => (
  <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #E5E7EB" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <div>
        <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{r.buyer?.name || "Anonymous"}</span>
        {r.order?.gig?.title && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{r.order.gig.title}</div>}
      </div>
      <div style={{ color: "#F59E0B", fontSize: 14, letterSpacing: 1 }}>{"★".repeat(r.rating?.overall || 5)}</div>
    </div>
    <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.7 }}>{r.comment}</p>
    {r.freelancerReply && (
      <div style={{ background: "#F3F4F6", borderRadius: 8, padding: "10px 14px", marginTop: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 3 }}>Freelancer Reply:</div>
        <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{r.freelancerReply}</p>
      </div>
    )}
  </div>
);

export default PublicPortfolioPage;
