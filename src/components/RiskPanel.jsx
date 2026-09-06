function RiskPanel({ riskData }) {

  const critical =
    riskData.filter(x => x.risk >= 80).length;

  const high =
    riskData.filter(
      x => x.risk >= 60 && x.risk < 80
    ).length;

  const moderate =
    riskData.filter(
      x => x.risk >= 30 && x.risk < 60
    ).length;

  const low =
    riskData.filter(x => x.risk < 30).length;

  const sorted =
    [...riskData].sort(
      (a, b) => b.risk - a.risk
    );


  return (

    <div className="panel">

      <h2>Risk Summary</h2>

      <p>🔴 Critical: {critical}</p>

      <p>🟠 High: {high}</p>

      <p>🟡 Moderate: {moderate}</p>

      <p>🟢 Low: {low}</p>


      <h2>Top Risk Areas</h2>

      {sorted.map((location) => (

        <div
          key={location.zone_id}
          className="risk-item"
        >

          <b>{location.zone_id}</b>

          <span>
            {location.risk}/100
          </span>

        </div>

      ))}

    </div>

  );
}

export default RiskPanel;