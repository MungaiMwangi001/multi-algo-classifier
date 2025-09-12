import axios, { AxiosResponse } from 'axios';

// Configure axios base URL - can be overridden by environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface Dataset {
  id: string;
  name: string;
  rows: number;
  columns: number;
  target_column?: string;
  created_at: string;
}

export interface DatasetUploadResponse extends Dataset {
  preview: string[][];
}

export interface TrainingJob {
  job_id: string;
  status: 'queued' | 'running' | 'finished' | 'failed';
  progress?: number;
  logs?: string[];
}

export interface Model {
  model_id: string;
  algorithm: string;
  dataset_id: string;
  accuracy: number;
  created_at: string;
  params: Record<string, any>;
}

export interface ModelMetrics {
  accuracy: number;
  confusion_matrix: number[][];
  fpr: number[];
  tpr: number[];
  feature_importance: Array<{ feature: string; importance: number }>;
  classification_report: Record<string, any>;
}

export interface PredictionResponse {
  prediction: string;
  probability: number;
}

export interface TrainingRequest {
  dataset_id: string;
  algorithm: string;
  params: Record<string, any>;
  test_size: number;
  random_state: number;
}

export interface PredictionRequest {
  model_id: string;
  input: Record<string, any>;
}

// API service functions
export const apiService = {
  // Dataset endpoints
  async getDatasets(): Promise<Dataset[]> {
    const response: AxiosResponse<Dataset[]> = await api.get('/datasets/');
    return response.data;
  },

  async uploadDataset(file: File, name?: string, targetColumn?: string): Promise<DatasetUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (targetColumn) formData.append('target_column', targetColumn);
    
    const response: AxiosResponse<DatasetUploadResponse> = await api.post(
      '/datasets/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async deleteDataset(datasetId: string): Promise<void> {
    await api.delete(`/datasets/${datasetId}`);
  },

  // Training endpoints
  async startTraining(request: TrainingRequest): Promise<TrainingJob> {
    const response: AxiosResponse<TrainingJob> = await api.post('/training/start', request);
    return response.data;
  },

  async getTrainingStatus(jobId: string): Promise<TrainingJob> {
    const response: AxiosResponse<TrainingJob> = await api.get(`/training/status?job_id=${jobId}`);
    return response.data;
  },

  async getTrainingJobs(): Promise<TrainingJob[]> {
    const response: AxiosResponse<TrainingJob[]> = await api.get('/training/jobs');
    return response.data;
  },

  // Model endpoints
  async getModels(): Promise<Model[]> {
    const response: AxiosResponse<Model[]> = await api.get('/models/');
    return response.data;
  },

  async getModelMetrics(modelId: string): Promise<ModelMetrics> {
    const response: AxiosResponse<ModelMetrics> = await api.get(`/models/${modelId}/metrics`);
    return response.data;
  },

  async deleteModel(modelId: string): Promise<void> {
    await api.delete(`/models/${modelId}`);
  },

  // Prediction endpoints
  async predict(request: PredictionRequest): Promise<PredictionResponse> {
    const response: AxiosResponse<PredictionResponse> = await api.post('/predict/', request);
    return response.data;
  },
};

// Error handling wrapper
export const handleAPIError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};