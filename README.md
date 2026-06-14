# FitStyle CRM — AI-Native Marketing Platform

A production-grade AI-powered Mini CRM platform for **FitStyle**, a retail fashion brand specializing in athletic and sports wear.

## 🏗️ Architecture

```
┌──────────────┐     ┌────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│  CRM Backend   │────▶│ Channel Service │
│  React+Vite  │     │    FastAPI      │◀────│    FastAPI      │
│   :5173      │     │    :8000        │     │    :8001        │
└──────────────┘     └───────┬────────┘     └─────────────────┘
                             │
                     ┌───────▼────────┐     ┌─────────────────┐
                     │  PostgreSQL    │     │  Groq / OpenAI  │
                     │    :5432       │     │    AI Provider   │
                     └────────────────┘     └─────────────────┘
```

## 🚀 Running the Project

You can run this project in two ways: **With Docker** (all-in-one containerized setup) or **Without Docker** (running services locally on your machine).

---

### Option 1: Running with Docker (Recommended)

#### Prerequisites
- Docker & Docker Compose installed and running

#### Steps
1. **Clone and configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your GROQ_API_KEY or OPENAI_API_KEY
   ```
2. **Start all services:**
   ```bash
   docker compose up --build
   ```
3. **Open in browser:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Channel Service Docs: [http://localhost:8001/docs](http://localhost:8001/docs)

---

### Option 2: Running without Docker (Local Machine)

This option runs the FastAPI backend and channel service in python virtual environments (`venv`), and the frontend via the `npm` dev server.

#### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** & npm installed
- **PostgreSQL** installed and running on your local machine

#### Steps

##### 1. Configure the Environment
Copy the example environment file:
```bash
cp .env.example .env
# Edit .env and supply your GROQ_API_KEY or OPENAI_API_KEY
```

##### 2. Set up the local PostgreSQL Database
On startup, the backend automatically connects to your local PostgreSQL server and creates the `fitstyle_crm` database if it doesn't already exist.

For this to work:
1. Ensure your PostgreSQL service is running on your machine.
2. In `.env`, configure the `POSTGRES_USER` and `POSTGRES_PASSWORD` variables to match your local PostgreSQL credentials (typically the default user is `postgres` and the password is the one you set during installation).
3. If you prefer manual setup instead, you can run the following SQL commands:
   ```sql
   CREATE DATABASE fitstyle_crm;
   CREATE USER fitstyle WITH PASSWORD 'fitstyle_secret';
   GRANT ALL PRIVILEGES ON DATABASE fitstyle_crm TO fitstyle;
   ```

##### 3. Run the CRM Backend
1. Open a new terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Linux/macOS:**
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. Start the backend application:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *(Note: On first startup, the database tables are auto-created and preloaded with 1000 customers, 20 products, and 5000 orders).*

##### 4. Run the Channel Service
1. Open a **second terminal** and navigate to the `channel-service/` directory:
   ```bash
   cd channel-service
   ```
2. Create and activate a Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Linux/macOS:**
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. Start the microservice:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
   ```

##### 5. Run the Frontend
1. Open a **third terminal** and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

##### 6. Access the Application
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Channel Service Docs: [http://localhost:8001/docs](http://localhost:8001/docs)

### Default Seed Data
On first startup, the backend automatically seeds:
- **20 Products** across Footwear, Clothing, Accessories
- **1,000 Customers** with realistic Indian data
- **5,000 Orders** spanning 12 months

## 📱 Features

| Feature | Description |
|---------|------------|
| **Dashboard** | KPI cards, revenue chart, AI insights |
| **Customers** | Search, filter, AI-powered customer summaries |
| **Orders** | Paginated order history with product details |
| **Segments** | Manual filter builder + AI natural language builder |
| **Campaigns** | 3-step wizard: Segment → Channel → AI Generate → Send |
| **Analytics** | Funnel, channel performance, segment analysis |
| **AI Copilot** | Chat interface for marketing assistance |

## 🤖 AI Features
- **Campaign Content Generation** — AI creates titles, subjects, and personalized messages
- **Natural Language Segmentation** — "Find customers who bought shoes but not accessories"
- **Customer Summaries** — Spend analysis, churn risk, behavior patterns
- **Marketing Insights** — Auto-generated analytics observations
- **AI Copilot** — Conversational marketing assistant

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Recharts |
| Backend | FastAPI, SQLAlchemy 2.0, PostgreSQL 16, Alembic |
| AI | Groq (llama-3.3-70b) / OpenAI (gpt-4o-mini) |
| Channel Service | FastAPI microservice with webhook simulation |
| Deployment | Docker Compose |

## 📂 Project Structure

```
CRM/
├── docker-compose.yml
├── .env
├── backend/           # CRM Backend (FastAPI)
│   ├── app/
│   │   ├── api/       # Route handlers
│   │   ├── core/      # Config, DB, auth
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   └── seed/      # Data seeding
│   └── alembic/       # Migrations
├── channel-service/   # Channel Microservice
│   └── app/
└── frontend/          # React Frontend
    └── src/
        ├── pages/     # Route pages
        ├── components/# UI components
        ├── contexts/  # React contexts
        └── lib/       # API, types, utils
```

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|------------|---------|
| `AI_PROVIDER` | `groq` or `openai` | `groq` |
| `GROQ_API_KEY` | Groq API key | — |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `JWT_SECRET` | JWT signing key | auto-generated |

## License
MIT
