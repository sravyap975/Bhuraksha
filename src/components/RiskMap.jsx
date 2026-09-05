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


function RiskMap({ riskData }) {

  return (

    <MapContainer
      center={[25.5, 92.0]}
      zoom={6}
      style={{
        height: "600px",
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

      {roadData.map((road) => (

        <Polyline
          key={road.id}
          positions={road.coordinates}
          pathOptions={{
            color: "black",
            weight: 5
          }}
        >

          <Popup>

            <b>{road.name}</b>

            <p>
              Road status: At Risk
            </p>

          </Popup>

        </Polyline>

      ))}


    </MapContainer>

  );
}

export default RiskMap;