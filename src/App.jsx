import { useEffect, useState } from "react";

import RiskMap from "./components/RiskMap";
import RiskPanel from "./components/RiskPanel";

import "./App.css";


function App() {

  const [riskData, setRiskData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  useEffect(() => {
    fetch("http://localhost:8000/risk-scores")

      .then((response) => {

        if (!response.ok) {
          throw new Error("Failed to fetch risk data");
        }

        return response.json();

      })

      .then((data) => {

        console.log("API DATA:", data);

        setRiskData(data);

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

        <h1>🛡️ GiriRaksha</h1>

        <p>
          Landslide Risk Monitoring System
        </p>

      </header>


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