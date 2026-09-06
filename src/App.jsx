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
        console.log("API DATA:", riskResult);
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

        <h2>
          Loading landslide risk data...
        </h2>

      </div>
    );

  }


  if (error) {

    return (
      <div className="app">

        <h2>
          ❌ Unable to connect to risk server
        </h2>

        <p>
          Make sure the FastAPI server is running.
        </p>

        <p>
          Error: {error}
        </p>

      </div>
    );

  }


  return (

    <div className="app">

      <header>

        <h1>🛡️ Bhuraksha</h1>

        <p>
          AI-Based Landslide Early Warning & Risk Monitoring — NER
        </p>

      </header>

      {alerts.length > 0 && (
        <div className="alert-banner">
          🚨 {alerts.length} active alert{alerts.length > 1 ? "s" : ""}: {alerts[0].message}
        </div>
      )}


      <div className="dashboard">

        <RiskPanel
          riskData={riskData}
        />

        <RiskMap
          riskData={riskData}
        />

      </div>

    </div>

  );

}

export default App;