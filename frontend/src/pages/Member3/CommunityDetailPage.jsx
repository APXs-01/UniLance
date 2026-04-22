// Member 3 - CommunityDetailPage (Real-time Chat, File Sharing, Member Flagging)
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { communityAPI } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const COMMUNITY_ICONS = {
  "Graphic Design": "🎨", "Full Stack Web Development": "💻",
  "Cyber Security": "🔒", "Data Science": "📊", "Business Analysis": "📈",
};

const CommunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState("");
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);

  // Member 3 - Connect Socket.IO to community room
  useEffect(() => {
    if (!user) { navigate("/login"); return; }

    Promise.all([communityAPI.getOne(id), communityAPI.getMessages(id)])
      .then(([commRes, msgRes]) => {
        setCommunity(commRes.data.community);
        setMessages(msgRes.data.messages || []);
      })
      .catch(() => navigate("/communities"))
      .finally(() => setLoading(false));

    // Member 3 - Socket.IO room for community chat
    // Wait for connect before joining room to avoid missed events
    socketRef.current = io("/", { transports: ["websocket"], reconnection: true });

    const joinRoom = () => socketRef.current.emit("join_community_room", id);
    socketRef.current.on("connect", joinRoom);
    // Also emit immediately in case already connected
    if (socketRef.current.connected) joinRoom();

    // Only add messages from OTHER senders — own messages are added optimistically in sendMessage
    socketRef.current.on("new_message", ({ message }) => {
      const senderId = message.sender?._id || message.sender;
      if (senderId && senderId !== user._id) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socketRef.current?.off("connect", joinRoom);
      socketRef.current?.disconnect();
    };
  }, [id, user, navigate]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Member 3 - sendMessage (text) — optimistic update so message shows instantly
  const sendMessage = async (e) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    // Optimistically add message to UI immediately
    const optimistic = {
      _id: `temp-${Date.now()}`,
      message: content,   // backend field name is "message"
      content,
      messageType: "text",
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setText("");
    try {
      const { data } = await communityAPI.sendMessage(id, { message: content, messageType: "text" });
      // Replace temp message with real one from server
      setMessages(prev => prev.map(m => m._id === optimistic._id ? (data.message || optimistic) : m));
    } catch (err) {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setText(content);
      alert(err.response?.data?.message || "Failed to send message");
    } finally { setSending(false); }
  };

  // Member 3 - sendFile (file/image upload)
  const sendFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("messageType", file.type.startsWith("image/") ? "image" : "file");
    try {
      await communityAPI.sendMessage(id, formData);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send file");
    }
    e.target.value = "";
  };

  // Member 3 - flagMember
  const flagMember = async (memberId) => {
    if (!window.confirm("Flag this member for inappropriate behavior?")) return;
    try {
      await communityAPI.flagMember(id, memberId);
      alert("Member flagged. Admins will review.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to flag member");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return <div className="flex-center" style={{ height: "60vh" }}><div className="spinner" /></div>;
  if (!community) return null;

  const isMember = community.members?.some(m => m.user === user?._id || m.user?._id === user?._id);
  const icon = COMMUNITY_ICONS[community.name] || "💼";

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      {/* Community Header */}
      <div style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", padding: "24px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 40 }}>{icon}</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{community.name}</h1>
            <p style={{ opacity: 0.85, fontSize: 14 }}>{community.description}</p>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, opacity: 0.9 }}>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{community.members?.length || 0}</div>
            <div>Members</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 24, marginTop: 24 }}>
        {/* Chat / Members Tabs */}
        <div>
          <div style={{ display: "flex", borderBottom: "2px solid #E5E7EB", marginBottom: 0 }}>
            {["chat", "members"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, borderBottom: activeTab === tab ? "2px solid #4F46E5" : "2px solid transparent", color: activeTab === tab ? "#4F46E5" : "#6B7280", marginBottom: -2, textTransform: "capitalize" }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="card" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 320px)", minHeight: 400 }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", color: "#9CA3AF", marginTop: 40 }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={msg._id || idx} style={{ display: "flex", gap: 10, flexDirection: isOwn ? "row-reverse" : "row" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: isOwn ? "#4F46E5" : "#10B981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {(msg.sender?.name || "U").charAt(0)}
                      </div>
                      <div style={{ maxWidth: "70%" }}>
                        {!isOwn && <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>{msg.sender?.name}</div>}
                        <div style={{ background: isOwn ? "#4F46E5" : "#F3F4F6", color: isOwn ? "#fff" : "#111827", borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "10px 14px", fontSize: 14, lineHeight: 1.5 }}>
                          {msg.messageType === "image" && msg.fileUrl ? (
                            <img src={msg.fileUrl} alt="shared" style={{ maxWidth: 240, borderRadius: 8 }} />
                          ) : msg.messageType === "file" && msg.fileUrl ? (
                            <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: isOwn ? "#C7D2FE" : "#4F46E5" }}>
                              📎 {msg.fileName || "Download File"}
                            </a>
                          ) : (
                            msg.message || msg.content
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, textAlign: isOwn ? "right" : "left" }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input Bar */}
              {isMember ? (
                <div style={{ borderTop: "1px solid #E5E7EB", padding: 16, display: "flex", gap: 12, alignItems: "flex-end" }}>
                  <input type="file" ref={fileRef} style={{ display: "none" }} onChange={sendFile} accept="image/*,.pdf,.doc,.docx,.zip" />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ background: "none", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontSize: 18, color: "#6B7280" }} title="Share file">
                    📎
                  </button>
                  <textarea className="form-control" rows={1} placeholder="Type a message... (Enter to send)"
                    value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
                    style={{ flex: 1, resize: "none", minHeight: 42 }} />
                  <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !text.trim()} style={{ padding: "9px 20px" }}>
                    {sending ? "..." : "Send"}
                  </button>
                </div>
              ) : (
                <div style={{ borderTop: "1px solid #E5E7EB", padding: 16, textAlign: "center", color: "#6B7280", fontSize: 14 }}>
                  Join this community to participate in the chat.
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Community Members ({community.members?.length || 0})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(community.members || []).map(member => {
                  const m = member.user || member;
                  const isMe = m._id === user?._id || m === user?._id;
                  return (
                    <div key={m._id || m} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#4F46E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                        {(m.name || "U").charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name || "Member"} {isMe && <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(You)</span>}</div>
                        <div style={{ fontSize: 12, color: "#9CA3AF" }}>{m.university?.split(" ")[0] || ""}</div>
                      </div>
                      {member.isFlagged && <span className="badge badge-warning">Flagged</span>}
                      {!isMe && isMember && (
                        <button onClick={() => flagMember(m._id)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF", padding: "4px 8px", borderRadius: 6 }}
                          title="Flag this member">🚩</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Community Info */}
        <div>
          <div className="card mb-3" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>About this Community</h3>
            <p style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{community.description}</p>
            {community.rules && (
              <>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Community Rules</div>
                <p style={{ color: "#6B7280", fontSize: 12, lineHeight: 1.6 }}>{community.rules}</p>
              </>
            )}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Quick Stats</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#6B7280" }}>Members</span>
                <span style={{ fontWeight: 700 }}>{community.members?.length || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#6B7280" }}>Messages</span>
                <span style={{ fontWeight: 700 }}>{messages.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#6B7280" }}>Status</span>
                <span className={`badge ${community.isActive !== false ? "badge-success" : "badge-gray"}`}>
                  {community.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailPage;
