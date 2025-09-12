import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ROCChartProps {
  fpr: number[];
  tpr: number[];
  auc?: number;
}

export function ROCChart({ fpr, tpr, auc }: ROCChartProps) {
  const chartData = {
    labels: fpr.map((_, index) => index.toString()),
    datasets: [
      {
        label: `ROC Curve ${auc ? `(AUC = ${auc.toFixed(3)})` : ''}`,
        data: fpr.map((fprValue, index) => ({
          x: fprValue,
          y: tpr[index],
        })),
        borderColor: 'hsl(var(--chart-2))',
        backgroundColor: 'hsl(var(--chart-2) / 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Random Classifier',
        data: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
        borderColor: 'hsl(var(--muted-foreground))',
        borderWidth: 1,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'ROC Curve',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 0) {
              return `TPR: ${context.parsed.y.toFixed(3)}, FPR: ${context.parsed.x.toFixed(3)}`;
            }
            return context.dataset.label;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'False Positive Rate',
        },
        min: 0,
        max: 1,
      },
      y: {
        title: {
          display: true,
          text: 'True Positive Rate',
        },
        min: 0,
        max: 1,
      },
    },
    aspectRatio: 1,
  };

  return (
    <div className="w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}