import json
import logging
import os
from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd

logger = logging.getLogger(__name__)

# Directorio de modelos. Configurable con MODEL_DIR (útil al dockerizar);
# por defecto sube desde /ml-service/app hasta la raíz y baja a /ml/models.
_DEFAULT_MODELS_DIR = Path(__file__).parent.parent.parent / "ml" / "models"
_MODELS_DIR = Path(os.getenv("MODEL_DIR", str(_DEFAULT_MODELS_DIR)))

# Umbrales de riesgo por defecto; el metadata del modelo puede sobreescribirlos.
_DEFAULT_THRESHOLDS = {"medio": 0.30, "alto": 0.60}


@lru_cache(maxsize=1)
def _load_pipeline():
    path = _MODELS_DIR / "churn_pipeline.pkl"
    logger.info("Cargando pipeline desde %s", path)
    return joblib.load(path)


@lru_cache(maxsize=1)
def _load_metadata() -> dict:
    path = _MODELS_DIR / "model_metadata.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def is_model_loaded() -> bool:
    try:
        _load_pipeline()
        return True
    except Exception:
        return False


def predict(features: dict) -> tuple[float, str]:
    """
    Recibe un dict con las features del cliente y devuelve
    (churn_probability, risk_label).
    """
    pipeline = _load_pipeline()
    metadata = _load_metadata()

    # El pipeline espera un DataFrame con las columnas en el orden original
    df = pd.DataFrame([features])[metadata["features"]]

    prob: float = float(pipeline.predict_proba(df)[0, 1])

    thresholds = metadata.get("risk_thresholds", _DEFAULT_THRESHOLDS)
    if prob < thresholds["medio"]:
        label = "bajo"
    elif prob < thresholds["alto"]:
        label = "medio"
    else:
        label = "alto"

    return prob, label
