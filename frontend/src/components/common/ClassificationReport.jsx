import React from "react";

const ClassificationReport = ({ report }) => {
  if (!report) return null;

  const classes = Object.keys(report).filter(
    (key) => !["accuracy", "macro avg", "weighted avg"].includes(key)
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precision</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recall</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F1-Score</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Support</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {classes.map((cls, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report[cls].precision.toFixed(3)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report[cls].recall.toFixed(3)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report[cls]["f1-score"].toFixed(3)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report[cls].support}</td>
            </tr>
          ))}
          <tr className="bg-gray-100">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Accuracy</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan="4">{report.accuracy.toFixed(3)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ClassificationReport;
