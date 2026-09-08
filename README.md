# SmartFin AI
## AI-Powered Personal Finance Management and Expense Prediction System

SmartFin AI is a production-style university Final Year Project (FYP) that helps users track personal finances, manage budgets & savings goals, analyze spending behavior, detect unusual financial anomalies, calculate a dynamic financial health score, and forecast future expenses using Machine Learning models (Linear Regression, Random Forest, XGBoost).

---

## 🏗️ System Architecture

```
USER
  ↓
INCOME + EXPENSE DATA
  ↓
MONGODB (Database)
  ↓
ANALYTICS ENGINE (Express Backend)
  ↓
ML DATA PREPARATION
  ↓
PYTHON ML SERVICE (FastAPI)
  ↓
MODEL TRAINING & EVALUATION (Linear Regression, Random Forest, XGBoost)
  ↓
BEST MODEL SELECTION
  ↓
EXPENSE PREDICTION & ANOMALY DETECTION (Isolation Forest)
  ↓
RECOMMENDATION ENGINE & AI ASSISTANT
  ↓
DASHBOARD / ALERTS / REPORTS (Next.js Frontend)
```

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend API**: Node.js, Express.js, TypeScript, REST APIs, JWT, bcrypt, Mongoose, Zod
- **Database**: MongoDB (Local / Atlas)
- **ML Microservice**: Python 3.11, FastAPI, Pandas, NumPy, Scikit-learn, XGBoost
- **Local AI Assistant**: Rule-based fallback engine / Optional Ollama local LLM

---

## 📂 Project Structure

```
smartfin-ai/
├── frontend/             # Next.js App Router UI
│   ├── app/              # Next.js App Router pages & layouts
│   ├── components/       # UI & Chart Components
│   ├── hooks/            # Custom React Hooks
│   ├── services/         # API Service Integration
│   └── public/           # Static Assets
├── backend/              # Node.js Express TypeScript API
│   ├── src/
│   │   ├── config/       # Environment & DB configurations
│   │   ├── controllers/  # API Controllers
│   │   ├── models/       # Mongoose Database Models (16 Collections)
│   │   ├── routes/       # Express Router Endpoints
│   │   ├── middleware/   # Auth, Validation & Error Middlewares
│   │   ├── services/     # Business & Analytics Logic
│   │   └── utils/        # Helpers & Formula Generators
│   └── server.ts         # Backend Server Entrypoint
├── ml-service/           # Python FastAPI ML Microservice
│   ├── app/
│   │   ├── models/       # ML Pipeline Definitions
│   │   ├── routes/       # FastAPI Endpoints (/predict, /train, /health)
│   │   ├── services/     # Feature Engineering & Model Selection
│   │   └── main.py       # FastAPI Entrypoint
│   ├── datasets/         # Historical Datasets
│   ├── trained_models/   # Model Persistence (.pkl)
│   └── requirements.txt  # Python Dependencies
├── docs/                 # FYP Documentation & Specifications
└── README.md             # Main System Documentation
```

---

## 🚀 How to Run Locally

### 1. Run Backend REST API Service
```bash
cd backend
npm run dev
```
- Endpoint: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

### 2. Run Python ML Microservice
```bash
cd ml-service
python app/main.py
```
- Endpoint: `http://localhost:8000`
- Health Check: `http://localhost:8000/health`
- Interactive API Docs (Swagger): `http://localhost:8000/docs`

### 3. Run Next.js Frontend App
```bash
cd frontend
npm run dev
```
- Dashboard URL: `http://localhost:3000`

---

## 📋 System Health Check Endpoints
- **Backend**: `GET http://localhost:5000/api/health`
- **ML Service**: `GET http://localhost:8000/health`
- **Frontend Dashboard**: `http://localhost:3000/`

---

## 🗓️ Phase 1 Summary & Next Steps
- **Completed**: Phase 1 — Project Architecture & Development Foundation
- **Next Phase**: Phase 2 — Database Schema & Mongoose Models (16 MongoDB Collections)
