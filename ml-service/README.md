# SmartFin AI - Python ML Microservice

FastAPI-powered machine learning microservice for **SmartFin AI**.

## Responsibilities
1. **Expense Prediction**: Training and evaluating Linear Regression, Random Forest Regressor, and XGBoost Regressor on user historical transaction data.
2. **Anomaly Detection**: Identifying unusual spikes and outlier expenses using Isolation Forest and statistical Z-Score thresholding.
3. **Spending Pattern Analytics**: Detecting categorical trends, rate of expense escalation, and seasonal variations.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python app/main.py
```

Server runs at `http://localhost:8000`. Access Swagger docs at `http://localhost:8000/docs`.
