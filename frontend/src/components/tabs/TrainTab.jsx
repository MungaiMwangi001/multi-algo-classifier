import React, { useState } from 'react';
import { useDataset } from '../../hooks/useDataset';
import { trainModelApi, trainAllModelsApi, saveModelApi } from '../../services/api';
import { ALGORITHMS } from '../../constants/algorithms';

const TrainTab = () => {
  const { datasetInfo, setTrainingResults } = useDataset();
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelName, setModelName] = useState('');

  const handleAlgorithmChange = (algorithm) => {
    if (selectedAlgorithms.includes(algorithm)) {
      setSelectedAlgorithms(selectedAlgorithms.filter(algo => algo !== algorithm));
    } else {
      setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
    }
  };

  const handleTrain = async () => {
    if (!datasetInfo) {
      alert('Please upload a dataset first');
      return;
    }
    if (selectedAlgorithms.length === 0) {
      alert('Please select at least one algorithm');
      return;
    }

    setLoading(true);
    try {
      const response = await trainModelApi(selectedAlgorithms);
      setTrainingResults(response.data);
    } catch (err) {
      console.error('Error training model:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainAll = async () => {
    if (!datasetInfo) {
      alert('Please upload a dataset first');
      return;
    }

    setLoading(true);
    try {
      const response = await trainAllModelsApi();
      setTrainingResults(response.data);
    } catch (err) {
      console.error('Error training all models:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModel = async () => {
    if (!modelName) {
      alert('Please enter a model name');
      return;
    }

    try {
      await saveModelApi({
        name: modelName,
        algorithms: selectedAlgorithms
      });
      alert('Model saved successfully!');
      setModelName('');
    } catch (err) {
      console.error('Error saving model:', err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Train Model</h2>
      
      {!datasetInfo ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please upload a dataset first in the Dataset tab.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Algorithms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {ALGORITHMS.map(algorithm => (
                <div key={algorithm.id} className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={algorithm.id}
                      type="checkbox"
                      checked={selectedAlgorithms.includes(algorithm.id)}
                      onChange={() => handleAlgorithmChange(algorithm.id)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={algorithm.id} className="font-medium text-gray-700">{algorithm.name}</label>
                    <p className="text-gray-500">{algorithm.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleTrain}
                disabled={loading || selectedAlgorithms.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Train Selected
              </button>
              <button
                onClick={handleTrainAll}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                Train All Algorithms
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Save Model</h3>
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter a name for your model"
                />
              </div>
              <button
                onClick={handleSaveModel}
                disabled={!modelName || selectedAlgorithms.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Save Model
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrainTab;