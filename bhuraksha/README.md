# Bhuraksha — Member 1 & 2 Starter Kit

This is a working starting point for the "robot brain" (risk model) and
"message sender" (API + alerts) jobs. It already runs — you just need to
improve it from here.

## Folder structure
```
bhuraksha/
├── data/sample_zones.csv     ← sample hill zones with rainfall/slope data
├── model/train_model.py      ← trains the risk-scoring model (Member 1)
├── model/risk_model.pkl      ← the trained model (created after you run train_model.py)
└── api/main.py                ← the backend API (Member 2)
```

## Step 1 — Train the model (Member 1)
```bash
cd model
pip install scikit-learn pandas joblib --break-system-packages
python train_model.py
```
This reads `sample_zones.csv`, trains a Random Forest, and saves
`risk_model.pkl`. You'll see risk scores printed for each sample zone.

**To make this your own:** add more rows to `sample_zones.csv` with real
NER district data if you find any (rainfall, slope, historical landslide
yes/no), then re-run the script.

## Step 2 — Run the API (Member 2)
```bash
cd api
pip install fastapi uvicorn pandas joblib --break-system-packages
uvicorn main:app --reload --port 8000
```
Then open in a browser:
- http://localhost:8000/risk-scores  → every zone's risk score
- http://localhost:8000/alerts       → only the dangerous zones

This is what Member 3 (map maker) will connect the dashboard to.

## What each endpoint returns (the "contract" the whole team agreed on)

`GET /risk-scores`
```json
[{ "zone_id": "sohra_01", "lat": 25.28, "lng": 91.73, "risk": 100.0,
   "severity": "high", "reason": "80mm rainfall in 24h + 42° slope + saturated soil" }]
```

`GET /alerts`
```json
[{ "zone_id": "sohra_01", "severity": "high",
   "message": "High landslide risk in sohra_01: 80mm rainfall..." }]
```

`POST /field-report` — a citizen/officer submits a report
```json
{ "lat": 25.28, "lng": 91.73, "photo_url": "...", "type": "crack" }
```

## Next steps if you have extra time
- Add a second model for "real-time trigger" using live rainfall instead
  of the fixed CSV values (swap in the Open-Meteo API for live rainfall)
- Wire `/field-report` into Firebase Cloud Messaging so a real push
  notification fires when severity = "high"
- Add a simple `/road-status` endpoint for the road-blockage layer

## Quick tip for demo day
Before showing this to judges, run both commands once ahead of time and
leave the API running in a terminal window in the background — don't try
to start it live in front of the judges.
