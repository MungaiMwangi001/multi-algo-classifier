import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fadeIn } from "./constants/animations";
import { algorithms } from "./constants/algorithms";
import useApi from "./hooks/useApi";
import useDataset from "./hooks/useDataset";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dataset");
  const [algorithm, setAlgorithm] = useState(algorithms[0]);
  const [testSize, setTestSize] = useState(0.2);
  const [normalize, setNormalize] = useState(false);
  const [crossValidation, setCrossValidation] = useState(false);

  const {
    trainResult,
    allResults,
    savedModels,
    selectedModel,
    predictionInput,
    predictionResult,
    fetchSavedModels,
    saveModel,
    trainAlgorithm,
    trainAll,
    setSelectedModel,
    setPredictionInput,
    makePrediction,
    loading,
  } = useApi();

  const {
    datasetInfo,
    file,
    previewData,
    targetColumn,
    handleFileChange,
    handleUpload,
    fetchDatasetInfo,
    setTargetColumn,
  } = useDataset();

  useEffect(() => {
    fetchSavedModels();
    fetchDatasetInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        trainAll={trainAll}
        fetchDatasetInfo={fetchDatasetInfo}
        loading={loading}
      />
      <MainContent
        isSidebarOpen={isSidebarOpen}
        activeTab={activeTab}
        datasetInfo={datasetInfo}
        file={file}
        previewData={previewData}
        targetColumn={targetColumn}
        setTargetColumn={setTargetColumn}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        testSize={testSize}
        setTestSize={setTestSize}
        normalize={normalize}
        setNormalize={setNormalize}
        crossValidation={crossValidation}
        setCrossValidation={setCrossValidation}
        trainResult={trainResult}
        allResults={allResults}
        savedModels={savedModels}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        predictionInput={predictionInput}
        setPredictionInput={setPredictionInput}
        predictionResult={predictionResult}
        trainAlgorithm={trainAlgorithm}
        trainAll={trainAll}
        saveModel={saveModel}
        makePrediction={makePrediction}
        loading={loading}
      />
    </div>
  );
}

export default App;
