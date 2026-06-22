import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException

from .model import _load_metadata, _load_pipeline, is_model_loaded, predict
from .schemas import CustomerFeatures, HealthResponse, PredictionResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-carga el modelo al iniciar para que el primer request no tenga latencia."""
    logger.info("Cargando modelo...")
    _load_pipeline()
    _load_metadata()
    logger.info("Modelo listo.")
    yield


app = FastAPI(
    title="ChurnGuard ML Service",
    description=(
        "Microservicio de predicción de churn para clientes de telecomunicaciones. "
        "Recibe los datos de un cliente y devuelve la probabilidad de que cancele el servicio."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Verificar estado del servicio",
)
def health() -> HealthResponse:
    """Devuelve el estado del servicio y si el modelo está cargado en memoria."""
    return HealthResponse(
        status="ok",
        service="churnguard-ml",
        model_loaded=is_model_loaded(),
    )


@app.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Prediction"],
    summary="Predecir probabilidad de churn",
)
def predict_churn(customer: CustomerFeatures) -> PredictionResponse:
    """
    Recibe los datos de un cliente y devuelve:
    - **churn_probability**: probabilidad de abandono entre 0 y 1
    - **risk_label**: etiqueta de riesgo (`bajo` < 30%, `medio` 30–60%, `alto` > 60%)
    """
    try:
        prob, label = predict(customer.model_dump())
    except Exception as exc:
        logger.exception("Error en la prediccion")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return PredictionResponse(churn_probability=prob, risk_label=label)
