// Member 3 - CreateGigPage (Create / Edit Gig with GitHub Repo Verification)
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gigAPI } from "../../api/axios";

const CATEGORIES = ["Graphic Design","Full Stack Web Development","Cyber Security","Data Science","Business Analysis"];

const CreateGigPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // if editing
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "", description: "", category: CATEGORIES[0],
    price: "", deliveryDays: "", revisions: "1",
    githubRepoUrl: "", tags: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoVerifying, setRepoVerifying] = useState(false);
  const [repoStatus, setRepoStatus] = useState(null); // null | "valid" | "invalid"
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      gigAPI.getOne(id).then(({ data }) => {
        const g = data.gig;
        setForm({
          title: g.title, description: g.description, category: g.category,
          price: g.price, deliveryDays: g.deliveryDays, revisions: g.revisions || "1",
          githubRepoUrl: g.githubRepoUrl || "", tags: (g.tags || []).join(", "),
        });
      }).catch(() => {});
    }
  }, [id, isEdit]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Member 3 - verifyGitHubRepo
  const verifyRepo = async () => {
    if (!form.githubRepoUrl.trim()) return;
    setRepoVerifying(true);
    setRepoStatus(null);
    try {
      await gigAPI.verifyRepo({ url: form.githubRepoUrl });
      setRepoStatus("valid");
    } catch {
      setRepoStatus("invalid");
    } finally { setRepoVerifying(false); }
  };

  // Member 3 - createGig / updateGig
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description || !form.price || !form.deliveryDays) {
      setError("Please fill all required fields."); return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        deliveryDays: Number(form.deliveryDays),
        revisions: Number(form.revisions),
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await gigAPI.update(id, payload);
      } else {
        await gigAPI.create(payload);
      }
      navigate("/dashboard/gigs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save gig");
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          {isEdit ? "Edit Gig" : "Create a New Gig"}
        </h1>
        <p style={{ color: "#6B7280", marginBottom: 32 }}>
          {isEdit ? "Update your gig details below." : "Showcase your skills and attract buyers from across Sri Lanka."}
        </p>

        {error && <div className="alert alert-error mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="card mb-3">
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Basic Information</h3>

              <div className="form-group">
                <label className="form-label">Gig Title *</label>
                <input className="form-control" placeholder="e.g. I will design a professional logo for your brand" maxLength={100}
                  value={form.title} onChange={e => set("title", e.target.value)} required />
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{form.title.length}/100</div>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={form.category} onChange={e => set("category", e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-control" rows={6} placeholder="Describe what you will deliver, your process, and what makes you unique..."
                  value={form.description} onChange={e => set("description", e.target.value)} required
                  style={{ resize: "vertical" }} />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-control" placeholder="e.g. logo, branding, illustrator, adobe"
                  value={form.tags} onChange={e => set("tags", e.target.value)} />
                {form.tags && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="badge badge-gray">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div className="card mb-3">
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Pricing & Delivery</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Starting Price ($) *</label>
                  <input className="form-control" type="number" min="1" max="9999" placeholder="25"
                    value={form.price} onChange={e => set("price", e.target.value)} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Delivery Days *</label>
                  <input className="form-control" type="number" min="1" max="90" placeholder="3"
                    value={form.deliveryDays} onChange={e => set("deliveryDays", e.target.value)} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Revisions</label>
                  <select className="form-control" value={form.revisions} onChange={e => set("revisions", e.target.value)}>
                    {["0","1","2","3","5","Unlimited"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: GitHub Repo */}
          <div className="card mb-3">
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>GitHub Repository (optional)</h3>
              <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 16 }}>
                Link a GitHub repo to showcase your work. We verify it exists and belongs to you.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <input className="form-control" placeholder="https://github.com/username/repo-name"
                  value={form.githubRepoUrl} onChange={e => { set("githubRepoUrl", e.target.value); setRepoStatus(null); }}
                  style={{ flex: 1 }} />
                <button type="button" className="btn btn-secondary" onClick={verifyRepo} disabled={repoVerifying || !form.githubRepoUrl.trim()}>
                  {repoVerifying ? "Checking..." : "Verify"}
                </button>
              </div>
              {repoStatus === "valid" && <div className="alert alert-success mt-2" style={{ padding: "8px 12px", fontSize: 13 }}>✓ Repository verified successfully!</div>}
              {repoStatus === "invalid" && <div className="alert alert-error mt-2" style={{ padding: "8px 12px", fontSize: 13 }}>Repository not found or inaccessible. Check the URL.</div>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard/gigs")}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140 }}>
              {loading ? "Saving..." : isEdit ? "Update Gig" : "Publish Gig"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGigPage;
