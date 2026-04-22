// Member 3 - GigsPage (Browse, Search, Filter Gigs)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gigAPI } from "../../api/axios";
import Avatar from "../../components/common/Avatar";

const CATEGORIES = ["All","Graphic Design","Full Stack Web Development","Cyber Security","Data Science","Business Analysis"];
const SORT_OPTIONS = [{ value:"newest",label:"Newest" },{ value:"top_rated",label:"Top Rated" },{ value:"popular",label:"Most Popular" },{ value:"price_low",label:"Price: Low to High" },{ value:"price_high",label:"Price: High to Low" }];

const GigsPage = () => {
  const [gigs, setGigs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters]   = useState({ search:"", category:"All", minPrice:"", maxPrice:"", sort:"newest", page:1 });

  useEffect(() => {
    fetchGigs();
  }, [filters]);

  // Member 3 - browseGigs
  const fetchGigs = async () => {
    setLoading(true);
    try {
      const params = { sort: filters.sort, page: filters.page, limit: 12 };
      if (filters.search)   params.search = filters.search;
      if (filters.category !== "All") params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      const { data } = await gigAPI.getAll(params);
      setGigs(data.gigs);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  };

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Browse Gigs</h1>

        {/* Filters */}
        <div className="card mb-3">
          <div className="card-body" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 2, minWidth: 200 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>SEARCH</label>
              <input className="form-control" placeholder="Search gigs..." value={filters.search}
                onChange={e => set("search", e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>CATEGORY</label>
              <select className="form-control" value={filters.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>MIN PRICE</label>
              <input className="form-control" type="number" placeholder="$0" value={filters.minPrice} onChange={e => set("minPrice", e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>MAX PRICE</label>
              <input className="form-control" type="number" placeholder="$999" value={filters.maxPrice} onChange={e => set("maxPrice", e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>SORT BY</label>
              <select className="form-control" value={filters.sort} onChange={e => set("sort", e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ color: "#6B7280", fontSize: 14, marginBottom: 20 }}>{pagination.total} gigs found</div>

        {/* Grid */}
        {loading ? (
          <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>
        ) : gigs.length === 0 ? (
          <div className="card text-center" style={{ padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>No gigs found</div>
            <p style={{ color: "#6B7280", marginTop: 8 }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid-3">
            {gigs.map(gig => <GigCard key={gig._id} gig={gig} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32 }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                className={`btn btn-sm ${p === filters.page ? "btn-primary" : "btn-secondary"}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Member 3 - GigCard component
const GigCard = ({ gig }) => (
  <Link to={`/gigs/${gig._id}`} className="card" style={{ display: "block", transition: "transform 0.2s", textDecoration: "none" }}
    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
    <div style={{ height: 160, overflow: "hidden", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {gig.coverImage
        ? <img src={gig.coverImage} alt={gig.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }} />
        : <span style={{ fontSize: 48 }}>{"🎨💻🔒📊📈"[["Graphic Design","Full Stack Web Development","Cyber Security","Data Science","Business Analysis"].indexOf(gig.category)] || "💼"}</span>
      }
    </div>
    <div className="card-body">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Avatar name={gig.freelancer?.name} src={gig.freelancer?.profilePicture} size={30} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{gig.freelancer?.name}</span>
        <span className="badge badge-gray" style={{ fontSize: 11 }}>{gig.freelancer?.university?.split(" ")[0]}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 8, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{gig.title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
        <span style={{ color: "#F59E0B" }}>★</span>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{gig.averageRating?.toFixed(1) || "New"}</span>
        <span style={{ color: "#9CA3AF", fontSize: 12 }}>({gig.totalReviews})</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#6B7280" }}>⏱ {gig.deliveryDays}d</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="badge badge-primary">{gig.category}</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#111827" }}>from ${gig.price}</span>
      </div>
    </div>
  </Link>
);

export default GigsPage;
