// Member 4 - ProfilePage (Profile completion, skills, availability, analytics, portfolio export)
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../api/axios";
import MapPicker from "../../components/common/MapPicker";

const PROFICIENCY = ["Beginner", "Intermediate", "Expert"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const ProfilePage = () => {
  const { user, updateUser, isFreelancer } = useAuth();
  const [tab, setTab]         = useState("profile");
  const [form, setForm]       = useState({ name: user?.name||"", bio: user?.bio||"", phone: user?.phone||"", location: user?.location||"", portfolioTheme: user?.portfolioTheme||"Light" });
  const [skill, setSkill]     = useState({ name: "", proficiency: "Beginner" });
  const [avail, setAvail]     = useState({ day: "Monday", startTime: "09:00", endTime: "17:00" });
  const [analytics, setAnalytics] = useState(null);
  const [badges, setBadges]       = useState([]);
  const [msg, setMsg]         = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [showMap, setShowMap]       = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [picPreview, setPicPreview] = useState(user?.profilePicture || null);

  const validatePhone = (val) => {
    if (!val) return "";
    if (!/^\d+$/.test(val)) return "Only numbers are allowed.";
    if (val.length !== 10) return "Phone number must be exactly 10 digits.";
    if (!/^0(7[0-9]|1[1-9]|2[1-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|8[1-9]|9[1-9])/.test(val)) return "Enter a valid Sri Lankan phone number (e.g. 0771234567).";
    return "";
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm({ ...form, phone: val });
    setPhoneError(validatePhone(val));
  };

  const completion = user ? Math.round(
    Object.values(user.profileCompletionSteps || {}).filter(Boolean).length /
    Math.max(Object.keys(user.profileCompletionSteps || {}).length, 1) * 100
  ) : 0;

  // Sync avatar preview when user context changes
  useEffect(() => {
    if (user?.profilePicture) setPicPreview(user.profilePicture);
  }, [user?.profilePicture]);

  useEffect(() => {
    if (user?._id) {
      userAPI.getPublicProfile(user._id)
        .then(r => setBadges(r.data.badges || []))
        .catch(() => {});
    }
  }, [user?._id]);

  useEffect(() => {
    if (isFreelancer && tab === "analytics") {
      userAPI.getAnalytics().then(r => setAnalytics(r.data.analytics)).catch(() => {});
    }
  }, [tab]);

  // Member 4 - updateUserProfile
  const saveProfile = async (e) => {
    e.preventDefault();
    const pErr = validatePhone(form.phone);
    if (pErr) { setPhoneError(pErr); return; }
    setLoading(true); setMsg("");
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      setMsg("Profile updated successfully!");
    } catch { setMsg("Failed to save profile."); }
    finally { setLoading(false); setTimeout(() => setMsg(""), 3000); }
  };

  // Member 4 - addSkill
  const addSkill = async () => {
    if (!skill.name) return;
    try {
      const { data } = await userAPI.addSkill(skill);
      updateUser({ skills: data.skills });
      setSkill({ name: "", proficiency: "Beginner" });
    } catch {}
  };

  // Member 4 - removeSkill
  const removeSkill = async (id) => {
    try {
      const { data } = await userAPI.removeSkill(id);
      updateUser({ skills: data.skills });
    } catch {}
  };

  // Member 4 - addAvailabilitySlot
  const addAvailability = async () => {
    const current = user?.availability || [];
    const updated = [...current, avail];
    try {
      const { data } = await userAPI.updateAvailability({ availability: updated });
      updateUser({ availability: data.availability });
    } catch {}
  };

  // Member 4 - exportPortfolioPDF
  const exportPDF = async () => {
    try {
      const res = await userAPI.exportPortfolio();
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = "UniLance_Portfolio.pdf"; a.click();
    } catch { alert("Export failed."); }
  };

  // Member 4 - uploadProfilePicture
  const uploadPicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMsg("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setMsg("Image must be under 5MB."); return; }

    // Show instant local preview immediately
    const blobUrl = URL.createObjectURL(file);
    setPicPreview(blobUrl);
    setPicLoading(true);

    try {
      const formData = new FormData();
      formData.append("picture", file);
      const { data } = await userAPI.updatePicture(formData);
      // Backend may return { profilePicture } or { user: { profilePicture } }
      const serverPic = data.profilePicture || data.user?.profilePicture;
      if (serverPic) {
        updateUser({ profilePicture: serverPic });
        setPicPreview(serverPic);
      }
      setMsg("Profile picture updated successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      // Revert on failure
      URL.revokeObjectURL(blobUrl);
      setPicPreview(user?.profilePicture || null);
      setMsg("Failed to upload picture. Please try again.");
      setTimeout(() => setMsg(""), 4000);
    } finally {
      setPicLoading(false);
      e.target.value = ""; // reset file input so same file can be re-selected
    }
  };

  const tabs = ["profile", "skills", "availability", isFreelancer && "analytics"].filter(Boolean);

  return (
    <div className="page">
      <div className="container">
        <div className="profile-layout">

          {/* Sidebar */}
          <div>
            <div className="card mb-2">
              <div className="card-body text-center">
                {/* Clickable avatar upload */}
                <label style={{ display: "block", cursor: "pointer", margin: "0 auto 12px", width: 88, height: 88, position: "relative" }} title="Click to change photo">
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={uploadPicture} disabled={picLoading} />

                  {/* Avatar circle */}
                  <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#4F46E5", color: "#fff", fontSize: 32, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "3px solid #fff", boxShadow: "0 4px 16px rgba(79,70,229,0.25)" }}>
                    {picLoading ? (
                      <div style={{ width: 28, height: 28, border: "3px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    ) : picPreview ? (
                      <img src={picPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      user?.name?.charAt(0)
                    )}
                  </div>

                  {/* Camera overlay on hover */}
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0, transition: "opacity 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <span style={{ fontSize: 22 }}>📷</span>
                  </div>
                </label>

                <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8 }}>Click photo to change</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
                <div className="badge badge-primary mt-1">{user?.role}</div>
                {isFreelancer && <div style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>{user?.university}</div>}

                {/* Member 4 - Profile Completion Indicator */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: "#6B7280" }}>Profile Complete</span>
                    <span style={{ fontWeight: 700, color: "#4F46E5" }}>{completion}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${completion}%` }} />
                  </div>
                </div>

                {isFreelancer && (
                  <button onClick={exportPDF} className="btn btn-secondary btn-sm mt-2" style={{ width: "100%" }}>
                    📄 Export Portfolio PDF
                  </button>
                )}
                {isFreelancer && user?.portfolioSlug && (
                  <a href={`/portfolio/${user.portfolioSlug}`} target="_blank" rel="noreferrer"
                    className="btn btn-outline btn-sm mt-1" style={{ width: "100%" }}>
                    🔗 View Public Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Badges */}
            {isFreelancer && (() => {
              const MILESTONES = [
                { count: 1,   title: "First Order",       icon: "🎉" },
                { count: 5,   title: "Rising Star",       icon: "⭐" },
                { count: 10,  title: "Skilled Pro",       icon: "🏆" },
                { count: 25,  title: "Expert Freelancer", icon: "🥇" },
                { count: 50,  title: "Elite Talent",      icon: "💎" },
                { count: 100, title: "UniLance Legend",   icon: "🌟" },
              ];
              const earned = badges.filter(b => b.type === "milestone");
              const earnedCounts = new Set(earned.map(b => b.triggerValue));
              const completed = user?.totalOrdersCompleted || 0;
              const next = MILESTONES.find(m => !earnedCounts.has(m.count) && m.count > completed);
              const skillBadges = badges.filter(b => b.type === "skill_verified");

              return (
                <div className="card mb-2">
                  <div className="card-body">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 4, height: 18, background: "#F59E0B", borderRadius: 2 }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Badges</span>
                      {badges.length > 0 && (
                        <span style={{ marginLeft: "auto", background: "#FEF3C7", color: "#92400E", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
                          {badges.length}
                        </span>
                      )}
                    </div>

                    {/* Earned milestone badges */}
                    {earned.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                        {earned.map(b => {
                          const m = MILESTONES.find(x => x.count === b.triggerValue);
                          return (
                            <div key={b._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                              <span style={{ fontSize: 20 }}>{m?.icon || "🏅"}</span>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E" }}>{b.title}</div>
                                <div style={{ fontSize: 11, color: "#B45309" }}>{b.triggerValue} orders completed</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Skill verified badges */}
                    {skillBadges.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                        {skillBadges.map(b => (
                          <div key={b._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #86EFAC" }}>
                            <span style={{ fontSize: 20 }}>🏅</span>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: "#065F46" }}>{b.title}</div>
                              <div style={{ fontSize: 11, color: "#059669" }}>Skill Verified</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Next milestone progress */}
                    {next && (
                      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "10px 12px", border: "1px dashed #E5E7EB" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 16, filter: "grayscale(1)", opacity: 0.5 }}>{next.icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{next.title}</span>
                          </div>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{completed}/{next.count}</span>
                        </div>
                        <div style={{ height: 6, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, (completed / next.count) * 100)}%`, background: "linear-gradient(90deg,#F59E0B,#EF4444)", borderRadius: 4, transition: "width 0.4s" }} />
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                          {next.count - completed} more order{next.count - completed !== 1 ? "s" : ""} to unlock
                        </div>
                      </div>
                    )}

                    {badges.length === 0 && !next && (
                      <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: 12, padding: "8px 0" }}>No badges yet. Complete orders to earn them!</div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Nav tabs */}
            <div className="card">
              <div className="card-body" style={{ padding: "8px" }}>
                {tabs.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ display: "block", width: "100%", padding: "10px 16px", borderRadius: 8, border: "none", textAlign: "left", cursor: "pointer", fontWeight: 600, fontSize: 14, background: tab === t ? "#EEF2FF" : "none", color: tab === t ? "#4F46E5" : "#374151", textTransform: "capitalize", marginBottom: 2 }}>
                    {{ profile: "👤", skills: "🛠️", availability: "📅", analytics: "📊" }[t]} {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {msg && <div className={`alert ${msg.includes("success") ? "alert-success" : "alert-error"}`}>{msg}</div>}

            {/* Profile Tab */}
            {tab === "profile" && (
              <div className="card">
                <div className="card-header"><h3 style={{ fontWeight: 700 }}>Edit Profile</h3></div>
                <div className="card-body">
                  <form onSubmit={saveProfile}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          className="form-control"
                          value={form.phone}
                          onChange={handlePhoneChange}
                          placeholder="0771234567"
                          maxLength={10}
                          inputMode="numeric"
                          style={{ borderColor: phoneError ? "#EF4444" : undefined }}
                        />
                        {phoneError && <small style={{ color: "#EF4444" }}>{phoneError}</small>}
                        {!phoneError && <small style={{ color: "#9CA3AF" }}>Sri Lankan number · 10 digits (e.g. 0771234567)</small>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          className="form-control"
                          value={form.location}
                          onChange={e => setForm({ ...form, location: e.target.value })}
                          placeholder="Colombo, Sri Lanka"
                          style={{ flex: 1 }}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={() => setShowMap(true)}
                          style={{
                            flexShrink: 0, background: "#EEF2FF", border: "1.5px solid #C7D2FE",
                            borderRadius: 8, padding: "0 14px", cursor: "pointer",
                            fontSize: 13, color: "#4F46E5", display: "flex", alignItems: "center", gap: 6,
                            fontWeight: 600, whiteSpace: "nowrap",
                          }}
                          title="Pick on map"
                        >
                          📍 Pick on Map
                        </button>
                      </div>
                      {form.location && (
                        <small style={{ color: "#9CA3AF", marginTop: 4, display: "block" }}>
                          📍 {form.location}
                        </small>
                      )}
                    </div>

                    {/* Map picker modal */}
                    {showMap && (
                      <MapPicker
                        value={form.location}
                        onChange={loc => setForm({ ...form, location: loc })}
                        onClose={() => setShowMap(false)}
                      />
                    )}
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea className="form-control" rows={4} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Tell clients about yourself..." maxLength={500} />
                      <small style={{ color: "#9CA3AF" }}>{form.bio.length}/500</small>
                    </div>
                    {isFreelancer && (
                      <div className="form-group">
                        <label>Portfolio Theme</label>
                        <select className="form-control" value={form.portfolioTheme} onChange={e=>setForm({...form,portfolioTheme:e.target.value})}>
                          <option value="Light">☀️ Light Theme</option>
                          <option value="Dark">🌙 Dark Theme</option>
                        </select>
                      </div>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {tab === "skills" && (
              <div className="card">
                <div className="card-header"><h3 style={{ fontWeight: 700 }}>Skills Management</h3></div>
                <div className="card-body">
                  <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                    <input className="form-control" style={{ flex: 1, minWidth: 180 }} placeholder="Skill name (e.g. React.js)"
                      value={skill.name} onChange={e=>setSkill({...skill,name:e.target.value})} />
                    <select className="form-control" style={{ width: 160 }} value={skill.proficiency} onChange={e=>setSkill({...skill,proficiency:e.target.value})}>
                      {PROFICIENCY.map(p => <option key={p}>{p}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={addSkill}>+ Add Skill</button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {(user?.skills || []).map(s => (
                      <div key={s._id} style={{ display: "flex", alignItems: "center", gap: 8, background: s.verified ? "#D1FAE5" : "#F3F4F6", border: `1.5px solid ${s.verified ? "#10B981" : "#E5E7EB"}`, borderRadius: 10, padding: "8px 14px" }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                        <span className={`badge ${s.proficiency === "Expert" ? "badge-primary" : s.proficiency === "Intermediate" ? "badge-warning" : "badge-gray"}`}>{s.proficiency}</span>
                        {s.verified && <span style={{ color: "#10B981", fontSize: 13 }}>✅ {s.verifiedBadgeTitle}</span>}
                        <button onClick={() => removeSkill(s._id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
                      </div>
                    ))}
                    {(user?.skills || []).length === 0 && <p style={{ color: "#9CA3AF" }}>No skills added yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Availability Tab */}
            {tab === "availability" && (
              <div className="card">
                <div className="card-header"><h3 style={{ fontWeight: 700 }}>Availability Schedule</h3></div>
                <div className="card-body">
                  <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Day</label>
                      <select className="form-control" value={avail.day} onChange={e=>setAvail({...avail,day:e.target.value})}>
                        {DAYS.map(d=><option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>From</label>
                      <input type="time" className="form-control" value={avail.startTime} onChange={e=>setAvail({...avail,startTime:e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>To</label>
                      <input type="time" className="form-control" value={avail.endTime} onChange={e=>setAvail({...avail,endTime:e.target.value})} />
                    </div>
                    <button className="btn btn-primary" onClick={addAvailability}>+ Add Slot</button>
                  </div>

                  {(user?.availability || []).map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#F9FAFB", borderRadius: 10, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: "#4F46E5", width: 100 }}>{s.day}</span>
                      <span style={{ color: "#374151" }}>{s.startTime} – {s.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab (Member 4 - Freelancer Analytics Dashboard) */}
            {tab === "analytics" && analytics && (
              <div>
                <div className="grid-4 mb-2">
                  {[
                    { label: "Profile Views", value: analytics.profileViews, icon: "👁️" },
                    { label: "Orders Completed", value: analytics.totalOrdersCompleted, icon: "✅" },
                    { label: "Wallet Balance", value: `$${analytics.walletBalance?.toFixed(2)}`, icon: "💰" },
                    { label: "Verified Skills", value: analytics.verifiedSkills, icon: "🏅" },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <div className="stat-icon">{s.icon}</div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid-2">
                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-value">{analytics.totalGigs}</div>
                    <div className="stat-label">Total Gigs ({analytics.activeGigs} active)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-value">{analytics.averageRating || "—"}</div>
                    <div className="stat-label">Average Rating</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
