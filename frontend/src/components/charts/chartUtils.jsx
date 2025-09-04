// Helper functions for Chart.js charts

export const getConfusionMatrixData = (confusionMatrix, algorithm) => {
  return {
    labels: confusionMatrix.labels || confusionMatrix.map((_, i) => `Class ${i}`),
    datasets: [
      {
        label: `Confusion Matrix - ${algorithm}`,
        data: confusionMatrix.values.flat(), // Flatten 2D matrix
        backgroundColor: 'rgba(99, 102, 241, 0.7)', // Indigo
      },
    ],
  };
};

export const getRocCurveData = (rocCurve) => {
  return {
    datasets: [
      {
        label: "ROC Curve",
        data: rocCurve, // [{x: fpr, y: tpr}, ...]
        backgroundColor: "rgba(34,197,94,0.5)", // Green
        borderColor: "rgba(34,197,94,1)",
        showLine: true,
        fill: false,
      },
    ],
  };
};

export const getFeatureImportanceData = (featureImportance) => {
  return {
    labels: featureImportance.map((f) => f.feature),
    datasets: [
      {
        label: "Importance",
        data: featureImportance.map((f) => f.value),
        backgroundColor: "rgba(99,102,241,0.7)", // Indigo
      },
    ],
  };
};

export const getAccuracyComparisonData = (allResults) => {
  return {
    labels: allResults.map((res) => res.algorithm),
    datasets: [
      {
        label: "Accuracy",
        data: allResults.map((res) => res.accuracy * 100),
        backgroundColor: "rgba(34,197,94,0.7)", // Green
      },
    ],
  };
};
