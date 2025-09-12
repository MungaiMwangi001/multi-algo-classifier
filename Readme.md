ML Workbench
============

Project Overview
----------------

This repository contains a full-stack Machine Learning Workbench designed to allow users to upload datasets, train models, evaluate performance, and obtain predictions via a web interface and APIs. The project is split into two main parts:

*   backend/ — FastAPI service for dataset management, training orchestration, model persistence, and predictions.
    
*   frontend/ — React + TypeScript web application providing UI for dataset upload, training, model selection, and predictions.
    

The application is intended to support both local and cloud-based training workflows. Because local hardware is constrained, we plan to offer Google Colab and cloud training options for customers to run training jobs on GPUs/TPUs.

Key Features
------------

*   Upload datasets (CSV) and manage datasets in the app
    
*   Training orchestration (enqueue training jobs, run workers)
    
*   Model persistence and versioning
    
*   Prediction endpoint to serve model predictions
    
*   Interactive UI for dataset & model selection, feature input, and results visualization
    
*   Default dataset available when no dataset is provided
    
*   Optional Google Colab integration for training on remote compute
    
*   Containerized deployment using Docker and an Nginx reverse proxy
    

Tech Stack
----------

*   **Backend:** Python, FastAPI, Uvicorn, Celery (or RQ), SQLAlchemy (or another ORM), joblib/pickle for model persistence
    
*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Radix UI primitives
    
*   **Storage/Infrastructure:** Local filesystem for dev, S3 or Google Cloud Storage for production model & dataset storage
    
*   **CI/CD / Deployment:** Docker, docker-compose for local/dev. Production deploy via AWS ECS / GCP Cloud Run / Kubernetes + GitHub Actions.
    

Repository Structure (selected)
-------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   backend/    Dockerfile    docker-compose.yml    app/      api/        datasets.py        # dataset routes (upload, list)        training.py        # training orchestration routes        prediction.py      # prediction endpoints        models.py          # model management endpoints      core/        config.py          # config & env handling        database.py        logging.py      ml/        preprocessing.py        training.py        persistence.py     # save/load models      schemas/             # Pydantic request/response schemas      main.py  frontend/    src/      pages/               # React pages: Datasets, Training, Prediction, Models      components/          # UI components and Radix wrapper components      services/api.ts      # Axios wrapper for backend APIs    package.json   `

(Full file list is available in the repository.)

Getting Started (Local Development)
-----------------------------------

### Prerequisites

*   Docker & docker-compose
    
*   Node.js (for running frontend locally without Docker)
    
*   Python 3.11 (if running backend locally without Docker)
    

### Environment

Copy .env.example files to .env or set environment variables for production credentials (DB URL, storage bucket credentials, etc.). Example variables include:

*   BACKEND\_HOST, BACKEND\_PORT
    
*   DATABASE\_URL
    
*   MODEL\_STORAGE\_BUCKET (S3/GCS)
    
*   CELERY\_BROKER\_URL (Redis URL)
    

### Run with Docker Compose (recommended for local dev)

From the repository root:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # Build and start containers  docker-compose -f backend/docker-compose.yml up --build   `

This will start the backend service and any declared services (e.g., Redis for Celery) and expose the API on the configured port (default 8000).

### Running front-end locally (non-Docker)

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd frontend  npm install  npm run dev   `

By default the frontend will proxy API requests to http://localhost:8000 (see frontend/.env.example).

Backend API Endpoints (high level)
----------------------------------

*   POST /api/datasets/upload — Upload dataset (multipart/form-data). Returns dataset metadata and stored path.
    
*   GET /api/datasets — List available datasets (default + uploaded)
    
*   POST /api/training — Start a training job: payload includes dataset\_id, target\_column, model\_type, and training parameters.
    
*   GET /api/training/{job\_id} — Check job status and logs.
    
*   GET /api/models — List trained models and versions.
    
*   POST /api/predict — Make a prediction using a specified model (or the default model). Accepts features as JSON.
    

Refer to backend/app/api/\*.py for full request/response schemas and implementations.

Frontend Notes
--------------

*   Uses Radix UI primitives and custom components in frontend/src/components/ui.
    
*   Pages of interest:
    
    *   Datasets.tsx — Upload, list, and select datasets.
        
    *   Training.tsx — Configure and launch trainings.
        
    *   Prediction.tsx — Select model/dataset and input features for prediction.
        
    *   Models.tsx — View model versions and metrics.
        
*   Axios wrapper (services/api.ts) centralizes API calls and error handling.
    
*   Accessibility: dialogs (Radix) must include DialogTitle and DialogDescription to avoid accessibility warnings.
    

Training Flow and Model Persistence
-----------------------------------

1.  User uploads dataset via the frontend. The frontend issues POST /api/datasets/upload and receives a dataset ID and storage path.
    
2.  To train, the frontend calls POST /api/training with the dataset ID and training configuration.
    
3.  Backend enqueues a training job (Celery/RQ). Worker performs:
    
    *   Download dataset from storage (local or S3/GCS)
        
    *   Preprocess using ml/preprocessing.py (type inference, missing value handling, encoding)
        
    *   Train model via ml/training.py (scikit-learn, PyTorch, or TensorFlow depending on model type)
        
    *   Save trained model artifact via ml/persistence.py (joblib/pickle or ONNX)
        
    *   Persist metadata in DB (model id, dataset id, metrics, path to artifact)
        
4.  Frontend polls training job status and receives training metrics when complete.
    

Prediction Flow
---------------

*   A request to POST /api/predict references a model\_id or uses the default model. The backend loads the model artifact into memory, applies necessary preprocessing to the input features (same pipeline used during training), and returns predictions. In production, consider a model cache or a model serving layer (e.g., TorchServe, TensorFlow Serving, or a dedicated microservice) for lower latency.
    

Default Dataset and Model
-------------------------

*   The project provides a default dataset (stored in backend/app/ml/default\_dataset.csv or in cloud storage) that each preconfigured model can be trained on. This allows the application to function when no user dataset is provided.
    
*   Default models are pre-trained on that dataset during CI/CD or provided as part of the artifact store.
    

Google Colab Integration (Planned)
----------------------------------

Because this project is intended to be usable by users who may not have access to GPU/TPU locally, we plan to provide two complementary Colab-focused workflows:

### 1\. Colab Notebook Template

*   Provide a parameterized Colab notebook in docs/colab/ that contains:
    
    *   Dataset download code (from a secure URL or cloud storage)
        
    *   Preprocessing steps that mirror ml/preprocessing.py
        
    *   Training code for supported model types
        
    *   Saving trained artifacts to Google Drive or cloud storage
        
*   The notebook is parameterized with variables such as DATASET\_URL, TARGET\_COLUMN, MODEL\_TYPE so the notebook can be run directly by users with minimal changes.
    

### 2\. Automated Notebook Execution (optional)

*   For a more integrated experience, the backend can programmatically execute notebooks using tooling such as **Papermill**. Steps:
    
    *   Backend uploads dataset to Google Drive or a public-but-expiring signed URL.
        
    *   Use Papermill to inject parameters into the Colab notebook and execute it on a trusted runner (Note: executing notebooks directly on Colab programmatically may require additional authentication flow and is less straightforward than running locally).
        
    *   Alternatively, provide users a single-click link that opens the Colab notebook with DATASET\_URL and other parameters pre-filled (colab.research.google.com supports URL parameterization for GitHub-hosted notebooks).
        

### 3\. Security & Quotas

*   Google Colab is not a production-grade compute service. It has resource limits and is intended for ad-hoc runs or prototyping.
    
*   For production or high-volume use, we recommend cloud training (AWS/GCP/Azure) where jobs are run on managed instances or Kubernetes clusters.
    

Production Deployment Plan
--------------------------

### Containerization

*   Backend: Dockerfile (already present). Run with Gunicorn + Uvicorn workers behind Nginx.
    
*   Frontend: Build static assets and serve via CDN or Nginx.
    

### Proposed Cloud Architecture

*   **Compute**: Kubernetes (EKS/GKE/AKS) or serverless containers (Cloud Run / AWS Fargate)
    
*   **Storage**: S3 or GCS for datasets and model artifacts
    
*   **Message Broker**: Redis or RabbitMQ for Celery
    
*   **Database**: Postgres (RDS / Cloud SQL)
    
*   **CI/CD**: GitHub Actions pipeline that builds and publishes Docker images to a container registry and triggers deployments
    
*   **Monitoring / Logging**: Prometheus, Grafana, Loki, Sentry for error reporting
    

### Model Serving

*   For production predictions consider either:
    
    *   A lightweight /predict API that loads a model and predicts (sufficient for low traffic)
        
    *   Dedicated model server (TorchServe, TensorFlow Serving, or custom Flask/FastAPI microservice) for high throughput and autoscaling
        

### Security

*   Use signed URLs for direct dataset downloads.
    
*   Secure API endpoints with authentication (JWT or OAuth2). Protect admin-only endpoints.
    
*   Sanitize uploaded files and run basic validation checks before processing.
    

CI/CD and Prebuilt Artifacts
----------------------------

*   Store pre-trained default models as artifacts in the registry or object storage so deployments come with a working default model.
    
*   In CI pipeline run smoke tests that:
    
    *   Verify API contract endpoints
        
    *   Run a small training job with the default dataset and ensure end-to-end predict flow works
        

Testing
-------

*   Unit tests for preprocessing and training logic (backend/app/ml/tests)
    
*   Integration tests for API endpoints (use FastAPI TestClient)
    
*   Frontend component tests (React Testing Library)
    

Troubleshooting Tips
--------------------

*   Radix Dialog accessibility warnings: ensure every DialogContent includes a DialogTitle and either DialogDescription or aria-describedby. If you want them hidden, wrap them with VisuallyHidden.
    
*   500 errors on /api/datasets/upload: check backend logs (uvicorn) for tracebacks, ensure multipart/form-data is used client-side, and verify file save paths exist and have correct permissions.
    
*   If training jobs are stuck: ensure the message broker (Redis/RabbitMQ) is running and Celery workers are connected.
    

Candidate Notes
---------------

This project demonstrates:

*   End-to-end ML product design: from data ingestion, preprocessing, training orchestration, to model serving.
    
*   Full-stack delivery with a React TypeScript frontend and a Python FastAPI backend.
    
*   Focus on reproducibility and operational concerns: containerization, background workers, model persistence, and monitoring.
    
*   Practical trade-offs: use Google Colab for ad-hoc GPU/TPU training during prototyping; adopt cloud training for production-grade workloads.
    

What I implemented / owned (example contributions you can list):

*   Designed and implemented the dataset upload flow and validation.
    
*   Implemented training orchestration and worker pipeline.
    
*   Built the prediction API and frontend UX for entering features and viewing results.
    
*   Created a parameterized Colab notebook and documented the Colab workflow for users.
    
*   Containerized backend and provided docker-compose for local development.
    

Next Steps / Roadmap
--------------------

*   Implement automated Colab execution or an integrated cloud-training service (managed worker pool).
    
*   Add authentication and per-user model isolation—each user should have private dataset/model namespaces.
    
*   Add model explainability: SHAP/LIME visualizations in the UI.
    
*   Add scheduled retraining and model lifecycle management (expire / archive models).
    

How to Contact / Contribute
---------------------------

*   For issues and feature requests: open an issue in this repository.
    
*   To contribute: fork the repository, create a feature branch, and open a pull request with tests and documentation.
    

License
-------

This project is released under the MIT License. See LICENSE for details.