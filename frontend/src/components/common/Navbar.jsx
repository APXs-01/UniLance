// Member 4 - Navbar (Role-based navigation + Member 1 - Notification Bell)
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import NotificationBell from "../member1/NotificationBell";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isFreelancer, isBuyer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/Home/UniLance-Logo.png" alt="UniLance" style={{ height: 150, width: "auto", objectFit: "contain" }} />
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/gigs" className={isActive("/gigs") ? "nav-link active" : "nav-link"}>Browse Gigs</Link>
          <Link to="/communities" className={isActive("/communities") ? "nav-link active" : "nav-link"}>Communities</Link>
          <Link to="/freelancers" className={isActive("/freelancers") ? "nav-link active" : "nav-link"}>Freelancers</Link>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {user ? (
            <>
              

              {/* Role-specific quick links */}
              {isFreelancer && (
                <Link to="/dashboard/gigs" className="btn btn-sm btn-secondary">My Gigs</Link>
              )}
              {isBuyer && (
                <Link to="/dashboard/orders" className="btn btn-sm btn-secondary">My Orders</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="btn btn-sm btn-secondary">Admin</Link>
              )}

              {/* Avatar dropdown */}
              <div className="avatar-menu">
                <button className="avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.profilePicture
                    ? <img src={user.profilePicture} alt={user.name} className="avatar-img" />
                    : <div className="avatar-placeholder">{user.name?.charAt(0).toUpperCase()}</div>
                  }
                  <span className="avatar-name">{user.name?.split(" ")[0]}</span>
                  <span>▾</span>
                </button>

                {menuOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-role badge badge-primary">{user.role}</div>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}><img src="/Home/Nav/Profile.svg" alt="" style={{ width: 16, height: 16, marginRight: 8 }} />My Profile</Link>
                    {isFreelancer && <>
                      <Link to="/dashboard/gigs" className="dropdown-item" onClick={() => setMenuOpen(false)}><img src="/Home/Nav/Gigs.svg" alt="" style={{ width: 16, height: 16, marginRight: 8 }} />My Gigs</Link>
                      <Link to="/dashboard/orders" className="dropdown-item" onClick={() => setMenuOpen(false)}><img src="/Home/Nav/Transactions.svg" alt="" style={{ width: 16, height: 16, marginRight: 8 }} />My Orders</Link>
                      <Link to="/dashboard/analytics" className="dropdown-item" onClick={() => setMenuOpen(false)}><img src="/Home/Nav/Analytics.svg" alt="" style={{ width: 16, height: 16, marginRight: 8 }} />Analytics</Link>
                      <Link to="/smartquest" className="dropdown-item" onClick={() => setMenuOpen(false)}><img src="/Home/Nav/AI-Powered.svg" alt="" style={{ width: 16, height: 16, marginRight: 8 }} />SmartQuest</Link>
                      <Link to="/dashboard/payouts" className="dropdown-item" onClick={() => setMenuOpen(false)}><img src="/Home/Nav/Payouts.svg" alt="" style={{ width: 16, height: 16, marginRight: 8 }} />Payouts</Link>
                    </>}
                    {isBuyer && (
                      <Link to="/dashboard/orders" className="dropdown-item" onClick={() => setMenuOpen(false)}><img src="/Home/Nav/Gigs.svg" alt="" style={{ width: 16, height: 16, marginRight: 8 }} />My Orders</Link>
                    )}
                    <Link to="/dashboard/transactions" className="dropdown-item" onClick={() => setMenuOpen(false)}><img src="/Home/Nav/Transactions.svg" alt="" style={{ width: 16, height: 16, marginRight: 8 }} />Transactions</Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}><img src="/Home/Nav/Logout.svg" alt="" style={{ width: 16, height: 16, marginRight: 8 }} />Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
