import axios from "axios";

const API_BASE = "http://localhost:8000"; // replace with your backend URL

export const uploadDataset = (formData) => axios.post(`${API_BASE}/upload-dataset`, formData);
export const fetchDatasetInfo = () => axios.get(`${API_BASE}/dataset-info`);
export const trainModel = (payload) => axios.post(`${API_BASE}/train`, payload);
export const trainAllModels = (payload) => axios.post(`${API_BASE}/train-all`, payload);
export const saveModel = (payload) => axios.post(`${API_BASE}/save-model`, payload);
export const fetchSavedModels = () => axios.get(`${API_BASE}/saved-models`);
export const predict = (modelId, data) => axios.post(`${API_BASE}/predict/${modelId}`, data);
