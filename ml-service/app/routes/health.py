from fastapi import APIRouter
from datetime import datetime
import sys

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SmartFin AI Python ML Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "python_version": sys.version,
        "models_available": ["LinearRegression", "RandomForestRegressor", "XGBoostRegressor", "IsolationForest"]
    }
