// Reusable Avatar — shows profile picture if available, otherwise colored initial
const COLORS = ["#4F46E5","#7C3AED","#0EA5E9","#059669","#D97706","#DC2626","#DB2777"];

const Avatar = ({ name = "", src, size = 40, fontSize, style = {} }) => {
  const initial  = name?.charAt(0)?.toUpperCase() || "?";
  const color    = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
  const fs       = fontSize || Math.round(size * 0.38);

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: fs, fontWeight: 700, flexShrink: 0,
      overflow: "hidden",
      ...style,
    }}>
      {src
        ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : initial
      }
    </div>
  );
};

export default Avatar;
