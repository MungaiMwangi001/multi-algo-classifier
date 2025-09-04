import React from "react";

const TrainTab = ({
  algorithm,
  setAlgorithm,
  algorithms,
  testSize,
  setTestSize,
  normalize,
  setNormalize,
  crossValidation,
  setCrossValidation,
  trainAlgorithm,
  trainAll,
  loading,
  datasetInfo
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Train a Model</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Training Configuration */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Training Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                {algorithms.map((algo) => (
                  <option key={algo} value={algo}>{algo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Size: {testSize * 100}%
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={testSize * 100}
                onChange={(e) => setTestSize(e.target.value / 100)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10%</span>
                <span>30%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="normalize"
                checked={normalize}
                onChange={(e) => setNormalize(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="normalize" className="ml-2 block text-sm text-gray-700">
                Normalize features
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="crossValidation"
                checked={crossValidation}
                onChange={(e) => setCrossValidation(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="crossValidation" className="ml-2 block text-sm text-gray-700">
                Enable Cross-Validation
              </label>
            </div>
          </div>
        </div>

        {/* Training Actions */}
        <div className="bg-gray-50 p-6 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Training Actions</h3>
            <p className="text-gray-600 mb-6">
              Configure your training parameters and start training either a single model or compare all available algorithms.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={trainAlgorithm}
              disabled={loading || !datasetInfo}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-75"
            >
              {loading ? "Training..." : `Train ${algorithm}`}
            </button>

            <button
              onClick={trainAll}
              disabled={loading || !datasetInfo}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-75"
            >
              {loading ? "Training All..." : "Train All Algorithms"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainTab;
