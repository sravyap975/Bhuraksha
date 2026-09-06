import { useEffect, useState } from "react";

import RiskMap from "./components/RiskMap";
import RiskPanel from "./components/RiskPanel";

import "./App.css";


function App() {

  const [riskData, setRiskData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/risk-scores").then((r) => {
        if (!r.ok) throw new Error("Failed to fetch risk data");
        return r.json();
      }),
      fetch("http://localhost:8000/alerts").then((r) => {
        if (!r.ok) throw new Error("Failed to fetch alerts");
        return r.json();
      }),
    ])
      .then(([riskResult, alertsResult]) => {
        setRiskData(riskResult);
        setAlerts(alertsResult);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API ERROR:", error);
        setError(error.message);
        setLoading(false);
      });

  }, []);


  if (loading) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>🛡️ Bhuraksha</h1>
        </div>
        <div className="app-body">
          <p>Loading landslide risk data...</p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>🛡️ Bhuraksha</h1>
        </div>
        <div className="app-body">
          <h2>Unable to connect to risk server</h2>
          <p>Make sure the FastAPI server is running on port 8000.</p>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }


  return (
    <div className="app">

      <div className="app-header">
        <h1>🛡️ Bhuraksha</h1>
        <span className="tagline">AI-based landslide early warning — North Eastern Region</span>
      </div>

      <div className="app-body">

        {alerts.length > 0 && (
          <div className="alert-banner">
            <b>{alerts.length} active alert{alerts.length > 1 ? "s" : ""}</b> — {alerts[0].message}
          </div>
        )}

        <div className="dashboard">

          <RiskPanel riskData={riskData} />

          <div>
            <div className="map-card">
              <RiskMap riskData={riskData} />
              <div className="legend">
                <div className="legend-group">
                  <span className="legend-label">Zone risk</span>
                  <span className="legend-swatch" style={{ background: "#b1432f" }}></span> Critical
                  <span className="legend-swatch" style={{ background: "#c0793a" }}></span> High
                  <span className="legend-swatch" style={{ background: "#b8973a" }}></span> Moderate
                  <span className="legend-swatch" style={{ background: "#4a7a5a" }}></span> Low
                </div>
                <div className="legend-group">
                  <span className="legend-label">Roads</span>
                  <span className="legend-line" style={{ background: "#c0392b" }}></span> Blocked
                  <span className="legend-line" style={{ background: "#e67e22" }}></span> At risk
                  <span className="legend-line" style={{ background: "#f1c40f" }}></span> Monitor
                  <span className="legend-line" style={{ background: "#2ecc71" }}></span> Open
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default App;
