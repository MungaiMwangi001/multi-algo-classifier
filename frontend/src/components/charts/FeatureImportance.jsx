import React from "react";
import { Bar } from "react-chartjs-2";

export const getFeatureImportanceData = (featureImportance) => {
  if (!featureImportance) return null;

  const features = Object.keys(featureImportance);
  const importance = Object.values(featureImportance);

  return {
    labels: features,
    datasets: [
      {
        label: "Feature Importance",
        data: importance,
        backgroundColor: "rgba(79, 70, 229, 0.7)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
      },
    ],
  };
};
