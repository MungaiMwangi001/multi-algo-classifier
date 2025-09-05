import axios from "axios";

const API_BASE = "http://localhost:8000"; // replace with your backend URL

export const uploadDatasetApi = (formData) =>
  axios.post(`${API_BASE}/upload-dataset`, formData);

export const fetchDatasetInfoApi = () =>
  axios.get(`${API_BASE}/dataset-info`);

export const trainModelApi = (payload) =>
  axios.post(`${API_BASE}/train`, payload);

export const trainAllModelsApi = (payload) =>
  axios.post(`${API_BASE}/train-all`, payload);

export const saveModelApi = (payload) =>
  axios.post(`${API_BASE}/save-model`, payload);

export const fetchSavedModelsApi = () =>
  axios.get(`${API_BASE}/saved-models`);

export const predictApi = (modelId, data) =>
  axios.post(`${API_BASE}/predict/${modelId}`, data);
