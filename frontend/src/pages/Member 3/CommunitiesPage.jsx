// Member 3 - CommunitiesPage (Browse & Join Communities)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { communityAPI } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const COMMUNITY_IMAGES = {
  "Graphic Design":             "/Community/Graphic Design.png",
  "Full Stack Web Development": "/Community/Full Stack Web Development.png",
  "Cyber Security":             "/Community/Cyber Security.png",
  "Data Science":               "/Community/Data Science.png",
  "Business Analysis":          "/Community/Business Analysis.jpg",
};

const CommunitiesPage = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [joining, setJoining]         = useState({});
  const [tab, setTab]                 = useState("all"); // "all" | "mine"

  useEffect(() => {
    communityAPI.getAll()
      .then(({ data }) => setCommunities(data.communities || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Member 3 - joinCommunity / leaveCommunity
  const toggleMembership = async (community) => {
    if (!user) { window.location.href = "/login"; return; }
    const isMember = community.members?.some(m => m.user === user._id || m.user?._id === user._id);
    setJoining(j => ({ ...j, [community._id]: true }));
    try {
      if (isMember) {
        await communityAPI.leave(community._id);
      } else {
        await communityAPI.join(community._id);
      }
      const { data } = await communityAPI.getAll();
      setCommunities(data.communities || []);
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setJoining(j => ({ ...j, [community._id]: false }));
    }
  };

  if (loading) return <div className="flex-center" style={{ height: "60vh" }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Student Communities</h1>
          <p style={{ color: "#6B7280", fontSize: 18, maxWidth: 560, margin: "0 auto" }}>
            Connect with fellow students, share knowledge, collaborate, and grow together in your field of interest.
          </p>
        </div>

        {/* Stats Bar */}
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#4F46E5" }}>5</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>Active Communities</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#10B981" }}>
              {communities.reduce((sum, c) => sum + (c.memberCount || c.members?.length || 0), 0)}
            </div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>Total Members</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#F59E0B" }}>
              {communities.reduce((sum, c) => sum + (c.messageCount || 0), 0)}
            </div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>Messages Shared</div>
          </div>
        </div>

        {/* Tabs */}
        {user && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "2px solid #E5E7EB", paddingBottom: 0 }}>
            {["all", "mine"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "none", border: "none", padding: "8px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
                color: tab === t ? "#4F46E5" : "#6B7280",
                borderBottom: tab === t ? "2px solid #4F46E5" : "2px solid transparent",
                marginBottom: -2,
              }}>
                {t === "all" ? "All Communities" : "My Communities"}
              </button>
            ))}
          </div>
        )}

        {/* Community Cards */}
        <div className="grid-2">
          {communities.filter(community => {
            if (tab === "mine") return user && community.members?.some(m => m.user === user._id || m.user?._id === user._id);
            return true;
          }).map(community => {
            const isMember = user && community.members?.some(m =>
              m.user === user._id || m.user?._id === user._id
            );
            const memberCount = community.memberCount || community.members?.length || 0;
            const img = COMMUNITY_IMAGES[community.name];

            return (
              <div key={community._id} className="card" style={{ overflow: "hidden" }}>
                {/* Banner */}
                <div style={{ height: 160, overflow: "hidden" }}>
                  {img
                    ? <img src={img} alt={community.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }} />
                  }
                </div>

                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", flex: 1 }}>{community.name}</h2>
                    {isMember && <span className="badge badge-success" style={{ marginLeft: 8, flexShrink: 0 }}>Joined</span>}
                  </div>

                  <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{community.description}</p>

                  <div style={{ display: "flex", gap: 20, marginBottom: 20, fontSize: 13, color: "#6B7280" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><img src="/Community/Member.svg" alt="" style={{ width: 16, height: 16 }} />{memberCount} members</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><img src="/Community/Chat.svg" alt="" style={{ width: 16, height: 16 }} />Active chat</span>
                    {community.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="badge badge-gray" style={{ fontSize: 11 }}>#{tag}</span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      className={`btn btn-sm ${isMember ? "btn-secondary" : "btn-primary"}`}
                      onClick={() => toggleMembership(community)}
                      disabled={joining[community._id]}
                      style={{ flex: 1 }}
                    >
                      {joining[community._id] ? "..." : isMember ? "Leave Community" : "Join Community"}
                    </button>
                    {isMember && (
                      <Link to={`/communities/${community._id}`} className="btn btn-sm btn-secondary" style={{ flex: 1, textAlign: "center" }}>
                        Open Chat →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommunitiesPage;
