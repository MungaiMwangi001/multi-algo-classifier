// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  uploadDatasetApi,
  fetchDatasetInfoApi,
  trainModelApi,
  trainAllModelsApi,
  saveModelApi,
  fetchSavedModelsApi,
  predictApi,
} from "./services/api";

const App = () => {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [file, setFile] = useState(null);
  const [targetColumn, setTargetColumn] = useState("");
  const [savedModels, setSavedModels] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ load dataset info
  const fetchDatasetInfo = async () => {
    try {
      const response = await fetchDatasetInfoApi();
      setDatasetInfo(response.data);
    } catch (err) {
      console.error("Error fetching dataset info:", err);
    }
  };

  // ✅ load saved models
  const fetchModels = async () => {
    try {
      const response = await fetchSavedModelsApi();
      setSavedModels(response.data);
    } catch (err) {
      console.error("Error fetching saved models:", err);
    }
  };

  // ✅ file preview handler
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split("\n").slice(0, 11); // preview first 10 rows
        setPreviewData(rows.map((row) => row.split(",")));
      };
      reader.readAsText(selectedFile);
    }
  };

  // ✅ upload dataset
  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_column", targetColumn);

    try {
      await uploadDatasetApi(formData);
      await fetchDatasetInfo(); // refresh info after upload
      alert("Dataset uploaded successfully!");
    } catch (err) {
      console.error("Error uploading dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetInfo();
    fetchModels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">ML Pipeline Dashboard</h1>
          <p className="text-gray-600">Upload, analyze, and train models on your datasets</p>
        </header>

        {/* Dataset upload */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Dataset</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Column</label>
              <input
                type="text"
                placeholder="Enter target column name"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <button 
            onClick={handleUpload} 
            disabled={loading}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : "Upload Dataset"}
          </button>
        </section>

        {/* Preview */}
        {previewData && (
          <section className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dataset Preview</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, i) => (
                    <tr key={i} className={i === 0 ? "bg-indigo-50 font-medium" : ""}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Dataset info */}
        {datasetInfo && (
          <section className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dataset Info</h2>
            <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm text-gray-800">{JSON.stringify(datasetInfo, null, 2)}</pre>
            </div>
          </section>
        )}

        {/* Saved models */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Saved Models</h2>
          {savedModels.length === 0 ? (
            <p className="text-gray-500 italic">No models saved yet.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedModels.map((model, idx) => (
                <li key={idx} className="bg-indigo-50 px-4 py-3 rounded-md border border-indigo-100">
                  <span className="text-indigo-700 font-medium">{model}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;