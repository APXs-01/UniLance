// Member 3 - FreelancerGigsPage (My Gigs Dashboard - Create, Edit, Delete, Toggle Active)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gigAPI } from "../../api/axios";

const FreelancerGigsPage = () => {
  const [gigs, setGigs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});

  const reload = () =>
    gigAPI.getMy()
      .then(({ data }) => setGigs(data.gigs || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  // Member 3 - deleteGig
  const deleteGig = async (id) => {
    if (!window.confirm("Delete this gig? This cannot be undone.")) return;
    setDeleting(d => ({ ...d, [id]: true }));
    try {
      await gigAPI.delete(id);
      setGigs(g => g.filter(x => x._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
    setDeleting(d => ({ ...d, [id]: false }));
  };

  if (loading) return <div className="flex-center" style={{ height: "60vh" }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>My Gigs</h1>
            <p style={{ color: "#6B7280", marginTop: 4 }}>{gigs.length} gigs published</p>
          </div>
          <Link to="/dashboard/gigs/new" className="btn btn-primary">+ Create New Gig</Link>
        </div>

        {gigs.length === 0 ? (
          <div className="card text-center" style={{ padding: 60 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📦</div>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No gigs yet</div>
            <p style={{ color: "#6B7280", marginBottom: 24 }}>Create your first gig to start receiving orders</p>
            <Link to="/dashboard/gigs/new" className="btn btn-primary">Create Your First Gig</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {gigs.map(gig => (
              <div key={gig._id} className="card" style={{ display: "flex", gap: 20, padding: 20, alignItems: "center" }}>
                {/* Thumbnail */}
                <div style={{ width: 80, height: 80, borderRadius: 12, flexShrink: 0, background: gig.coverImage ? `url(${gig.coverImage}) center/cover` : "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                  {!gig.coverImage && "💼"}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gig.title}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
                    <span className="badge badge-primary" style={{ fontSize: 11 }}>{gig.category}</span>
                    <span style={{ margin: "0 10px" }}>·</span>
                    <span>from <strong>${gig.price}</strong></span>
                    <span style={{ margin: "0 10px" }}>·</span>
                    <span>{gig.deliveryDays}d delivery</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6B7280" }}>
                    <span>⭐ {gig.averageRating?.toFixed(1) || "New"} ({gig.totalReviews || 0} reviews)</span>
                    <span>📋 {gig.totalOrders || 0} orders</span>
                    {gig.githubRepoUrl && <span style={{ color: "#4F46E5" }}>🐙 GitHub linked</span>}
                  </div>
                </div>

                {/* Status */}
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <span className={`badge ${gig.isActive !== false ? "badge-success" : "badge-gray"}`}>
                    {gig.isActive !== false ? "Active" : "Paused"}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <Link to={`/gigs/${gig._id}`} className="btn btn-sm btn-secondary" title="Preview">👁</Link>
                  <Link to={`/dashboard/gigs/${gig._id}/edit`} className="btn btn-sm btn-secondary" title="Edit">✏️</Link>
                  <button className="btn btn-sm btn-secondary" style={{ color: "#DC2626" }}
                    onClick={() => deleteGig(gig._id)} disabled={deleting[gig._id]} title="Delete">
                    {deleting[gig._id] ? "..." : "🗑"}
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

export default FreelancerGigsPage;
