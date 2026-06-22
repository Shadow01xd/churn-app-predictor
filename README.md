# ChurnGuard

Plataforma de predicción de abandono de clientes (churn) para empresas de telecomunicaciones. Permite visualizar en un dashboard los clientes ordenados por probabilidad de cancelación para que el equipo de retención pueda actuar a tiempo.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite |
| Backend | NestJS (Node.js) |
| Microservicio ML | Python + FastAPI |
| Base de datos | PostgreSQL |
| Auth | JWT |
| Infraestructura | Docker / Docker Compose |

## Arquitectura

```
React (frontend)
    │
    ▼
NestJS API (backend)  ──►  FastAPI ML Service (predicción)
    │
    ▼
PostgreSQL (base de datos)
```

El frontend consume la API de NestJS. NestJS maneja autenticación, lógica de negocio y persistencia. Para las predicciones de churn, NestJS delega la inferencia al microservicio Python vía HTTP. El modelo de ML vive exclusivamente en el microservicio Python.

## Estructura del repositorio

```
/ml            → Notebooks de exploración y entrenamiento del modelo
  /data        → Dataset crudo (no se versiona)
  /notebooks   → Jupyter notebooks
  /models      → Modelos entrenados exportados (.pkl)

/ml-service    → Microservicio FastAPI que sirve el modelo
  /app         → Código fuente de la API Python

/api           → Backend NestJS
  /src         → Código fuente

/frontend      → Aplicación React
  /src         → Código fuente
```

## Dataset

Telco Customer Churn (Kaggle) — ~7.000 clientes con variables de contrato, servicio y uso, etiquetados con si cancelaron o no.

## Levantar el entorno de desarrollo

### Base de datos

```bash
docker compose up -d
```

### Variables de entorno

```bash
cp .env.example .env
# Completar los valores en .env
```
