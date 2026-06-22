import pandas as pd
import numpy as np
import json
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report,
)

ROOT = Path(__file__).parent
DATA_PATH = ROOT / "data" / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
MODELS_PATH = ROOT / "models"

# ── 1. Carga ─────────────────────────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)
print(f"Shape original: {df.shape}")

# ── 2. Limpieza ───────────────────────────────────────────────────────────────
# TotalCharges viene como string; clientes nuevos (tenure=0) tienen " "
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"].str.strip(), errors="coerce")
df["TotalCharges"] = df["TotalCharges"].fillna(0.0)

df = df.drop(columns=["customerID"])

# Target: Yes → 1, No → 0
df["Churn"] = (df["Churn"] == "Yes").astype(int)

print(f"Churn rate: {df['Churn'].mean():.2%}  "
      f"({df['Churn'].sum()} de {len(df)} clientes)")

# ── 3. Features ───────────────────────────────────────────────────────────────
X = df.drop(columns=["Churn"])
y = df["Churn"]

cat_cols = X.select_dtypes(include="str").columns.tolist()
num_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()

print(f"\nFeatures numericas  ({len(num_cols)}): {num_cols}")
print(f"Features categoricas ({len(cat_cols)}): {cat_cols}")

# ── 4. Split ──────────────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\nTrain: {len(X_train)}  |  Test: {len(X_test)}")

# ── 5. Pipeline ───────────────────────────────────────────────────────────────
preprocessor = ColumnTransformer([
    ("num", StandardScaler(), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
])

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )),
])

# ── 6. Entrenamiento ──────────────────────────────────────────────────────────
print("\nEntrenando modelo...")
pipeline.fit(X_train, y_train)

# ── 7. Evaluación ─────────────────────────────────────────────────────────────
y_pred = pipeline.predict(X_test)
y_prob = pipeline.predict_proba(X_test)[:, 1]

metrics = {
    "accuracy":  round(accuracy_score(y_test, y_pred), 4),
    "precision": round(precision_score(y_test, y_pred), 4),
    "recall":    round(recall_score(y_test, y_pred), 4),
    "f1":        round(f1_score(y_test, y_pred), 4),
    "roc_auc":   round(roc_auc_score(y_test, y_prob), 4),
}

print("\n-- Metricas ------------------------------------------")
for k, v in metrics.items():
    print(f"  {k:<12} {v:.4f}")

print("\n-- Reporte completo ----------------------------------")
print(classification_report(y_test, y_pred, target_names=["No Churn", "Churn"]))

# ── 8. Guardar modelo y metadata ──────────────────────────────────────────────
MODELS_PATH.mkdir(exist_ok=True)

joblib.dump(pipeline, MODELS_PATH / "churn_pipeline.pkl")

metadata = {
    "model_type": "RandomForestClassifier",
    "features": X.columns.tolist(),
    "categorical_features": cat_cols,
    "numerical_features": num_cols,
    "metrics": metrics,
    "target": "Churn",
    "classes": ["No Churn", "Churn"],
    "train_samples": len(X_train),
    "test_samples": len(X_test),
}

with open(MODELS_PATH / "model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print(f"\nModelo guardado en:   {MODELS_PATH / 'churn_pipeline.pkl'}")
print(f"Metadata guardada en: {MODELS_PATH / 'model_metadata.json'}")
