function RiskPanel({ riskData }) {

  const critical = riskData.filter(x => x.risk >= 80).length;
  const high = riskData.filter(x => x.risk >= 60 && x.risk < 80).length;
  const moderate = riskData.filter(x => x.risk >= 30 && x.risk < 60).length;
  const low = riskData.filter(x => x.risk < 30).length;

  const sorted = [...riskData].sort((a, b) => b.risk - a.risk).slice(0, 8);

  return (
    <div className="panel">

      <h2>Risk summary</h2>

      <div className="summary-row"><span className="dot dot-critical"></span> Critical <span style={{ marginLeft: "auto" }}>{critical}</span></div>
      <div className="summary-row"><span className="dot dot-high"></span> High <span style={{ marginLeft: "auto" }}>{high}</span></div>
      <div className="summary-row"><span className="dot dot-moderate"></span> Moderate <span style={{ marginLeft: "auto" }}>{moderate}</span></div>
      <div className="summary-row"><span className="dot dot-low"></span> Low <span style={{ marginLeft: "auto" }}>{low}</span></div>

      <h2 style={{ marginTop: 20 }}>Top risk areas</h2>

      {sorted.map((location) => (
        <div key={location.zone_id} className="risk-item">
          <b>{location.zone_id}</b>
          <span>{location.risk}/100</span>
        </div>
      ))}

    </div>
  );
}

export default RiskPanel;
