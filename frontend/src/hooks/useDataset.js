import { useState } from "react";
import  useApi from "./useApi";
import { uploadDatasetApi, fetchDatasetInfoApi } from "../services/api";

/**
 * useDataset - handles dataset upload, preview, and info fetching
 */
export const useDataset = () => {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [file, setFile] = useState(null);

  const { loading, error, callApi } = useApi();

  /**
   * Fetch dataset info from backend
   */
  const fetchDatasetInfo = async () => {
    const data = await callApi(fetchDatasetInfoApi);
    if (data) setDatasetInfo(data);
  };

  /**
   * Handle file selection & generate preview
   */
  const handleFileChange = (file) => {
    setFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split("\n").slice(0, 11); // Preview first 10 rows
        setPreviewData(rows.map((row) => row.split(",")));
      };
      reader.readAsText(file);
    }
  };

  /**
   * Upload dataset file and fetch dataset info
   */
  const handleUpload = async (targetColumn) => {
    if (!file) return false;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_column", targetColumn);

      await callApi(uploadDatasetApi, formData);
      await fetchDatasetInfo();
      return true;
    } catch (error) {
      console.error("Error uploading dataset:", error);
      return false;
    }
  };

  return {
    datasetInfo,
    previewData,
    file,
    loading,
    error,
    fetchDatasetInfo,
    handleFileChange,
    handleUpload,
  };
};
