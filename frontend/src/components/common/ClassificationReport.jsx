import React from 'react';

const ClassificationReport = ({ report }) => {
  if (!report) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Classification Report</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precision</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recall</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F1-Score</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Support</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(report).map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{value.precision?.toFixed(2)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{value.recall?.toFixed(2)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{value['f1-score']?.toFixed(2)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{value.support}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassificationReport;