"""
GiriRaksha - Susceptibility Model Trainer
Member 1's job: this script teaches the computer to guess landslide risk.

HOW TO RUN:
    pip install scikit-learn pandas joblib --break-system-packages
    python train_model.py

This reads data/sample_zones.csv, trains a Random Forest model,
and saves it as model/risk_model.pkl so the API (Member 2's job) can use it.
"""

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# 1. Load the sample data
data_path = os.path.join(os.path.dirname(__file__), "..", "data", "sample_zones.csv")
df = pd.read_csv(data_path)

# 2. Pick the features (the clues the model uses to guess risk)
feature_cols = [
    "slope_deg",
    "rainfall_24h_mm",
    "rainfall_72h_mm",
    "soil_moisture_pct",
    "distance_to_fault_km",
]
X = df[feature_cols]
y = df["past_landslide"]  # 1 = landslide happened here before, 0 = did not

# 3. Train a Random Forest (a team of small decision trees voting together)
model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
model.fit(X, y)

# 4. Save the trained model so the API can load it later
model_path = os.path.join(os.path.dirname(__file__), "risk_model.pkl")
joblib.dump(model, model_path)

print(f"Model trained and saved to {model_path}")

# 5. Quick sanity check - show risk scores for our sample zones
df["risk_score"] = (model.predict_proba(X)[:, 1] * 100).round(1)
print("\nSample predictions (risk score out of 100):")
print(df[["zone_id", "risk_score"]].to_string(index=False))
