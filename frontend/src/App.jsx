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
    <div style={{ padding: "20px" }}>
      <h1>ML Pipeline Dashboard</h1>

      {/* Dataset upload */}
      <section>
        <h2>Upload Dataset</h2>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Target Column"
          value={targetColumn}
          onChange={(e) => setTargetColumn(e.target.value)}
        />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </section>

      {/* Preview */}
      {previewData && (
        <section>
          <h2>Dataset Preview</h2>
          <table border="1">
            <tbody>
              {previewData.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Dataset info */}
      {datasetInfo && (
        <section>
          <h2>Dataset Info</h2>
          <pre>{JSON.stringify(datasetInfo, null, 2)}</pre>
        </section>
      )}

      {/* Saved models */}
      <section>
        <h2>Saved Models</h2>
        {savedModels.length === 0 ? (
          <p>No models saved yet.</p>
        ) : (
          <ul>
            {savedModels.map((model, idx) => (
              <li key={idx}>{model}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default App;
