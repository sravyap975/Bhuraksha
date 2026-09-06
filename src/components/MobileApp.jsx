import { useState } from "react";

// Simulates the citizen/field-officer PWA screens, shown inside a
// phone-frame for demo purposes. It talks to the SAME backend as the
// GIS dashboard (Member 2's API) - this is not a disconnected mockup.

function truncate(text, max = 80) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

function AlertsScreen({ alerts }) {
  return (
    <div className="mobile-screen">
      <h3>Active alerts</h3>
      {alerts.length === 0 && <p className="mobile-empty">No active alerts right now.</p>}
      {alerts.map((a) => (
        <div key={a.zone_id} className={`mobile-alert-card sev-${a.severity}`}>
          <div className="mobile-alert-zone">{a.zone_id}</div>
          <div className="mobile-alert-msg">{truncate(a.message)}</div>
        </div>
      ))}
    </div>
  );
}

function ReportScreen() {
  const [type, setType] = useState("crack");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [status, setStatus] = useState(null); // null | "sending" | "sent" | "error"

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLat("25.5788");
      setLng("91.8933");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(4));
        setLng(pos.coords.longitude.toFixed(4));
      },
      () => {
        // Permission denied or unavailable - fall back to a sample
        // NER coordinate so the demo still works
        setLat("25.5788");
        setLng("91.8933");
      }
    );
  }

  async function submitReport(e) {
    e.preventDefault();
    if (!lat || !lng) {
      alert("Please set a location first (tap 'Use my location').");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("http://localhost:8000/field-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          photo_url: photoName || "no-photo-attached",
          type,
        }),
      });
      if (!res.ok) throw new Error("failed");
      await res.json();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div className="mobile-screen">
      <h3>Report a hazard</h3>
      <form onSubmit={submitReport} className="mobile-form">
        <label>What did you see?</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="crack">Crack / ground movement</option>
          <option value="blocked_road">Blocked road</option>
          <option value="other">Other hazard</option>
        </select>

        <label>Location</label>
        <button type="button" className="mobile-btn-secondary" onClick={useMyLocation}>
          📍 Use my location
        </button>
        {lat && lng && (
          <p className="mobile-coords">Lat {lat}, Lng {lng}</p>
        )}

        <label>Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setPhotoName(e.target.files[0]?.name || "")}
        />

        <button type="submit" className="mobile-btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : "Submit report"}
        </button>

        {status === "sent" && <p className="mobile-success">✅ Report received. Thank you.</p>}
        {status === "error" && (
          <p className="mobile-error">
            ❌ Could not reach the server. Make sure the API is running on port 8000.
          </p>
        )}
      </form>
    </div>
  );
}

function MobileApp({ alerts }) {
  const [tab, setTab] = useState("alerts");

  return (
    <div className="phone-frame">
      <div className="phone-notch"></div>
      <div className="phone-screen">
        <div className="mobile-topbar">🛡️ Bhuraksha</div>

        {tab === "alerts" ? <AlertsScreen alerts={alerts} /> : <ReportScreen />}

        <div className="mobile-tabbar">
          <button
            className={tab === "alerts" ? "active" : ""}
            onClick={() => setTab("alerts")}
          >
            🔔 Alerts
          </button>
          <button
            className={tab === "report" ? "active" : ""}
            onClick={() => setTab("report")}
          >
            📷 Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileApp;
