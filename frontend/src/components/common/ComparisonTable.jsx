import React from "react";

const ComparisonTable = ({ allResults }) => {
  if (!allResults) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Algorithm", "Accuracy", "Avg Precision", "Avg Recall", "Avg F1-Score"].map(
              (h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(allResults).map(([algo, result], idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {algo}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {(result.accuracy * 100).toFixed(2)}%
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {result.classification_report["macro avg"].precision.toFixed(3)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {result.classification_report["macro avg"].recall.toFixed(3)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {result.classification_report["macro avg"]["f1-score"].toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComparisonTable;
