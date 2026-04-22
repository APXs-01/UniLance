// Member 2 - OrdersPage (My Orders Dashboard for Buyer and Freelancer)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// ── Export orders to CSV file (opens in Excel) ────────────────────────────────
const exportToExcel = (orders, isFreelancer) => {
  const headers = ["Order Number", "Gig Title", isFreelancer ? "Buyer" : "Freelancer", "Status", "Price ($)", "Delivery Days", "Placed Date"];

  const rows = orders.map(o => [
    o.orderNumber || "",
    (o.gig?.title || "Untitled").replace(/,/g, " "),
    isFreelancer ? (o.buyer?.name || "") : (o.freelancer?.name || ""),
    o.status || "",
    o.price || 0,
    o.deliveryDays || 0,
    new Date(o.createdAt).toLocaleDateString("en-US"),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const BOM = "\uFEFF"; // UTF-8 BOM so Excel opens correctly
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `UniLance_Orders_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const STATUS_COLORS = {
  pending:     { bg: "#FEF9C3", color: "#92400E", label: "Pending" },
  accepted:    { bg: "#DCFCE7", color: "#166534", label: "Accepted" },
  in_progress: { bg: "#DBEAFE", color: "#1E40AF", label: "In Progress" },
  delivered:   { bg: "#EDE9FE", color: "#5B21B6", label: "Delivered" },
  completed:   { bg: "#D1FAE5", color: "#065F46", label: "Completed" },
  cancelled:   { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
};

const OrdersPage = () => {
  const { user, isFreelancer, isBuyer } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");

  useEffect(() => {
    orderAPI.getMy()
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATUS_TABS = ["all", "pending", "accepted", "in_progress", "delivered", "completed", "cancelled"];

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const statusCounts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === "all" ? orders.length : orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  if (loading) return <div className="flex-center" style={{ height: "60vh" }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>
              {isBuyer ? "My Orders" : "Orders Received"}
            </h1>
            <p style={{ color: "#6B7280", marginTop: 4 }}>
              {isBuyer ? "Track your placed orders" : "Manage orders from your buyers"}
            </p>
          </div>
          {/* Summary Stats + Export */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#4F46E5" }}>{orders.filter(o => ["pending","accepted","in_progress","delivered"].includes(o.status)).length}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Active</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#10B981" }}>{orders.filter(o => o.status === "completed").length}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Completed</div>
            </div>
            {orders.length > 0 && (
              <button
                onClick={() => exportToExcel(filtered.length > 0 ? filtered : orders, isFreelancer)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: 10, cursor: "pointer", color: "#15803D", fontWeight: 700, fontSize: 13, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#DCFCE7"; e.currentTarget.style.borderColor = "#4ADE80"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#F0FDF4"; e.currentTarget.style.borderColor = "#86EFAC"; }}
                title="Export current view to Excel"
              >
                <span style={{ fontSize: 18 }}>📊</span>
                Export Excel
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 24, borderBottom: "2px solid #E5E7EB", paddingBottom: 0 }}>
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: "8px 16px", border: "none", background: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                borderBottom: filter === s ? "2px solid #4F46E5" : "2px solid transparent",
                color: filter === s ? "#4F46E5" : "#6B7280", marginBottom: -2, transition: "all 0.15s" }}>
              {s === "all" ? "All" : STATUS_COLORS[s]?.label || s}
              {statusCounts[s] > 0 && (
                <span style={{ marginLeft: 6, background: filter === s ? "#4F46E5" : "#E5E7EB", color: filter === s ? "#fff" : "#6B7280", borderRadius: "999px", padding: "1px 7px", fontSize: 11 }}>
                  {statusCounts[s]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="card text-center" style={{ padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {filter === "all" ? "No orders yet" : `No ${STATUS_COLORS[filter]?.label || filter} orders`}
            </div>
            {isBuyer && filter === "all" && (
              <p style={{ color: "#6B7280" }}>
                <Link to="/gigs" style={{ color: "#4F46E5" }}>Browse gigs</Link> to place your first order
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map(order => {
              const s = STATUS_COLORS[order.status] || { bg: "#F3F4F6", color: "#374151", label: order.status };
              const otherParty = isFreelancer ? order.buyer : order.freelancer;
              return (
                <Link key={order._id} to={`/dashboard/orders/${order._id}`}
                  className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 20, textDecoration: "none", transition: "box-shadow 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(79,70,229,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>

                  {/* Gig Thumb */}
                  <div style={{ width: 64, height: 64, borderRadius: 12, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                    💼
                  </div>

                  {/* Order Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {order.gig?.title || "Untitled Gig"}
                    </div>
                    <div style={{ fontSize: 13, color: "#6B7280" }}>
                      {isFreelancer ? "From: " : "To: "}<span style={{ fontWeight: 600, color: "#374151" }}>{otherParty?.name}</span>
                      <span style={{ margin: "0 8px" }}>·</span>
                      <span style={{ fontFamily: "monospace", fontSize: 12 }}>{order.orderNumber}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                      Placed {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Status + Price */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ background: s.bg, color: s.color, padding: "4px 12px", borderRadius: "999px", fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>
                      {s.label}
                    </span>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "#111827" }}>${order.price}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>Due: {order.deliveryDays}d</div>
                  </div>

                  <span style={{ color: "#9CA3AF", fontSize: 20 }}>›</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
