import React from "react";

const ModelsTab = ({
  savedModels,
  selectedModel,
  setSelectedModel,
  predictionInput,
  setPredictionInput,
  makePrediction,
  predictionResult,
  fetchSavedModels,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Model Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Models List */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Saved Models</h3>
            <button
              onClick={fetchSavedModels}
              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>

          {savedModels.length > 0 ? (
            <div className="space-y-3">
              {savedModels.map((model, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedModel === model.id
                      ? "bg-indigo-100 border-indigo-500 border-2"
                      : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{model.name || `Model ${idx + 1}`}</div>
                      <div className="text-sm text-gray-500">{model.algorithm}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{(model.accuracy * 100).toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">{model.training_time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <p className="mt-4">No saved models yet. Train a model and save it to see it here.</p>
            </div>
          )}
        </div>

        {/* Prediction Interface */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Make Prediction</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Model</label>
              <div className="p-3 bg-white rounded-lg">
                {selectedModel ? (
                  <div>
                    <span className="font-medium">
                      {savedModels.find((m) => m.id === selectedModel)?.name || `Model ${selectedModel}`}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({savedModels.find((m) => m.id === selectedModel)?.algorithm})
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Select a model from the list</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Input Data (JSON format)</label>
              <textarea
                value={predictionInput}
                onChange={(e) => setPredictionInput(e.target.value)}
                placeholder='[{"feature1": value1, "feature2": value2, ...}]'
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={makePrediction}
              disabled={!selectedModel}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-75"
            >
              Predict
            </button>

            {predictionResult && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Prediction Result</h4>
                <pre className="bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(predictionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelsTab;
