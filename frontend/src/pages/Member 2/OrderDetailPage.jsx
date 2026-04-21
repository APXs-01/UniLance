// Member 2 - OrderDetailPage (Order Status Tracking, Delivery, Review, Payment)
import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { orderAPI, paymentAPI, reviewAPI } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import StripePaymentForm from "../../components/member1/StripePaymentForm";
import Avatar from "../../components/common/Avatar";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Toast = ({ toasts }) => (
  <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: 12,
        background: t.type === "error" ? "#FEF2F2" : t.type === "success" ? "#F0FDF4" : "#EFF6FF",
        border: `1.5px solid ${t.type === "error" ? "#FCA5A5" : t.type === "success" ? "#86EFAC" : "#93C5FD"}`,
        color: t.type === "error" ? "#B91C1C" : t.type === "success" ? "#15803D" : "#1D4ED8",
        borderRadius: 12, padding: "14px 20px", minWidth: 280, maxWidth: 380,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        animation: "slideIn 0.25s ease",
        pointerEvents: "all",
        fontSize: 14, fontWeight: 600, lineHeight: 1.4,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>
          {t.type === "error" ? "⚠️" : t.type === "success" ? "✅" : "ℹ️"}
        </span>
        {t.msg}
      </div>
    ))}
    <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }`}</style>
  </div>
);

const STATUS_STEPS = ["pending", "accepted", "in_progress", "delivered", "completed"];

const STATUS_COLORS = {
  pending:     { bg: "#FEF9C3", color: "#92400E" },
  accepted:    { bg: "#DCFCE7", color: "#166534" },
  in_progress: { bg: "#DBEAFE", color: "#1E40AF" },
  delivered:   { bg: "#EDE9FE", color: "#5B21B6" },
  completed:   { bg: "#D1FAE5", color: "#065F46" },
  cancelled:   { bg: "#FEE2E2", color: "#991B1B" },
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder]     = useState(null);
  // Derive buyer/freelancer from order by email — works even if buyer/freelancer same account
  const isBuyer      = order && user && order.buyer?.email === user.email;
  const isFreelancer = order && user && order.freelancer?.email === user.email;
  const [loading, setLoading] = useState(true);
  const [action, setAction]   = useState("");

  // Payment flow state
  const [payStep, setPayStep]           = useState("idle"); // idle|creating|card|otp|done
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [otp, setOtp]                   = useState("");

  // Delivery state
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState([]);

  // Review state
  const [showReview, setShowReview] = useState(false);
  const [review, setReview]         = useState({ overall: 5, communication: 5, quality: 5, delivery: 5, value: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = "error") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const reload = async () => {
    const { data } = await orderAPI.getOne(id);
    setOrder(data.order);
  };

  useEffect(() => {
    orderAPI.getOne(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => navigate("/dashboard/orders"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Member 2 - Freelancer: accept or reject order
  const respondOrder = async (status) => {
    setAction("responding");
    try {
      await orderAPI.respond(id, { response: status });
      await reload();
    } catch (err) { showToast(err.response?.data?.message || "Action failed"); }
    setAction("");
  };

  // Member 1 - Buyer: initiate payment (create PaymentIntent)
  const initiatePayment = async () => {
    setPayStep("creating");
    try {
      const { data } = await paymentAPI.createIntent({
        orderId: id,
        discountCode: discountCode.trim() || undefined,
      });
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setPayStep("card");
    } catch (err) {
      showToast(err.response?.data?.message || "Payment failed");
      setPayStep("idle");
    }
  };

  const handleCardConfirmed = () => {
    setPayStep("otp");
  };

  const verifyPaymentOTP = async () => {
    if (!otp || otp.length !== 6) { showToast("Enter the 6-digit OTP", "info"); return; }
    setAction("paying");
    try {
      await paymentAPI.verifyOTP({ paymentIntentId, otp, orderId: id });
      await reload();
      setPayStep("done");
    } catch (err) {
      showToast(err.response?.data?.message || "OTP verification failed");
    }
    setAction("");
  };


  // Member 2 - Freelancer: submit delivery
  const submitDelivery = async () => {
    if (!deliveryNote.trim()) { showToast("Add a delivery note", "info"); return; }
    if (deliveryFiles.length === 0) { showToast("Please attach at least one file before submitting.", "info"); return; }
    setAction("delivering");
    try {
      const formData = new FormData();
      formData.append("note", deliveryNote);
      deliveryFiles.forEach(f => formData.append("files", f));
      await orderAPI.deliver(id, formData);
      await reload();
      setDeliveryNote("");
      setDeliveryFiles([]);
    } catch (err) { showToast(err.response?.data?.message || "Delivery failed"); }
    setAction("");
  };

  // Member 2 - Buyer: approve delivery
  const approveDelivery = async () => {
    setAction("approving");
    try {
      await orderAPI.reviewDelivery(id, { action: "approve" });
      await reload();
    } catch (err) { showToast(err.response?.data?.message || "Action failed"); }
    setAction("");
  };

  // Member 2 - Buyer: request revision
  const requestRevision = async () => {
    setAction("revising");
    try {
      await orderAPI.reviewDelivery(id, { action: "revision" });
      await reload();
    } catch (err) { showToast(err.response?.data?.message || "Action failed"); }
    setAction("");
  };

  // Member 2 - Buyer: submit review
  const submitReview = async () => {
    if (!review.comment.trim()) { showToast("Please add a review comment", "info"); return; }
    setSubmittingReview(true);
    try {
      const { comment, ...ratingFields } = review;
      await reviewAPI.submit({
        orderId: id,
        rating: ratingFields,
        comment,
      });
      await reload();
      setShowReview(false);
    } catch (err) { showToast(err.response?.data?.message || "Review failed"); }
    setSubmittingReview(false);
  };

  // Member 2 - Cancel order
  const cancelOrder = async () => {
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    setAction("cancelling");
    try {
      await orderAPI.cancel(id);
      await reload();
    } catch (err) { showToast(err.response?.data?.message || "Cancel failed"); }
    setAction("");
  };

  if (loading) return <div className="flex-center" style={{ height: "60vh" }}><div className="spinner" /></div>;
  if (!order) return null;

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);
  const s = STATUS_COLORS[order.status] || { bg: "#F3F4F6", color: "#374151" };
  const statusLabel = order.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="page">
      <Toast toasts={toasts} />
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/dashboard/orders" style={{ color: "#6B7280", fontSize: 13 }}>← Back to Orders</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, flex: 1 }}>{order.gig?.title}</h1>
            <span style={{ background: s.bg, color: s.color, padding: "6px 16px", borderRadius: "999px", fontWeight: 700, fontSize: 13 }}>
              {statusLabel}
            </span>
          </div>
          <div style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4, fontFamily: "monospace" }}>{order.orderNumber}</div>
        </div>

        {/* Progress Bar */}
        {order.status !== "cancelled" && (
          <div className="card mb-3" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              <div style={{ position: "absolute", top: 16, left: "10%", right: "10%", height: 2, background: "#E5E7EB", zIndex: 0 }}>
                <div style={{ width: `${Math.max(0, (currentStepIdx / (STATUS_STEPS.length - 1)) * 100)}%`, height: "100%", background: "#4F46E5", transition: "width 0.5s" }} />
              </div>
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStepIdx;
                return (
                  <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "#4F46E5" : "#E5E7EB", color: done ? "#fff" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 11, color: done ? "#4F46E5" : "#9CA3AF", fontWeight: done ? 600 : 400, textAlign: "center" }}>
                      {step.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
          {/* Main */}
          <div>
            {/* Payment Section (Member 1) - Buyer pays when order accepted */}
            {isBuyer && order.status === "accepted" && order.paymentStatus !== "paid" && (
              <div className="card mb-3" style={{ padding: 24, border: "2px solid #4F46E5" }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Complete Payment</h3>
                {payStep === "idle" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Discount Code (optional)</label>
                      <input className="form-control" placeholder="Enter code..." value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={initiatePayment}>Pay ${order.price} via Stripe</button>
                  </>
                )}
                {payStep === "creating" && <div className="flex-center" style={{ height: 60 }}><div className="spinner" /></div>}
                {payStep === "card" && clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      amount={order.price * 100}
                      onCardConfirmed={handleCardConfirmed}
                    />
                  </Elements>
                )}
                {payStep === "otp" && (
                  <div>
                    <div className="alert alert-warning mb-3">Card payment confirmed! Enter the 6-digit OTP sent to your email to finalize.</div>
                    <div className="form-group">
                      <label className="form-label">OTP Code</label>
                      <input className="form-control" maxLength={6} placeholder="123456" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} />
                    </div>
                    <button className="btn btn-primary" onClick={verifyPaymentOTP} disabled={action === "paying"}>
                      {action === "paying" ? "Verifying..." : "Confirm Payment"}
                    </button>
                  </div>
                )}
                {payStep === "done" && <div className="alert alert-success">Payment confirmed! The freelancer can now begin work.</div>}
              </div>
            )}

            {/* Freelancer: Accept/Reject Pending Order */}
            {isFreelancer && order.status === "pending" && (
              <div className="card mb-3" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>New Order Request</h3>
                <p style={{ color: "#374151", marginBottom: 20 }}>{order.requirements || "No specific requirements provided."}</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn-primary" onClick={() => respondOrder("accepted")} disabled={!!action}>
                    {action === "responding" ? "..." : "Accept Order"}
                  </button>
                  <button className="btn btn-secondary" style={{ color: "#DC2626" }} onClick={() => respondOrder("rejected")} disabled={!!action}>
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* Freelancer: Submit Delivery */}
            {isFreelancer && order.status === "in_progress" && (
              <div className="card mb-3" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Submit Delivery</h3>
                <div className="form-group">
                  <label className="form-label">Delivery Note *</label>
                  <textarea className="form-control" rows={4} placeholder="Describe what you've delivered..."
                    value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} style={{ resize: "vertical" }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Attach Files <span style={{ color: "#EF4444" }}>*</span></label>
                  <input type="file" multiple className="form-control" onChange={e => setDeliveryFiles(Array.from(e.target.files))} />
                </div>
                <button className="btn btn-primary" onClick={submitDelivery} disabled={action === "delivering"}>
                  {action === "delivering" ? "Submitting..." : "Submit Delivery"}
                </button>
              </div>
            )}

            {/* Buyer: Review Delivery */}
            {isBuyer && order.status === "delivered" && (() => {
              const latestDelivery = order.deliveries?.[order.deliveries.length - 1];
              return (
              <div className="card mb-3" style={{ padding: 24, border: "2px solid #10B981" }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Delivery Received!</h3>
                {latestDelivery?.message && (
                  <div style={{ background: "#F3F4F6", borderRadius: 8, padding: 16, marginBottom: 16, color: "#374151", fontSize: 14 }}>
                    <strong>Delivery note:</strong> {latestDelivery.message}
                  </div>
                )}
                {latestDelivery?.attachments?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 8 }}>Attached Files:</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {latestDelivery.attachments.map((f, i) => {
                        const fileName = f.split("/").pop();
                        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
                        return (
                          <a key={i} href={f} target="_blank" rel="noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#EEF2FF", borderRadius: 8, color: "#4F46E5", fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid #C7D2FE" }}>
                            <span style={{ fontSize: 18 }}>{isImage ? "🖼️" : "📎"}</span>
                            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>
                            <span style={{ fontSize: 11, color: "#6366F1", flexShrink: 0 }}>Download ↗</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn-primary" onClick={approveDelivery} disabled={!!action}>
                    {action === "approving" ? "..." : "Approve & Complete"}
                  </button>
                  <button className="btn btn-secondary" onClick={requestRevision} disabled={!!action}>
                    {action === "revising" ? "..." : "Request Revision"}
                  </button>
                </div>
              </div>
              );
            })()}

            {/* Buyer: Leave Review after completion */}
            {isBuyer && order.status === "completed" && !order.isReviewed && !showReview && (
              <div className="card mb-3" style={{ padding: 20, background: "#F0FDF4", borderColor: "#10B981" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src="/Review/Star.svg" alt="review" style={{ width: 36, height: 36 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>How was your experience?</div>
                    <div style={{ fontSize: 13, color: "#6B7280" }}>Leave a review to help other buyers</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowReview(true)}>Write Review</button>
                </div>
              </div>
            )}

            {/* Member 2 - Review Form */}
            {showReview && (
              <div className="card mb-3" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Leave a Review</h3>
                {["overall","communication","quality","delivery","value"].map(field => (
                  <div key={field} className="form-group">
                    <label className="form-label" style={{ textTransform: "capitalize" }}>{field} Rating</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => setReview(r => ({ ...r, [field]: n }))}
                          style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", opacity: n <= review[field] ? 1 : 0.3 }}>
                          ★
                        </button>
                      ))}
                      <span style={{ fontSize: 14, color: "#6B7280", marginLeft: 8, alignSelf: "center" }}>{review[field]}/5</span>
                    </div>
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Your Review *</label>
                  <textarea className="form-control" rows={4} placeholder="Share your experience with this freelancer..."
                    value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn-primary" onClick={submitReview} disabled={submittingReview}>
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowReview(false)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Order Requirements */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Order Requirements</h3>
              <p style={{ color: "#374151", lineHeight: 1.7 }}>{order.requirements || "No specific requirements provided."}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Order Summary */}
            <div className="card mb-3" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Order Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6B7280" }}>Order#</span>
                  <span style={{ fontWeight: 600, fontSize: 12, fontFamily: "monospace" }}>{order.orderNumber}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6B7280" }}>Price</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>${order.price}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6B7280" }}>Delivery</span>
                  <span style={{ fontWeight: 600 }}>{order.deliveryDays} days</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6B7280" }}>Payment</span>
                  <span className={`badge ${order.paymentStatus === "paid" ? "badge-success" : "badge-gray"}`}>{order.paymentStatus === "paid" ? "Paid" : "Unpaid"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#6B7280" }}>Placed</span>
                  <span style={{ fontSize: 12, color: "#374151" }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="card mb-3" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Parties</h3>
              {[{ label: "Buyer", person: order.buyer }, { label: "Freelancer", person: order.freelancer }].map(({ label, person }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Avatar name={person?.name} src={person?.profilePicture} size={36} />
                  <div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{label}</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{person?.name}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cancel button */}
            {["pending","accepted"].includes(order.status) && (
              <button className="btn btn-secondary btn-sm" style={{ width: "100%", color: "#DC2626" }} onClick={cancelOrder} disabled={action === "cancelling"}>
                {action === "cancelling" ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
