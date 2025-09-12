# ML Workbench Backend API

A comprehensive FastAPI backend for machine learning operations including dataset management, model training, and predictions.

## 🚀 Features

- **Dataset Management**: Upload, validate, and manage CSV/XLSX datasets
- **ML Training**: Train various classification models (Logistic Regression, Random Forest, Decision Tree, Gradient Boosting, SVM)
- **Model Persistence**: Save and manage trained models with metadata
- **Predictions**: Make single and batch predictions using trained models
- **Background Jobs**: Asynchronous training with progress tracking
- **Comprehensive Logging**: Structured logging with JSON format
- **RESTful API**: Clean, well-documented API endpoints
- **Docker Support**: Containerized deployment with Docker Compose

## 🛠 Tech Stack

- **Python 3.11+**
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Database ORM
- **scikit-learn** - Machine learning library
- **pandas** - Data manipulation
- **Pydantic** - Data validation
- **Docker** - Containerization

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/                 # API routers
│   │   ├── datasets.py     # Dataset management
│   │   ├── models.py       # Model management
│   │   ├── training.py     # Training jobs
│   │   └── prediction.py   # Predictions
│   ├── core/               # Core functionality
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database models
│   │   └── logging.py      # Logging setup
│   ├── ml/                 # ML logic
│   │   ├── preprocessing.py # Data preprocessing
│   │   ├── training.py     # Model training
│   │   └── persistence.py  # Model persistence
│   ├── schemas/            # Pydantic schemas
│   │   ├── dataset.py      # Dataset schemas
│   │   ├── model.py        # Model schemas
│   │   ├── training.py     # Training schemas
│   │   ├── prediction.py   # Prediction schemas
│   │   └── common.py       # Common schemas
│   └── main.py             # FastAPI app
├── logs/                   # Log files
├── models/                 # Saved models
├── uploads/                # Uploaded datasets
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
└── README.md              # This file
```

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the API:**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Local Development

1. **Install Python 3.11+**

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📚 API Documentation

### Core Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation
- `GET /redoc` - Alternative API documentation

### Dataset Management

- `GET /api/datasets` - List all datasets
- `POST /api/datasets/upload` - Upload new dataset
- `GET /api/datasets/{id}` - Get dataset details
- `PUT /api/datasets/{id}` - Update dataset
- `DELETE /api/datasets/{id}` - Delete dataset
- `GET /api/datasets/{id}/info` - Get detailed dataset info

### Model Management

- `GET /api/models` - List all models
- `GET /api/models/{id}` - Get model details
- `GET /api/models/{id}/metrics` - Get model metrics
- `DELETE /api/models/{id}` - Delete model
- `GET /api/models/algorithms/available` - List available algorithms
- `GET /api/models/algorithms/{algorithm}/params` - Get algorithm parameters

### Training

- `POST /api/training/start` - Start training job
- `GET /api/training/status` - Get training status
- `GET /api/training/jobs` - List training jobs
- `DELETE /api/training/jobs/{id}` - Cancel training job

### Predictions

- `POST /api/predict/` - Make single prediction
- `POST /api/predict/batch` - Make batch predictions
- `GET /api/predict/{model_id}/info` - Get prediction info
- `GET /api/predict/models/active` - List active models

## 🔧 Configuration

The application can be configured using environment variables. Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

### Key Configuration Options

- `DEBUG` - Enable debug mode
- `DATABASE_URL` - Database connection string
- `MAX_FILE_SIZE` - Maximum upload file size
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARNING, ERROR)
- `MODEL_RETENTION_DAYS` - Days to keep old models

## 🤖 Supported ML Algorithms

1. **Logistic Regression** - Linear classification
2. **Random Forest** - Ensemble method
3. **Decision Tree** - Tree-based classification
4. **Gradient Boosting** - Boosting ensemble
5. **Support Vector Machine (SVM)** - Kernel-based classification

## 📊 Data Processing

- **File Formats**: CSV, XLSX, XLS
- **Data Cleaning**: Automatic duplicate removal, missing value handling
- **Feature Engineering**: Categorical encoding, scaling
- **Validation**: Comprehensive data validation and statistics

## 🔍 Monitoring and Logging

- **Structured Logging**: JSON-formatted logs in `logs/app.log`
- **Health Checks**: Built-in health monitoring
- **Error Handling**: Comprehensive error responses
- **Progress Tracking**: Real-time training progress updates

## 🚀 Production Deployment

### Using Docker Compose

1. **For development:**
   ```bash
   docker-compose up --build
   ```

2. **For production:**
   ```bash
   docker-compose --profile production up -d
   ```

### Environment Variables for Production

```bash
DEBUG=false
LOG_LEVEL=INFO
DATABASE_URL=postgresql://user:password@localhost/ml_workbench
ALLOWED_ORIGINS=["https://yourdomain.com"]
```

## 🧪 Testing

Run tests (when implemented):
```bash
pytest
```

## 📈 Performance Considerations

- **File Upload Limits**: 50MB default maximum
- **Model Storage**: Automatic cleanup of old models
- **Background Processing**: Asynchronous training jobs
- **Database Optimization**: Indexed queries for better performance

## 🔒 Security Features

- **Input Validation**: Comprehensive data validation
- **File Type Validation**: Restricted file upload types
- **Error Handling**: Secure error responses
- **CORS Configuration**: Configurable cross-origin requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the logs in `logs/app.log`
3. Check the health endpoint at `/health`

## 🔄 Next Steps for Production

1. **Database Migration**: Set up proper database migrations with Alembic
2. **Authentication**: Add user authentication and authorization
3. **Rate Limiting**: Implement API rate limiting
4. **Monitoring**: Add application monitoring (Prometheus, Grafana)
5. **Caching**: Implement Redis caching for better performance
6. **Load Balancing**: Set up load balancing for high availability
7. **Backup Strategy**: Implement automated backups
8. **CI/CD Pipeline**: Set up continuous integration and deployment
