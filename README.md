# QuantTaaS — Quantization and Pruning as a Service

A cloud-based platform that lets users compress pre-trained NLP models using **pruning** and **quantization**, making them faster and smaller for deployment on edge devices and resource-constrained environments.

> Built as a distributed microservices system using Flask, React, Kafka, MongoDB, MinIO, Redis, PyTorch, and Docker — deployed on AWS EC2.

---

## What It Does

Users upload a pre-trained HuggingFace transformer model and a test dataset (CSV). The platform:

1. Applies **unstructured pruning** (L1 norm) and **structured pruning** (attention head pruning) to reduce model weights
2. Applies **dynamic quantization** (INT8) to reduce model precision
3. Evaluates the **original**, **pruned**, and **quantized** models on accuracy and model size
4. Displays side-by-side comparison results in the dashboard

### Supported Tasks
| Task | Example Models |
|------|---------------|
| Sentiment Classification | DistilRoberta, FinBERT, FinTwitBERT |
| Question Answering | Custom HuggingFace models |
| Summarization | T5, BART-based models |
| Machine Translation | Helsinki-NLP models |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                    React Frontend (port 3000)                │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────────────┐
│                  Flask Backend (port 5002)                    │
│         Auth │ Job Submission │ Results │ Model Download      │
└────┬─────────────┬──────────────────┬───────────────────────┘
     │             │                  │
     ▼             ▼                  ▼
  MongoDB        Kafka            MinIO
  (metadata,   (job queue)      (model files,
   results)                      datasets)
                  │
                  ▼
     ┌────────────────────────┐
     │    Trainer Service      │
     │  - Load HF model        │
     │  - Apply pruning        │
     │  - Apply quantization   │
     │  - Evaluate metrics     │
     │  - Save to MinIO        │
     └────────────┬───────────┘
                  │ Kafka
                  ▼
     ┌────────────────────────┐
     │  Job Status Service     │
     │  - Listen for results   │
     │  - Update MongoDB       │
     └────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Material UI, Chart.js, Axios |
| Backend | Python, Flask, Flask-Login, Flask-CORS |
| Trainer | PyTorch, HuggingFace Transformers, Evaluate |
| Message Queue | Apache Kafka |
| Object Storage | MinIO (S3-compatible) |
| Database | MongoDB Atlas |
| Cache / Sessions | Redis |
| Containerization | Docker |
| Orchestration | Kubernetes (GKE manifests included) |
| Cloud | AWS EC2 |

---

## Project Structure

```
├── backend-service/        # Flask REST API
│   └── backend_server/
│       ├── auth.py         # Login / Signup
│       ├── submit_job.py   # Job submission endpoint
│       ├── prev_runs.py    # Fetch past jobs
│       ├── current_run.py  # Fetch running jobs
│       ├── minio_utils.py  # MinIO file operations
│       ├── kafka_utils.py  # Kafka producer
│       └── mongo_utils.py  # MongoDB operations
│
├── trainer-service/        # ML optimization worker
│   └── src/
│       ├── trainer.py      # Pruning + quantization logic
│       ├── runner.py       # Kafka consumer loop
│       ├── models.py       # HuggingFace model loader
│       ├── dataset.py      # Dataset loader + tokenizer
│       └── connection.py   # Kafka + MinIO connections
│
├── job-status-service/     # Job completion listener
│   ├── run.py              # Kafka consumer → MongoDB updater
│   └── kafka_util.py       # Kafka consumer config
│
├── ui-service/             # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx       # Main dashboard (Running/Completed tabs)
│       │   ├── RunningStats.jsx    # Live job status
│       │   ├── CompletedStats.jsx  # Completed jobs table
│       │   ├── Login.jsx           # Login page
│       │   └── Signup.jsx          # Signup page
│       └── components/
│           ├── AddJobModal.jsx         # Job submission form
│           └── OptimizationResults.jsx # Results charts
│
└── Deployments/
    └── Kubernetes/         # K8s manifests for GKE deployment
```

---

## How a Job Works

1. User logs in and clicks **Add Job** on the dashboard
2. Fills in: experiment name, task type, model name, uploads a CSV test dataset
3. Frontend sends a `POST /submit-job` to the Flask backend
4. Backend:
   - Uploads the CSV to **MinIO**
   - Records job metadata in **MongoDB**
   - Publishes a message to the **Kafka** `submit_job` topic
5. **Trainer Service** picks up the Kafka message and:
   - Downloads the CSV from MinIO
   - Loads the HuggingFace model
   - Applies L1 unstructured pruning + attention head pruning
   - Applies dynamic INT8 quantization
   - Measures model size (MB) for all three versions
   - Saves models back to MinIO
   - Publishes results to `completed_job` Kafka topic
6. **Job Status Service** picks up the completion message and updates MongoDB
7. Frontend polls the backend and displays results in the **Completed** tab

---

## Running Locally

### Prerequisites
- Docker
- Python 3.10+
- Node.js 18+

### 1. Start Infrastructure (Docker)

```bash
# MinIO
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"

# Redis
docker run -d --name redis -p 6379:6379 redis

# Kafka
docker run -d --name kafka -p 9092:9092 \
  -e KAFKA_NODE_ID=1 \
  -e KAFKA_PROCESS_ROLES=broker,controller \
  -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
  -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_AUTO_CREATE_TOPICS_ENABLE=true \
  -e CLUSTER_ID=5L6g3nShT-eMCtK--X86sw \
  apache/kafka:latest
```

### 2. Configure Environment Variables

Create a `.env` file in `backend-service/`, `job-status-service/`, and `trainer-service/`:

```env
MONGO_ATLAS_SECRET=your_mongodb_password
```

### 3. Start Backend

```bash
cd backend-service
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### 4. Start Job Status Service

```bash
cd job-status-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python run.py
```

### 5. Start Trainer Service

```bash
cd trainer-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python run.py
```

### 6. Start Frontend

```bash
cd ui-service
npm install
npm start
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:5002`.

---

## Deploying on AWS EC2

1. Launch an `m7i.large` EC2 instance (Ubuntu 24.04, 20GB storage)
2. Install Docker and clone the repo
3. Start MinIO, Redis, and Kafka as Docker containers
4. Set up `.env` files with MongoDB credentials
5. Run backend, trainer, and job-status services
6. Point the React frontend’s `API_URL` to the EC2 public IP

See `Deployments/Kubernetes/` for full Kubernetes manifests for production deployment on GKE.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create a new user account |
| POST | `/login` | Authenticate user |
| POST | `/submit-job` | Submit a model optimization job |
| GET | `/prev-runs` | Get all completed jobs for user |
| GET | `/current-run` | Get currently running jobs |
| GET | `/download-model` | Download optimized model from MinIO |

