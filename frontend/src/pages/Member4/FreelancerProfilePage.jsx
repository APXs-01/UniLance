// Member 4 - FreelancerProfilePage (Public Profile by userId)
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { userAPI, reviewAPI } from "../../api/axios";

const FreelancerProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getPublicProfile(id)
      .then(res => {
        setProfile(res.data);
        return reviewAPI.getByFreelancer(id);
      })
      .then(res => setReviews(res.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page flex-center" style={{ height: "60vh" }}><div className="spinner" /></div>;
  if (!profile?.user) return <div className="page flex-center" style={{ height: "60vh", color: "#6B7280" }}>Freelancer not found.</div>;

  const { user, gigs, badges = [] } = profile;
  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const milestoneBadges = badges.filter(b => b.type === "milestone");
  const skillBadges     = badges.filter(b => b.type === "skill_verified");
  const milestoneIcons  = { 1:"🎉", 5:"⭐", 10:"🏆", 25:"🥇", 50:"💎", 100:"🌟" };

  return (
    <div className="page" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      {/* Header Card */}
      <div className="card mb-4" style={{ padding: 32 }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#4F46E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, flexShrink: 0 }}>
            {user.profilePicture ? <img src={user.profilePicture} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{user.name}</h1>
              {user.skills?.filter(s => s.verified).map(s => (
                <span key={s._id} style={{ background: "#EEF2FF", color: "#4F46E5", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                  ✓ {s.verifiedBadgeTitle || s.name}
                </span>
              ))}
            </div>
            <div style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>{user.university}</div>
            {user.location && <div style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>📍 {user.location}</div>}
            <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{user.totalOrdersCompleted || 0}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Orders Completed</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{user.profileViews || 0}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Profile Views</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{reviews.length}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {user.bio && (
          <div style={{ marginTop: 20, padding: "16px", background: "#F9FAFB", borderRadius: 8, color: "#374151", fontSize: 14, lineHeight: 1.7 }}>
            {user.bio}
          </div>
        )}
      </div>

      {/* ── Badges Row ── */}
      {badges.length > 0 && (
        <div className="card mb-4" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 4, height: 20, background: "#F59E0B", borderRadius: 2 }} />
            <h2 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Badges & Achievements</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {milestoneBadges.map(b => (
              <div key={b._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 20, background: "#FFFBEB", border: "1px solid #FDE68A" }}
                title={b.description}>
                <span style={{ fontSize: 18 }}>{milestoneIcons[b.triggerValue] || "🏅"}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E" }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: "#B45309" }}>{b.triggerValue} orders</div>
                </div>
              </div>
            ))}
            {skillBadges.map(b => (
              <div key={b._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 20, background: "#F0FDF4", border: "1px solid #86EFAC" }}
                title={b.description}>
                <span style={{ fontSize: 18 }}>🏅</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#065F46" }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: "#059669" }}>Skill Verified</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
        <div>
          {/* Gigs */}
          {gigs?.length > 0 && (
            <div className="card mb-4" style={{ padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Gigs</h2>
              <div style={{ display: "grid", gap: 12 }}>
                {gigs.map(g => (
                  <Link key={g._id} to={`/gigs/${g._id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", gap: 14, padding: 12, border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", transition: "box-shadow .15s" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                      <div style={{ width: 56, height: 56, borderRadius: 8, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🎨</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>{g.title}</div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{g.category}</div>
                        <div style={{ fontSize: 13, color: "#4F46E5", fontWeight: 700, marginTop: 4 }}>from ${g.price}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Reviews</h2>
              {reviews.map(r => (
                <div key={r._id} style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.buyer?.name}</span>
                    <span style={{ color: "#F59E0B" }}>{"★".repeat(r.rating?.overall || 5)}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{r.comment}</p>
                  {r.freelancerReply && (
                    <div style={{ background: "#F3F4F6", borderRadius: 8, padding: "8px 12px", marginTop: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 2 }}>Freelancer Reply:</div>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{r.freelancerReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Skills */}
          {user.skills?.length > 0 && (
            <div className="card mb-3" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Skills</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {user.skills.map((s, i) => (
                  <span key={i} style={{ background: s.verified ? "#EEF2FF" : "#F3F4F6", color: s.verified ? "#4F46E5" : "#374151", borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 500 }}>
                    {s.verified ? "✓ " : ""}{s.name}
                    <span style={{ color: "#9CA3AF", fontSize: 11 }}> · {s.proficiency}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {user.availability?.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Availability</h3>
              {user.availability.map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "#374151" }}>
                  <span style={{ fontWeight: 500 }}>{a.day}</span>
                  <span style={{ color: "#6B7280" }}>{a.startTime} – {a.endTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;
