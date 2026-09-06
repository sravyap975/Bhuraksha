"""
Bhuraksha - Backend API
Member 2's job: this is the "message sender" - it serves risk scores
and decides when to fire an alert.

HOW TO RUN:
    pip install fastapi uvicorn pandas joblib --break-system-packages
    uvicorn main:app --reload --port 8000

Then open http://localhost:8000/risk-scores in a browser to see it working.
Member 3 (map maker) will call these same URLs from the dashboard.
"""

import os
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Bhuraksha API")

# Allow the dashboard (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and sample data once, when the server starts
BASE_DIR = os.path.dirname(__file__)
model = joblib.load(os.path.join(BASE_DIR, "..", "model", "risk_model.pkl"))
zones_df = pd.read_csv(os.path.join(BASE_DIR, "..", "data", "sample_zones.csv"))

FEATURE_COLS = [
    "slope_deg",
    "rainfall_24h_mm",
    "rainfall_72h_mm",
    "soil_moisture_pct",
    "distance_to_fault_km",
]

# A very simple "reason" generator so alerts are explainable, not a black box
def explain(row):
    reasons = []
    if row["rainfall_24h_mm"] > 60:
        reasons.append(f"{row['rainfall_24h_mm']}mm rainfall in 24h")
    if row["slope_deg"] > 35:
        reasons.append(f"{row['slope_deg']}° slope")
    if row["soil_moisture_pct"] > 70:
        reasons.append("saturated soil")
    return " + ".join(reasons) if reasons else "normal conditions"


def compute_risk_scores():
    """Runs the model on every zone and returns a risk score 0-100 for each."""
    X = zones_df[FEATURE_COLS]
    scores = (model.predict_proba(X)[:, 1] * 100).round(1)
    results = []
    for i, row in zones_df.iterrows():
        risk = float(scores[i])
        if risk >= 70:
            severity = "high"
        elif risk >= 40:
            severity = "medium"
        else:
            severity = "low"
        results.append({
            "zone_id": row["zone_id"],
            "lat": row["lat"],
            "lng": row["lng"],
            "risk": risk,
            "severity": severity,
            "reason": explain(row),
        })
    return results


@app.get("/risk-scores")
def get_risk_scores():
    """Returns risk score + reason for every zone. The dashboard uses this."""
    return compute_risk_scores()


@app.get("/alerts")
def get_alerts():
    """Returns only zones that are risky enough to warn people about,
    and that have an explainable reason - a high score with no
    concrete cause (e.g. borderline slope/rainfall/soil values that
    didn't individually cross a threshold) is not shown as an alert."""
    all_zones = compute_risk_scores()
    alerts = [
        z for z in all_zones
        if z["risk"] >= 70 and z["reason"] != "normal conditions"
    ]
    return [
        {
            "zone_id": z["zone_id"],
            "severity": z["severity"],
            "message": f"High landslide risk in {z['zone_id']}: {z['reason']}",
        }
        for z in alerts
    ]


class FieldReport(BaseModel):
    lat: float
    lng: float
    photo_url: str = ""
    type: str = "crack"


field_reports = []  # kept in memory for the demo - resets when server restarts


@app.post("/field-report")
def submit_field_report(report: FieldReport):
    """A citizen or field officer submits a geo-tagged report."""
    field_reports.append(report.dict())
    return {"status": "received", "total_reports": len(field_reports)}


@app.get("/")
def root():
    return {"message": "Bhuraksha API is running. Try /risk-scores or /alerts"}
