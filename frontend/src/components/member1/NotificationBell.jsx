// Member 1 - NotificationBell (Real-time notification dropdown)
import { useState, useEffect, useRef } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { notificationAPI } from "../../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

const NotificationBell = () => {
  const { unreadCount, markAllRead } = useNotifications();
  const [open, setOpen]              = useState(false);
  const [items, setItems]            = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (open) {
      notificationAPI.getAll({ limit: 10 })
        .then((r) => setItems(r.data.notifications))
        .catch(() => {});
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAll = async () => {
    await markAllRead();
    setItems((p) => p.map((n) => ({ ...n, isRead: true })));
  };

  const typeIcon = (type) => {
    if (type?.includes("payment")) return "💳";
    if (type?.includes("payout"))  return "💰";
    if (type?.includes("order"))   return "📦";
    if (type?.includes("review"))  return "⭐";
    if (type?.includes("badge"))   return "🏅";
    if (type?.includes("smart"))   return "🧠";
    if (type?.includes("community"))return "💬";
    return "🔔";
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ position: "relative", background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 0, right: 0,
            background: "#EF4444", color: "#fff", borderRadius: "999px",
            fontSize: 10, fontWeight: 700, minWidth: 16, height: 16,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px"
          }}>{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340,
          background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          border: "1px solid #E5E7EB", zIndex: 300, overflow: "hidden"
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {items.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#6B7280", fontSize: 14 }}>No notifications yet</div>
            ) : items.map((n) => (
              <div key={n._id} style={{
                padding: "12px 16px", borderBottom: "1px solid #F9FAFB", display: "flex", gap: 12,
                background: n.isRead ? "#fff" : "#EEF2FF", cursor: "pointer"
              }}
                onClick={() => {
                  notificationAPI.markRead(n._id);
                  setItems(p => p.map(x => x._id === n._id ? { ...x, isRead: true } : x));
                  if (n.link) {
                    setOpen(false);
                    if (location.pathname === n.link) {
                      navigate(0); // already on page — force refresh
                    } else {
                      navigate(n.link);
                    }
                  }
                }}
              >
                <span style={{ fontSize: 20 }}>{typeIcon(n.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 13, color: "#111827" }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4F46E5", marginTop: 4, flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
