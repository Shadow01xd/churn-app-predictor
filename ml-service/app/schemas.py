from typing import Literal
from pydantic import BaseModel, Field


class CustomerFeatures(BaseModel):
    """Datos de entrada de un cliente para predecir churn."""

    # Numéricas
    SeniorCitizen: int = Field(..., ge=0, le=1, description="Es adulto mayor (0=No, 1=Sí)")
    tenure: int = Field(..., ge=0, description="Meses como cliente")
    MonthlyCharges: float = Field(..., ge=0, description="Cargo mensual en USD")
    TotalCharges: float = Field(..., ge=0, description="Total acumulado pagado en USD")

    # Categóricas
    gender: Literal["Male", "Female"]
    Partner: Literal["Yes", "No"]
    Dependents: Literal["Yes", "No"]
    PhoneService: Literal["Yes", "No"]
    MultipleLines: Literal["Yes", "No", "No phone service"]
    InternetService: Literal["DSL", "Fiber optic", "No"]
    OnlineSecurity: Literal["Yes", "No", "No internet service"]
    OnlineBackup: Literal["Yes", "No", "No internet service"]
    DeviceProtection: Literal["Yes", "No", "No internet service"]
    TechSupport: Literal["Yes", "No", "No internet service"]
    StreamingTV: Literal["Yes", "No", "No internet service"]
    StreamingMovies: Literal["Yes", "No", "No internet service"]
    Contract: Literal["Month-to-month", "One year", "Two year"]
    PaperlessBilling: Literal["Yes", "No"]
    PaymentMethod: Literal[
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
    ]

    model_config = {
        "json_schema_extra": {
            "example": {
                "SeniorCitizen": 0,
                "tenure": 8,
                "MonthlyCharges": 65.5,
                "TotalCharges": 524.0,
                "gender": "Female",
                "Partner": "Yes",
                "Dependents": "No",
                "PhoneService": "Yes",
                "MultipleLines": "No",
                "InternetService": "Fiber optic",
                "OnlineSecurity": "No",
                "OnlineBackup": "No",
                "DeviceProtection": "No",
                "TechSupport": "No",
                "StreamingTV": "Yes",
                "StreamingMovies": "Yes",
                "Contract": "Month-to-month",
                "PaperlessBilling": "Yes",
                "PaymentMethod": "Electronic check",
            }
        }
    }


class PredictionResponse(BaseModel):
    """Resultado de la predicción de churn para un cliente."""

    churn_probability: float = Field(
        ..., ge=0.0, le=1.0, description="Probabilidad de churn (0 a 1)"
    )
    risk_label: Literal["bajo", "medio", "alto"] = Field(
        ..., description="Etiqueta de riesgo: bajo (<30%), medio (30-60%), alto (>60%)"
    )


class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool
