import React from "react";
import { Bar } from "react-chartjs-2";

export const getAccuracyComparisonData = (results) => {
  return {
    labels: results.map((r) => r.algorithm),
    datasets: [
      {
        label: "Accuracy",
        data: results.map((r) => r.accuracy * 100),
        backgroundColor: "rgba(79, 70, 229, 0.7)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
      },
    ],
  };
};
