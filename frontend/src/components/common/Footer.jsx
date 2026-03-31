// Common - Footer
import { Link } from "react-router-dom";

const Footer = () => (
  <footer style={{ background: "#111827", color: "#9CA3AF", padding: "40px 0 24px" }}>
    <div className="container">
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <img src="/Home/UniLance-Logo.png" alt="UniLance" style={{ height: 180, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>Sri Lanka's premier student freelance community. Connecting university talent with global opportunities.</p>
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>For Freelancers</div>
          {["Browse Communities", "Create a Gig", "SmartQuest", "Portfolio Export"].map(l => (
            <div key={l} style={{ marginBottom: 8 }}><Link to="/gigs" style={{ fontSize: 13, color: "#9CA3AF" }}>{l}</Link></div>
          ))}
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>For Buyers</div>
          {["Browse Gigs", "Post a Project", "Find Freelancers", "How it Works"].map(l => (
            <div key={l} style={{ marginBottom: 8 }}><Link to="/gigs" style={{ fontSize: 13, color: "#9CA3AF" }}>{l}</Link></div>
          ))}
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Communities</div>
          {["Graphic Design", "Full Stack Dev", "Cyber Security", "Data Science", "Business Analysis"].map(l => (
            <div key={l} style={{ marginBottom: 8 }}><Link to="/communities" style={{ fontSize: 13, color: "#9CA3AF" }}>{l}</Link></div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid #374151", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 13 }}>© {new Date().getFullYear()} UniLance. Built for Sri Lankan university students.</div>
        <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
          <Link to="/" style={{ color: "#9CA3AF" }}>Privacy Policy</Link>
          <Link to="/" style={{ color: "#9CA3AF" }}>Terms of Service</Link>
          <Link to="/" style={{ color: "#9CA3AF" }}>Support</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
