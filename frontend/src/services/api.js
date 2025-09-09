import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Mock data for demonstration
const mockResults = [
  {
    algorithm: 'Logistic Regression',
    accuracy: 0.85,
    precision: 0.83,
    recall: 0.87,
    classification_report: {
      '0': { precision: 0.82, recall: 0.88, 'f1-score': 0.85, support: 120 },
      '1': { precision: 0.88, recall: 0.82, 'f1-score': 0.85, support: 130 }
    }
  },
  {
    algorithm: 'Random Forest',
    accuracy: 0.92,
    precision: 0.91,
    recall: 0.93,
    classification_report: {
      '0': { precision: 0.90, recall: 0.94, 'f1-score': 0.92, support: 120 },
      '1': { precision: 0.94, recall: 0.90, 'f1-score': 0.92, support: 130 }
    }
  },
  {
    algorithm: 'SVM',
    accuracy: 0.88,
    precision: 0.87,
    recall: 0.89,
    classification_report: {
      '0': { precision: 0.86, recall: 0.90, 'f1-score': 0.88, support: 120 },
      '1': { precision: 0.90, recall: 0.86, 'f1-score': 0.88, support: 130 }
    }
  }
];

// Upload dataset
export const uploadDatasetApi = (formData) => {
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Fetch dataset info
export const fetchDatasetInfoApi = () => {
  return api.get('/dataset-info');
};

// Train specific models
export const trainModelApi = (algorithms) => {
  // For demo purposes, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockResults.filter(result => 
        algorithms.some(algo => result.algorithm.toLowerCase().includes(algo))
      )});
    }, 2000);
  });
  // In production, use:
  // return api.post('/train', { algorithms });
};

// Train all models
export const trainAllModelsApi = () => {
  // For demo purposes, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockResults });
    }, 3000);
  });
  // In production, use:
  // return api.post('/train-all');
};

// Save model
export const saveModelApi = (modelData) => {
  return api.post('/save-model', modelData);
};

// Fetch saved models
export const fetchSavedModelsApi = () => {
  return api.get('/saved-models');
};

// Make prediction
export const predictApi = (data) => {
  return api.post('/predict', data);
};

export default api;