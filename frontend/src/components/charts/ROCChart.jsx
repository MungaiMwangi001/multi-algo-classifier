import React from "react";
import { Scatter } from "react-chartjs-2";

export const getRocCurveData = (fpr = [], tpr = []) => ({
  datasets: [
    {
      label: "ROC Curve",
      data: fpr.map((x, i) => ({ x, y: tpr[i] })),
      backgroundColor: "rgba(79, 70, 229, 0.7)",
      showLine: true,
      fill: false,
      borderColor: "rgba(79, 70, 229, 1)",
    },
  ],
});
