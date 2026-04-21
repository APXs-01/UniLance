// MapPicker — uses plain Leaflet (no react-leaflet) to avoid v5 breaking changes
import { useEffect, useRef, useState } from "react";

let leafletLoaded = false;

const MapPicker = ({ value, onChange, onClose }) => {
  const mapRef      = useRef(null); // DOM node
  const instanceRef = useRef(null); // Leaflet map instance
  const markerRef   = useRef(null); // Leaflet marker instance
  const [resolving, setResolving] = useState(false);
  const [display, setDisplay]     = useState(value || "");

  // Reverse-geocode via Nominatim (free, no API key)
  const reverseGeocode = async (lat, lng) => {
    setResolving(true);
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const addr = data.address || {};
      const parts = [
        addr.city || addr.town || addr.village || addr.county,
        addr.state || addr.province,
        addr.country,
      ].filter(Boolean);
      const loc = parts.join(", ") || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setDisplay(loc);
      onChange(loc);
    } catch {
      const loc = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setDisplay(loc);
      onChange(loc);
    } finally {
      setResolving(false);
    }
  };

  useEffect(() => {
    // Inject Leaflet CSS once
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id    = "leaflet-css";
      link.rel   = "stylesheet";
      link.href  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS (avoids SSR / bundler issues)
    const init = () => {
      const L   = window.L;
      const lat = 6.9271, lng = 79.8612; // default: Colombo

      const map = L.map(mapRef.current).setView([lat, lng], 12);
      instanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Default marker
      const marker = L.marker([lat, lng]).addTo(map);
      markerRef.current = marker;

      // Click to move marker + reverse-geocode
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });
    };

    if (window.L) {
      init();
    } else {
      const script   = document.createElement("script");
      script.src     = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload  = init;
      document.head.appendChild(script);
    }

    return () => {
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        width: "100%", maxWidth: 680,
        boxShadow: "0 16px 64px rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Select Location</h3>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Click anywhere on the map to set your location</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6B7280", lineHeight: 1, padding: "4px 8px" }}>✕</button>
        </div>

        {/* Selected location bar */}
        <div style={{ padding: "10px 20px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", fontSize: 13, color: "#374151", display: "flex", alignItems: "center", gap: 8, minHeight: 40 }}>
          <span style={{ fontSize: 16 }}>📍</span>
          {resolving
            ? <span style={{ color: "#9CA3AF" }}>Resolving address…</span>
            : <span style={{ fontWeight: 500 }}>{display || "Click the map to select a location"}</span>
          }
        </div>

        {/* Map container */}
        <div ref={mapRef} style={{ height: 380, width: "100%" }} />

        {/* Footer */}
        <div style={{ padding: "14px 20px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #E5E7EB" }}>
          <button
            onClick={onClose}
            style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151" }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            disabled={resolving}
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: resolving ? "not-allowed" : "pointer", color: "#fff", opacity: resolving ? 0.6 : 1 }}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
