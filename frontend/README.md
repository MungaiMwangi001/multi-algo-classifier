# ML Studio - Machine Learning Platform

A modern, professional machine learning web application built with React, TypeScript, and Tailwind CSS. Features dataset management, model training, performance evaluation, and prediction capabilities.

## 🚀 Features

- **Dashboard**: Overview with stats and quick actions
- **Dataset Management**: Upload, preview, and manage CSV datasets
- **Model Training**: Train multiple ML algorithms with customizable parameters
- **Performance Analysis**: Comprehensive metrics with interactive charts
- **Predictions**: Single sample and bulk prediction capabilities
- **Model Management**: View, compare, and manage trained models

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Charts**: Chart.js with React integration
- **State Management**: React Query, Context API
- **File Handling**: react-dropzone, papaparse
- **API Client**: Axios

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ml-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 🔌 Backend Integration

Configure your backend API URL in the `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Expected API endpoints:
- `GET /api/datasets` - List datasets
- `POST /api/datasets/upload` - Upload dataset
- `POST /api/training/start` - Start training
- `GET /api/training/status` - Training status
- `GET /api/models` - List models
- `GET /api/models/{id}/metrics` - Model metrics
- `POST /api/predict` - Make predictions

## 🎨 Design System

The application uses a professional purple/cyan color scheme with:
- Semantic color tokens for consistent theming
- Custom chart colors for data visualization
- Responsive design with mobile-first approach
- Accessible components with proper ARIA labels

## 📱 Pages Overview

1. **Dashboard** - Project overview and quick actions
2. **Datasets** - Upload and manage training data
3. **Training** - Configure and start model training
4. **Models** - View and manage trained models
5. **Results** - Analyze model performance with charts
6. **Prediction** - Make single or bulk predictions
7. **Settings** - App configuration and information

## 🚀 Deployment

Build the application for production:

```bash
npm run build
```

Deploy the `dist` folder to your preferred hosting service.

## 📝 License

This project is licensed under the MIT License.