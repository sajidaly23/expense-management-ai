from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from app.routes import health
from app.utils.config import settings

app = FastAPI(
    title="SmartFin AI - Machine Learning Microservice",
    description="Python FastAPI service handling ML Expense Predictions, Anomaly Detection, and Spending Pattern Analytics",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to SmartFin AI Machine Learning Microservice",
        "docs": "/docs",
        "health": "/health",
        "status": "ONLINE"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
