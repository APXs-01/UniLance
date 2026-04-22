// Member 3 - GroupsPage (Study Groups — Browse, Create, Join, Manage)
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { groupAPI } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/common/Avatar";

const CATEGORIES = [
  "All",
  "Graphic Design",
  "Full Stack Web Development",
  "Cyber Security",
  "Data Science",
  "Business Analysis",
];

const CATEGORY_COLORS = {
  "Graphic Design":             "#DB2777",
  "Full Stack Web Development": "#4F46E5",
  "Cyber Security":             "#DC2626",
  "Data Science":               "#059669",
  "Business Analysis":          "#D97706",
};

// ─── Manage Requests Modal ────────────────────────────────────────────────────
const ManageRequestsModal = ({ group, onClose, onAction }) => {
  const pending = (group.joinRequests || []).filter((r) => r.status === "pending");

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Join Requests — {group.name}</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#6B7280" }}>
            No pending join requests.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {pending.map((req) => (
              <div key={req._id} style={styles.requestCard}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <Avatar
                    name={req.user?.name || "?"}
                    src={req.user?.profilePicture}
                    size={44}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
                      {req.user?.name || "Unknown"}
                    </div>
                    {req.user?.university && (
                      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                        {req.user.university}
                      </div>
                    )}
                    {req.user?.skills?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                        {req.user.skills.slice(0, 4).map((s, i) => (
                          <span key={i} className="badge badge-gray" style={{ fontSize: 11 }}>
                            {typeof s === "object" ? s.name : s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/freelancers/${req.user?._id}`}
                    className="btn btn-sm btn-secondary"
                    style={{ flexShrink: 0, fontSize: 12 }}
                    onClick={onClose}
                  >
                    View Profile
                  </Link>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => onAction(group._id, req._id, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ flex: 1, color: "#EF4444", borderColor: "#EF4444" }}
                    onClick={() => onAction(group._id, req._id, "reject")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Create Group Modal ───────────────────────────────────────────────────────
const CreateGroupModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: "", category: "Full Stack Web Development", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Group name is required."); return; }
    setLoading(true);
    setError("");
    try {
      const { data } = await groupAPI.create(form);
      onCreate(data.group);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create Study Group</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#DC2626", fontSize: 14, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Group Name *</label>
            <input
              className="form-control"
              placeholder="e.g. React Learners Cohort"
              maxLength={60}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-control"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              placeholder="What will this group study or work on?"
              maxLength={300}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ resize: "vertical" }}
            />
            <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "right", marginTop: 4 }}>
              {form.description.length}/300
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Group Card ───────────────────────────────────────────────────────────────
const GroupCard = ({ group, currentUser, onRequestJoin, onLeave, onManage, actionLoading }) => {
  const userId = currentUser?._id;

  const isCreator  = userId && group.creator?._id === userId;
  const isMember   = userId && group.members?.some((m) => (m._id || m) === userId);
  const hasPending = userId && group.joinRequests?.some(
    (r) => (r.user?._id || r.user) === userId && r.status === "pending"
  );
  const isFull     = group.members?.length >= group.maxMembers;

  const categoryColor = CATEGORY_COLORS[group.category] || "#4F46E5";
  const pendingCount  = group.joinRequests?.filter((r) => r.status === "pending").length || 0;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      {/* Card top accent */}
      <div style={{ height: 4, background: categoryColor, borderRadius: "8px 8px 0 0" }} />

      <div className="card-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <span
            className="badge"
            style={{ background: categoryColor + "18", color: categoryColor, fontSize: 11, fontWeight: 600 }}
          >
            {group.category}
          </span>
          <span style={{ fontSize: 13, color: isFull ? "#EF4444" : "#6B7280", fontWeight: 600 }}>
            {group.members?.length || 0}/{group.maxMembers} members
          </span>
        </div>

        {/* Group name */}
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 8, lineHeight: 1.3 }}>
          {group.name}
        </h3>

        {/* Description */}
        <p style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.6, marginBottom: 14, flex: 1 }}>
          {group.description || "No description provided."}
        </p>

        {/* Creator row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Avatar name={group.creator?.name || "?"} src={group.creator?.profilePicture} size={26} />
          <span style={{ fontSize: 13, color: "#6B7280" }}>
            Created by <span style={{ color: "#111827", fontWeight: 600 }}>{group.creator?.name || "Unknown"}</span>
          </span>
          {isCreator && <span className="badge badge-primary" style={{ fontSize: 10, marginLeft: "auto" }}>You</span>}
        </div>

        {/* Member avatars */}
        {group.members?.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
            <div style={{ display: "flex" }}>
              {group.members.slice(0, 5).map((m, i) => (
                <div key={m._id || i} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }}>
                  <Avatar name={m.name || "?"} src={m.profilePicture} size={28} style={{ border: "2px solid #fff" }} />
                </div>
              ))}
            </div>
            {group.members.length > 5 && (
              <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 6 }}>+{group.members.length - 5} more</span>
            )}
          </div>
        )}

        {/* Action button */}
        <div style={{ marginTop: "auto" }}>
          {!currentUser ? (
            <Link to="/login" className="btn btn-primary btn-sm" style={{ display: "block", textAlign: "center" }}>
              Log in to Join
            </Link>
          ) : isCreator ? (
            <button
              className="btn btn-primary btn-sm"
              style={{ width: "100%", position: "relative" }}
              onClick={() => onManage(group)}
            >
              Manage Requests
              {pendingCount > 0 && (
                <span style={{
                  background: "#EF4444", color: "#fff", borderRadius: "50%",
                  width: 18, height: 18, fontSize: 11, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  marginLeft: 8,
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ) : isMember ? (
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: "100%", color: "#EF4444", borderColor: "#EF4444" }}
              onClick={() => onLeave(group._id)}
              disabled={actionLoading === group._id}
            >
              {actionLoading === group._id ? "Leaving..." : "Leave Group"}
            </button>
          ) : hasPending ? (
            <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} disabled>
              Request Pending
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              style={{ width: "100%" }}
              onClick={() => onRequestJoin(group._id)}
              disabled={actionLoading === group._id || isFull}
            >
              {actionLoading === group._id ? "Sending..." : isFull ? "Group Full" : "Request to Join"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const GroupsPage = () => {
  const { user, isFreelancer } = useAuth();
  const [groups, setGroups]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCreate, setShowCreate]   = useState(false);
  const [manageGroup, setManageGroup] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab]                 = useState("all"); // "all" | "mine"

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeCategory !== "All" ? { category: activeCategory } : {};
      const { data } = await groupAPI.getAll(params);
      setGroups(data.groups || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleRequestJoin = async (groupId) => {
    if (!user) { window.location.href = "/login"; return; }
    setActionLoading(groupId);
    try {
      await groupAPI.requestJoin(groupId);
      await fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (groupId) => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    setActionLoading(groupId);
    try {
      await groupAPI.leave(groupId);
      await fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave group.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageAction = async (groupId, requestId, action) => {
    try {
      const { data } = await groupAPI.handleRequest(groupId, requestId, action);
      // Refresh the manage modal group data
      setManageGroup(data.group);
      // Also update main list
      setGroups((prev) => prev.map((g) => g._id === groupId ? data.group : g));
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
  };

  const displayedGroups = groups.filter((g) => {
    if (tab === "mine" && user) {
      return g.members?.some((m) => (m._id || m) === user._id);
    }
    return true;
  });

  return (
    <div className="page">
      <div className="container">
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, marginBottom: 8 }}>Study Groups</h1>
            <p style={{ color: "#6B7280", fontSize: 15, maxWidth: 480 }}>
              Join or create study groups to collaborate with peers in your field. Max 5 members per group.
            </p>
          </div>
          {isFreelancer && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ alignSelf: "flex-start" }}>
              + Create Group
            </button>
          )}
        </div>

        {/* ── Category Filter Tabs ── */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, overflowX: "auto", borderBottom: "2px solid #E5E7EB", paddingBottom: 0 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setTab("all"); }}
              style={{
                background: "none", border: "none",
                padding: "8px 16px",
                fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                color: activeCategory === cat ? "#4F46E5" : "#6B7280",
                borderBottom: activeCategory === cat ? "2px solid #4F46E5" : "2px solid transparent",
                marginBottom: -2, transition: "color 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── My Groups Tab (only when logged in) ── */}
        {user && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["all", "mine"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={t === tab ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
              >
                {t === "all" ? "All Groups" : "My Groups"}
              </button>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="flex-center" style={{ height: "40vh" }}>
            <div className="spinner" />
          </div>
        ) : displayedGroups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#6B7280" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 8 }}>
              {tab === "mine" ? "You haven't joined any groups yet" : "No groups found"}
            </div>
            <p style={{ marginBottom: 24 }}>
              {tab === "mine"
                ? "Browse all groups and request to join one."
                : activeCategory !== "All"
                  ? `No study groups in ${activeCategory} yet.`
                  : "Be the first to create a study group!"}
            </p>
            {isFreelancer && tab !== "mine" && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                Create the First Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid-3">
            {displayedGroups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                currentUser={user}
                onRequestJoin={handleRequestJoin}
                onLeave={handleLeave}
                onManage={(g) => setManageGroup(g)}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreate={handleGroupCreated}
        />
      )}
      {manageGroup && (
        <ManageRequestsModal
          group={manageGroup}
          onClose={() => setManageGroup(null)}
          onAction={handleManageAction}
        />
      )}
    </div>
  );
};

// ─── Inline Styles ────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 16,
    padding: 32, width: "100%",
    maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20, fontWeight: 800, color: "#111827",
  },
  closeBtn: {
    background: "none", border: "none", fontSize: 18,
    cursor: "pointer", color: "#6B7280", lineHeight: 1,
    padding: 4,
  },
  requestCard: {
    background: "#F9FAFB", borderRadius: 10,
    padding: 16, border: "1px solid #E5E7EB",
  },
};

export default GroupsPage;
