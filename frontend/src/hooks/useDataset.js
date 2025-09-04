import { useState } from 'react';
import { uploadDataset, getDatasetInfo } from '../services/api';

export const useDataset = () => {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const fetchDatasetInfo = async () => {
    try {
      const data = await getDatasetInfo();
      setDatasetInfo(data);
    } catch (error) {
      console.error("Error fetching dataset info:", error);
    }
  };

  const handleFileChange = (file) => {
    setFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split('\n').slice(0, 11);
        setPreviewData(rows.map(row => row.split(',')));
      };
      reader.readAsText(file);
    }
  };

  const handleUpload = async (file, targetColumn) => {
    if (!file) return false;

    try {
      await uploadDataset(file, targetColumn);
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
    fetchDatasetInfo,
    handleFileChange,
    handleUpload
  };
};