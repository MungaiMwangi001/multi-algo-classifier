import React from "react";

const DatasetTab = ({
  file,
  handleFileChange,
  previewData,
  targetColumn,
  setTargetColumn,
  handleUpload,
  loading,
  datasetInfo
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dataset Management</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upload Dataset */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Upload Dataset</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-indigo-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">{file ? file.name : "Click to upload or drag and drop"}</p>
                  </div>
                  <input type="file" onChange={handleFileChange} accept=".csv" className="hidden" />
                </label>
              </div>
            </div>

            {previewData && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Preview (first 10 rows)</h4>
                <div className="overflow-auto max-h-40 border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-1 text-sm whitespace-nowrap">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Column</label>
              <input
                type="text"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                placeholder="Name of target column"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-75"
            >
              {loading ? "Uploading..." : "Upload Dataset"}
            </button>
          </div>
        </div>

        {/* Dataset Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Dataset Information</h3>
          {datasetInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Samples</div>
                  <div className="text-2xl font-bold text-indigo-600">{datasetInfo.samples}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Features</div>
                  <div className="text-2xl font-bold text-indigo-600">{datasetInfo.features}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Classes</div>
                  <div className="text-2xl font-bold text-indigo-600">{datasetInfo.classes}</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Target Column</div>
                  <div className="text-lg font-medium text-indigo-600">{targetColumn || "Not specified"}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Feature Names</h4>
                <div className="bg-white p-3 rounded-lg shadow-sm flex flex-wrap gap-1">
                  {datasetInfo.feature_names?.map((feature, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{feature}</span>
                  ))}
                </div>
              </div>
              {datasetInfo.target_names && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Target Names</h4>
                  <div className="bg-white p-3 rounded-lg shadow-sm flex flex-wrap gap-1">
                    {datasetInfo.target_names.map((target, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{target}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No dataset information available. Upload a dataset first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetTab;
