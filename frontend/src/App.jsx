import React, { useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function App() {
  const [file, setFile] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [algorithm, setAlgorithm] = useState("Logistic Regression");
  const [trainResult, setTrainResult] = useState(null);
  const [allResults, setAllResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dataset");
  const [targetColumn, setTargetColumn] = useState("");

  const API_BASE = "http://localhost:8000";

  const algorithms = [
    "Logistic Regression",
    "Decision Tree",
    "Random Forest",
    "SVM",
    "Naive Bayes",
    "KNN"
  ];

  // Upload dataset
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    if (targetColumn) {
      formData.append("target_column", targetColumn);
    }
    
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/upload-dataset`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDatasetInfo(res.data);
      alert("Dataset uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Error uploading dataset");
    } finally {
      setLoading(false);
    }
  };

  // Get dataset info
  const fetchDatasetInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dataset-info`);
      setDatasetInfo(res.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching dataset info");
    }
  };

  // Train one algorithm
  const trainAlgorithm = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/train`, {
        algorithm,
      });
      setTrainResult(res.data);
      setAllResults(null);
      setActiveTab("results");
    } catch (error) {
      console.error(error);
      alert("Error training model");
    } finally {
      setLoading(false);
    }
  };

  // Train all algorithms
  const trainAll = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/train-all`);
      setAllResults(res.data);
      setTrainResult(null);
      setActiveTab("comparison");
    } catch (error) {
      console.error(error);
      alert("Error training all models");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for accuracy comparison chart
  const getAccuracyComparisonData = () => {
    if (!allResults) return null;

    const algorithms = Object.keys(allResults);
    const accuracies = algorithms.map(algo => allResults[algo].accuracy * 100);

    return {
      labels: algorithms,
      datasets: [
        {
          label: 'Accuracy (%)',
          data: accuracies,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for confusion matrix heatmap
  const getConfusionMatrixData = (matrix, algorithm) => {
    if (!matrix) return null;
    
    return {
      labels: datasetInfo?.target_names || Array.from({length: matrix.length}, (_, i) => `Class ${i}`),
      datasets: [
        {
          label: algorithm,
          data: matrix.flat(),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Render classification report as a table
  const renderClassificationReport = (report) => {
    if (!report) return null;

    const classes = Object.keys(report).filter(key => !['accuracy', 'macro avg', 'weighted avg'].includes(key));

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precision
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recall
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                F1-Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Support
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((cls, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cls}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report[cls].precision.toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report[cls].recall.toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report[cls]['f1-score'].toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report[cls].support}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Accuracy
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan="4">
                {report.accuracy.toFixed(3)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render the comparison table for all algorithms
  const renderComparisonTable = () => {
    if (!allResults) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Algorithm
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accuracy
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Precision
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Recall
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg F1-Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(allResults).map(([algo, result], idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {algo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(result.accuracy * 100).toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.classification_report['macro avg'].precision.toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.classification_report['macro avg'].recall.toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.classification_report['macro avg']['f1-score'].toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow-xl rounded-2xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Machine Learning Classifier
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Train and compare multiple ML algorithms on your dataset
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 bg-white shadow-xl rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Navigation</h2>
            <nav className="space-y-2">
              <button
                className={`w-full text-left py-2 px-4 rounded-lg transition-colors ${activeTab === "dataset" ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                onClick={() => setActiveTab("dataset")}
              >
                Dataset
              </button>
              <button
                className={`w-full text-left py-2 px-4 rounded-lg transition-colors ${activeTab === "train" ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                onClick={() => setActiveTab("train")}
              >
                Train Model
              </button>
              <button
                className={`w-full text-left py-2 px-4 rounded-lg transition-colors ${activeTab === "results" ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                onClick={() => trainResult && setActiveTab("results")}
                disabled={!trainResult}
              >
                Results
              </button>
              <button
                className={`w-full text-left py-2 px-4 rounded-lg transition-colors ${activeTab === "comparison" ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"}`}
                onClick={() => allResults && setActiveTab("comparison")}
                disabled={!allResults}
              >
                Compare Algorithms
              </button>
            </nav>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Quick Actions</h3>
              <button
                onClick={trainAll}
                disabled={loading}
                className="w-full bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-75 mb-2"
              >
                {loading ? "Training..." : "Train All Algorithms"}
              </button>
              <button
                onClick={fetchDatasetInfo}
                className="w-full bg-gray-200 text-gray-800 p-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Refresh Dataset Info
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white shadow-xl rounded-2xl p-6">
            {activeTab === "dataset" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Dataset Management</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Upload Dataset</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select CSV File
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setFile(e.target.files[0])}
                          accept=".csv"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Column (optional)
                        </label>
                        <input
                          type="text"
                          value={targetColumn}
                          onChange={(e) => setTargetColumn(e.target.value)}
                          placeholder="Name of target column"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-75"
                      >
                        {loading ? "Uploading..." : "Upload Dataset"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Dataset Information</h3>
                    {datasetInfo ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Samples:</span>
                          <span className="font-medium">{datasetInfo.samples}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Features:</span>
                          <span className="font-medium">{datasetInfo.features}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Classes:</span>
                          <span className="font-medium">{datasetInfo.classes}</span>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-800 mb-1">Feature Names</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {datasetInfo.feature_names?.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                        {datasetInfo.target_names && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-800 mb-1">Target Names</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {datasetInfo.target_names.map((target, idx) => (
                                <li key={idx}>{target}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">No dataset information available. Upload a dataset first.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "train" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Train a Model</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Algorithm
                    </label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                      {algorithms.map((algo) => (
                        <option key={algo} value={algo}>
                          {algo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={trainAlgorithm}
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-75"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Training...
                        </>
                      ) : "Train Model"}
                    </button>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">About the Algorithms</h3>
                  <p className="text-gray-600">
                    This application supports six different machine learning algorithms for classification tasks.
                    Each algorithm has its strengths and weaknesses, and the performance may vary depending on your dataset.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "results" && trainResult && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Results for {trainResult.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-indigo-800">Accuracy</h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">
                      {(trainResult.accuracy * 100).toFixed(2)}%
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-green-800">Precision (Avg)</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {trainResult.classification_report['macro avg'].precision.toFixed(3)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-purple-800">Recall (Avg)</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {trainResult.classification_report['macro avg'].recall.toFixed(3)}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Confusion Matrix</h3>
                  <div className="h-64">
                    <Doughnut
                      data={getConfusionMatrixData(trainResult.confusion_matrix, trainResult.name)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Confusion Matrix'
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Classification Report</h3>
                  {renderClassificationReport(trainResult.classification_report)}
                </div>
              </div>
            )}

            {activeTab === "comparison" && allResults && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Algorithm Comparison</h2>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Accuracy Comparison</h3>
                  <div className="h-64">
                    <Bar
                      data={getAccuracyComparisonData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Accuracy by Algorithm'
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Comparison</h3>
                  {renderComparisonTable()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;