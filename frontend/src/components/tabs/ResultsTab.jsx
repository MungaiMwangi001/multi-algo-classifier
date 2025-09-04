import React from "react";
import { Bar, Scatter } from "react-chartjs-2";
import ClassificationReport from "../common/ClassificationReport";
import { getConfusionMatrixData, getRocCurveData, getFeatureImportanceData } from "../charts/chartUtils";

const ResultsTab = ({ trainResult, algorithm }) => {
  if (!trainResult) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Training Results - {algorithm}</h2>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
          <div className="text-sm text-gray-500">Accuracy</div>
          <div className="text-2xl font-bold text-indigo-600">
            {(trainResult.accuracy * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-sm text-gray-500">Precision</div>
          <div className="text-2xl font-bold text-green-600">{trainResult.precision.toFixed(3)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Recall</div>
          <div className="text-2xl font-bold text-blue-600">{trainResult.recall.toFixed(3)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-sm text-gray-500">F1-Score</div>
          <div className="text-2xl font-bold text-purple-600">{trainResult.f1_score.toFixed(3)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Confusion Matrix */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Confusion Matrix</h3>
          {trainResult.confusion_matrix && (
            <Bar
              data={getConfusionMatrixData(trainResult.confusion_matrix, algorithm)}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: true, text: "Confusion Matrix" },
                },
              }}
            />
          )}
        </div>

        {/* ROC Curve */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">ROC Curve</h3>
          {trainResult.roc_curve && (
            <Scatter
              data={getRocCurveData(trainResult.roc_curve)}
              options={{
                responsive: true,
                scales: {
                  x: { title: { display: true, text: "False Positive Rate" }, min: 0, max: 1 },
                  y: { title: { display: true, text: "True Positive Rate" }, min: 0, max: 1 },
                },
                plugins: {
                  legend: { position: "top" },
                  title: {
                    display: true,
                    text: `ROC Curve (AUC = ${trainResult.auc?.toFixed(3) || "N/A"})`,
                  },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Feature Importance */}
      {trainResult.feature_importance && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Feature Importance</h3>
          <Bar
            data={getFeatureImportanceData(trainResult.feature_importance)}
            options={{
              indexAxis: "y",
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Feature Importance" },
              },
            }}
          />
        </div>
      )}

      {/* Classification Report */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Classification Report</h3>
        <ClassificationReport report={trainResult.classification_report} />
      </div>
    </div>
  );
};

export default ResultsTab;
