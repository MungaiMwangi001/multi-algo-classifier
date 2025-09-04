import React from "react";
import { Bar } from "react-chartjs-2";

export const getConfusionMatrixData = (matrix, labels) => {
  return {
    labels: labels,
    datasets: matrix.map((row, idx) => ({
      label: labels[idx],
      data: row,
      backgroundColor: `rgba(${50 + idx * 40}, 99, 255, 0.7)`,
    })),
  };
};
