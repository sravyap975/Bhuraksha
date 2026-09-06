import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import roadData from "../data/roadData";


function getRiskColor(risk) {

  if (risk >= 80) {
    return "red";
  }

  if (risk >= 60) {
    return "orange";
  }

  if (risk >= 30) {
    return "yellow";
  }

  return "green";
}


function getRiskLevel(risk) {

  if (risk >= 80) return "CRITICAL";
  if (risk >= 60) return "HIGH";
  if (risk >= 30) return "MODERATE";

  return "LOW";
}


// Roads don't have their own risk score from the API yet, so we estimate
// each road's status from the highest-risk zone within ~30km of any of
// its points. This is a simple stand-in for a real /road-status endpoint.
function getRoadStatus(road, riskData) {

  const NEARBY_DEGREES = 0.3; // roughly 30km

  let maxNearbyRisk = 0;

  road.coordinates.forEach(([roadLat, roadLng]) => {
    riskData.forEach((zone) => {
      const distance = Math.sqrt(
        Math.pow(zone.lat - roadLat, 2) + Math.pow(zone.lng - roadLng, 2)
      );
      if (distance <= NEARBY_DEGREES && zone.risk > maxNearbyRisk) {
        maxNearbyRisk = zone.risk;
      }
    });
  });

  if (maxNearbyRisk >= 80) return { label: "Blocked / very high risk", color: "#c0392b" };
  if (maxNearbyRisk >= 60) return { label: "At risk", color: "#e67e22" };
  if (maxNearbyRisk >= 30) return { label: "Monitor", color: "#f1c40f" };
  return { label: "Open", color: "#2ecc71" };
}


function RiskMap({ riskData }) {

  return (

    <MapContainer
      center={[25.5, 92.0]}
      zoom={6}
      style={{
        height: "560px",
        width: "100%"
      }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />


      {/* LANDSLIDE RISK ZONES */}

      {riskData.map((location) => (

        <CircleMarker
          key={location.zone_id}
          center={[location.lat, location.lng]}
          radius={12}
          pathOptions={{
            color: getRiskColor(location.risk),
            fillColor: getRiskColor(location.risk),
            fillOpacity: 0.7
          }}
        >

          <Popup>

            <h3>{location.zone_id}</h3>

            <p>
              Risk:
              <b> {location.risk}/100</b>
            </p>

            <p>
              Level:
              <b> {getRiskLevel(location.risk)}</b>
            </p>

            <p>
              Reason:
              <br />
              {location.reason}
            </p>

            <p>
              📍 Latitude: {location.lat}
              <br />
              📍 Longitude: {location.lng}
            </p>

          </Popup>

        </CircleMarker>

      ))}


      {/* ROADS */}

      {roadData.map((road) => {
        const status = getRoadStatus(road, riskData);
        return (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            pathOptions={{
              color: status.color,
              weight: 5
            }}
          >

            <Popup>

              <b>{road.name}</b>

              <p>
                Road status: {status.label}
              </p>

            </Popup>

          </Polyline>
        );
      })}


    </MapContainer>

  );
}

export default RiskMap;