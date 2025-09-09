import React from 'react';

const AccuracyChart = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Accuracy Comparison</h3>
      <div className="h-64 flex items-end justify-around">
        {data && data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="bg-indigo-500 w-12 rounded-t hover:bg-indigo-600 transition-colors"
              style={{ height: `${item.accuracy * 200}px` }}
            ></div>
            <span className="text-xs mt-2">{item.algorithm}</span>
            <span className="text-xs text-gray-500">{`${(item.accuracy * 100).toFixed(1)}%`}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccuracyChart;