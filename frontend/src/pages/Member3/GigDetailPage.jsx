// Member 3 - GigDetailPage (View Single Gig, GitHub Repo, Order Now)
import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { gigAPI, orderAPI, reviewAPI } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/common/Avatar";

// ── Custom Toast Notification ──────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: 12,
        background: t.type === "error" ? "#FEF2F2" : t.type === "success" ? "#F0FDF4" : "#EFF6FF",
        border: `1.5px solid ${t.type === "error" ? "#FCA5A5" : t.type === "success" ? "#86EFAC" : "#93C5FD"}`,
        color: t.type === "error" ? "#B91C1C" : t.type === "success" ? "#15803D" : "#1D4ED8",
        borderRadius: 12, padding: "14px 20px", minWidth: 280, maxWidth: 380,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        animation: "slideIn 0.25s ease",
        pointerEvents: "all",
        fontSize: 14, fontWeight: 600, lineHeight: 1.4,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>
          {t.type === "error" ? "⚠️" : t.type === "success" ? "✅" : "ℹ️"}
        </span>
        {t.msg}
      </div>
    ))}
    <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }`}</style>
  </div>
);

// ── Inline gallery component (cover + thumbnails) ──────────────────────────
const GigGallery = ({ images }) => {
  const [active, setActive] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Main image */}
      <div style={{ borderRadius: 16, overflow: "hidden", height: 320, background: "#111", marginBottom: 10 }}>
        <img
          src={images[active]}
          alt={`gig-${active}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      {/* Thumbnails — only show if more than 1 image */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: 72, height: 54, borderRadius: 8, overflow: "hidden", cursor: "pointer",
                border: `2.5px solid ${active === i ? "#4F46E5" : "transparent"}`,
                opacity: active === i ? 1 : 0.65,
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              <img src={img} alt={`thumb-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GigDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isBuyer } = useAuth();

  const [gig, setGig]         = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [orderMsg, setOrderMsg] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [replyInputs, setReplyInputs] = useState({}); // { reviewId: text }
  const [replyOpen, setReplyOpen]     = useState({}); // { reviewId: bool }
  const [replyLoading, setReplyLoading] = useState({});
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = "error") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    Promise.all([
      gigAPI.getOne(id),
      reviewAPI.getGigReviews(id),
    ]).then(([gigRes, revRes]) => {
      setGig(gigRes.data.gig);
      setReviews(revRes.data.reviews || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const isGigOwner = gig && user && (gig.freelancer?._id === user?._id || gig.freelancer?._id === user?.id || gig.freelancer?.email === user?.email);

  const submitReply = async (reviewId) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text) return;
    setReplyLoading(p => ({ ...p, [reviewId]: true }));
    try {
      await reviewAPI.reply(reviewId, { reply: text });
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, freelancerReply: text, freelancerRepliedAt: new Date() } : r));
      setReplyOpen(p => ({ ...p, [reviewId]: false }));
      setReplyInputs(p => ({ ...p, [reviewId]: "" }));
    } catch (err) { showToast(err.response?.data?.message || "Reply failed"); }
    setReplyLoading(p => ({ ...p, [reviewId]: false }));
  };

  // Member 3 - Place order for this gig
  const handleOrder = async () => {
    if (!user) { navigate("/login"); return; }
    if (!isBuyer) { showToast("Only buyers can place orders."); return; }
    if (!orderMsg.trim()) { showToast("Please describe your requirements before placing an order."); return; }
    setOrdering(true);
    try {
      const { data } = await orderAPI.place({ gigId: id, requirements: orderMsg });
      navigate(`/dashboard/orders/${data.order._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Order failed");
    } finally { setOrdering(false); }
  };

  if (loading) return <div className="flex-center" style={{ height: "60vh" }}><div className="spinner" /></div>;
  if (!gig) return <div className="page container"><div className="alert alert-error">Gig not found.</div></div>;

  const catEmojis = { "Graphic Design": "🎨", "Full Stack Web Development": "💻", "Cyber Security": "🔒", "Data Science": "📊", "Business Analysis": "📈" };

  return (
    <div className="page">
      <Toast toasts={toasts} />
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
          <Link to="/gigs" style={{ color: "#4F46E5" }}>Browse Gigs</Link> / {gig.title}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
          {/* Main Content */}
          <div>
            {/* Image Gallery — falls back to emoji if no images */}
            {[gig.coverImage, ...(gig.gallery || [])].filter(Boolean).length > 0 ? (
              <GigGallery images={[gig.coverImage, ...(gig.gallery || [])].filter(Boolean)} />
            ) : (
              <div style={{ borderRadius: 16, overflow: "hidden", height: 280, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <span style={{ fontSize: 80 }}>{catEmojis[gig.category] || "💼"}</span>
              </div>
            )}

            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>{gig.title}</h1>

            {/* Freelancer Info */}
            <div className="card mb-3" style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
              <Avatar name={gig.freelancer?.name} src={gig.freelancer?.profilePicture} size={52} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{gig.freelancer?.name}</div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{gig.freelancer?.university}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#F59E0B", fontSize: 18 }}>★</span>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{gig.averageRating?.toFixed(1) || "New"}</span>
                  <span style={{ color: "#9CA3AF", fontSize: 13 }}>({gig.totalReviews} reviews)</span>
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{gig.totalOrders || 0} orders completed</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #E5E7EB", marginBottom: 24 }}>
              {["overview", "github", "reviews"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, borderBottom: activeTab === tab ? "2px solid #4F46E5" : "2px solid transparent", color: activeTab === tab ? "#4F46E5" : "#6B7280", marginBottom: -2, textTransform: "capitalize" }}>
                  {tab === "github" ? "GitHub Repo" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Description</h3>
                <p style={{ color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 24 }}>{gig.description}</p>

                {gig.tags?.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Tags</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {gig.tags.map(tag => <span key={tag} className="badge badge-gray">#{tag}</span>)}
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div className="card text-center" style={{ padding: 20 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#4F46E5" }}>${gig.price}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Starting Price</div>
                  </div>
                  <div className="card text-center" style={{ padding: 20 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#10B981" }}>{gig.deliveryDays}d</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Delivery Time</div>
                  </div>
                  <div className="card text-center" style={{ padding: 20 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>{gig.revisions || 0}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Revisions</div>
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Tab */}
            {activeTab === "github" && (
              <div className="card" style={{ padding: 24 }}>
                {gig.githubRepo ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <span style={{ fontSize: 32 }}>🐙</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{gig.githubRepo.fullName}</div>
                        <a href={`https://github.com/${gig.githubRepo.fullName}`} target="_blank" rel="noreferrer" style={{ color: "#4F46E5", fontSize: 13 }}>View on GitHub ↗</a>
                      </div>
                      <span className="badge badge-success" style={{ marginLeft: "auto" }}>✓ Verified</span>
                    </div>
                    {gig.githubRepo.description && <p style={{ color: "#374151", marginBottom: 16 }}>{gig.githubRepo.description}</p>}
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                      {gig.githubRepo.language && <span style={{ fontSize: 13, color: "#6B7280" }}>🔵 {gig.githubRepo.language}</span>}
                      {gig.githubRepo.stars != null && <span style={{ fontSize: 13, color: "#6B7280" }}>⭐ {gig.githubRepo.stars} stars</span>}
                      {gig.githubRepo.forks != null && <span style={{ fontSize: 13, color: "#6B7280" }}>🍴 {gig.githubRepo.forks} forks</span>}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🐙</div>
                    <p>No GitHub repository linked for this gig.</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                {reviews.length === 0 ? (
                  <div className="card text-center" style={{ padding: 40, color: "#9CA3AF" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                    <p>No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  reviews.map(r => (
                    <div key={r._id} className="card mb-3" style={{ padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <Avatar name={r.buyer?.name} src={r.buyer?.profilePicture} size={36} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.buyer?.name}</div>
                          <div style={{ fontSize: 12, color: "#9CA3AF" }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ marginLeft: "auto", color: "#F59E0B", fontWeight: 700 }}>{"★".repeat(r.rating?.overall || r.overall || 5)}</div>
                      </div>
                      <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>

                      {/* Existing reply */}
                      {r.freelancerReply && !replyOpen[r._id] && (
                        <div style={{ background: "#F3F4F6", borderRadius: 8, padding: 12, marginTop: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Freelancer Reply:</div>
                          <p style={{ color: "#374151", fontSize: 13, margin: 0 }}>{r.freelancerReply}</p>
                          {isGigOwner && (
                            <button onClick={() => { setReplyOpen(p => ({ ...p, [r._id]: true })); setReplyInputs(p => ({ ...p, [r._id]: r.freelancerReply })); }}
                              style={{ marginTop: 6, background: "none", border: "none", color: "#4F46E5", fontSize: 12, cursor: "pointer", padding: 0 }}>
                              Edit Reply
                            </button>
                          )}
                        </div>
                      )}

                      {/* Reply input — shown to gig owner when no reply yet or editing */}
                      {isGigOwner && !r.freelancerReply && !replyOpen[r._id] && (
                        <button onClick={() => setReplyOpen(p => ({ ...p, [r._id]: true }))}
                          style={{ marginTop: 10, background: "none", border: "1px solid #D1D5DB", borderRadius: 6, padding: "5px 12px", fontSize: 13, color: "#4F46E5", cursor: "pointer" }}>
                          Reply
                        </button>
                      )}

                      {isGigOwner && replyOpen[r._id] && (
                        <div style={{ marginTop: 12, background: "#F9FAFB", borderRadius: 8, padding: 12 }}>
                          <textarea
                            className="form-control"
                            rows={3}
                            placeholder="Write your reply..."
                            value={replyInputs[r._id] || ""}
                            onChange={e => setReplyInputs(p => ({ ...p, [r._id]: e.target.value }))}
                            style={{ fontSize: 13, resize: "vertical", marginBottom: 8 }}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-primary" style={{ fontSize: 13, padding: "5px 14px" }}
                              onClick={() => submitReply(r._id)} disabled={replyLoading[r._id]}>
                              {replyLoading[r._id] ? "Saving..." : "Save Reply"}
                            </button>
                            <button onClick={() => setReplyOpen(p => ({ ...p, [r._id]: false }))}
                              style={{ background: "none", border: "1px solid #D1D5DB", borderRadius: 6, padding: "5px 12px", fontSize: 13, cursor: "pointer" }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Order Panel */}
          <div style={{ position: "sticky", top: 80, alignSelf: "start" }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>from ${gig.price}</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>Delivery in {gig.deliveryDays} days</div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>REQUIREMENTS <span style={{ color: "#EF4444" }}>*</span></label>
                <textarea className="form-control" rows={4} placeholder="Describe what you need..."
                  value={orderMsg} onChange={e => setOrderMsg(e.target.value)}
                  style={{ resize: "vertical", borderColor: orderMsg.trim() ? undefined : "#E5E7EB" }} />
              </div>

              {user && isBuyer ? (
                <button className="btn btn-primary btn-block" onClick={handleOrder} disabled={ordering} style={{ width: "100%", padding: "12px 0", fontSize: 16, fontWeight: 700 }}>
                  {ordering ? "Placing Order..." : "Order Now →"}
                </button>
              ) : user ? (
                <div className="alert alert-warning" style={{ fontSize: 13 }}>Only buyers can place orders.</div>
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ width: "100%", display: "block", textAlign: "center", padding: "12px 0", fontSize: 16, fontWeight: 700 }}>Login to Order</Link>
              )}

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280" }}>
                  <span>Category</span><span className="badge badge-primary">{gig.category}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280" }}>
                  <span>Revisions</span><span style={{ fontWeight: 600, color: "#374151" }}>{gig.revisions || 0}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280" }}>
                  <span>Delivery</span><span style={{ fontWeight: 600, color: "#374151" }}>{gig.deliveryDays} days</span>
                </div>
              </div>
            </div>

            {/* Freelancer Mini Profile */}
            <div className="card mt-3" style={{ padding: 20, textAlign: "center" }}>
              <Avatar name={gig.freelancer?.name} src={gig.freelancer?.profilePicture} size={60} style={{ margin: "0 auto 12px" }} />
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{gig.freelancer?.name}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>{gig.freelancer?.university}</div>
              <Link to={`/freelancers/${gig.freelancer?._id}`} className="btn btn-secondary btn-sm" style={{ width: "100%" }}>View Profile</Link>
            </div>

            {/* Freelancer Availability Timetable */}
            {gig.freelancer?.availability?.length > 0 && (() => {
              const DAY_COLORS = { Monday:"#4F46E5", Tuesday:"#7C3AED", Wednesday:"#0EA5E9", Thursday:"#059669", Friday:"#D97706", Saturday:"#EF4444", Sunday:"#EC4899" };
              return (
                <div className="card mt-3" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, background: "#4F46E5", borderRadius: 2 }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Availability</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {gig.freelancer.availability.map((slot, i) => {
                      const c = DAY_COLORS[slot.day] || "#4F46E5";
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: c + "10", borderLeft: `3px solid ${c}` }}>
                          <span style={{ fontWeight: 700, fontSize: 12, color: c, width: 72, flexShrink: 0 }}>{slot.day}</span>
                          <span style={{ fontSize: 12, color: "#374151" }}>{slot.startTime} – {slot.endTime}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetailPage;
