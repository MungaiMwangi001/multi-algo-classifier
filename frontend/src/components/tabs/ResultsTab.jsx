import React from 'react';
import { useDataset } from '../../hooks/useDataset';
import AccuracyChart from '../charts/AccuracyChart';
import ClassificationReport from '../common/ClassificationReport';

const ResultsTab = () => {
  const { trainingResults } = useDataset();

  if (!trainingResults) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Results</h2>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-gray-600">No results yet. Train a model first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Results</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AccuracyChart data={trainingResults} />
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Best Performing Algorithm</h3>
          {trainingResults.length > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {trainingResults.reduce((best, current) => 
                  (current.accuracy > best.accuracy) ? current : best
                ).algorithm}
              </div>
              <p className="text-gray-600">with accuracy of {(trainingResults.reduce((best, current) => 
                (current.accuracy > best.accuracy) ? current : best
              ).accuracy * 100).toFixed(2)}%</p>
            </div>
          )}
        </div>
      </div>

      {trainingResults.map((result, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{result.algorithm}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800">Accuracy</h4>
              <p className="text-2xl font-bold text-blue-600">{(result.accuracy * 100).toFixed(2)}%</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800">Precision</h4>
              <p className="text-2xl font-bold text-green-600">{result.precision?.toFixed(2)}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800">Recall</h4>
              <p className="text-2xl font-bold text-purple-600">{result.recall?.toFixed(2)}</p>
            </div>
          </div>
          
          <ClassificationReport report={result.classification_report} />
        </div>
      ))}
    </div>
  );
};

export default ResultsTab;