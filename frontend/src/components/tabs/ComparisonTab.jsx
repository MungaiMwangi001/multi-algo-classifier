import React from "react";
import { Bar } from "react-chartjs-2";
import ComparisonTable from "../common/ComparisonTable";
import { getAccuracyComparisonData } from "../charts/chartUtils";

const ComparisonTab = ({ allResults }) => {
  if (!allResults) return null;

  const accuracyData = getAccuracyComparisonData(
    Object.entries(allResults).map(([algo, result]) => ({
      algorithm: algo,
      accuracy: result.accuracy,
    }))
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Algorithm Comparison
      </h2>

      {/* Accuracy Comparison Chart */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Accuracy Comparison
        </h3>
        <Bar
          data={accuracyData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Accuracy by Algorithm" },
            },
          }}
        />
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Detailed Comparison
        </h3>
        <ComparisonTable allResults={allResults} />
      </div>
    </div>
  );
};

export default ComparisonTab;
