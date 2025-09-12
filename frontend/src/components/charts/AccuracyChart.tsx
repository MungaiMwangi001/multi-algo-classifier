import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AccuracyChartProps {
  data: Array<{ model: string; accuracy: number; algorithm: string }>;
}

export function AccuracyChart({ data }: AccuracyChartProps) {
  const chartData = {
    labels: data.map(d => d.model.slice(-8)), // Show last 8 chars of model ID
    datasets: [
      {
        label: 'Accuracy',
        data: data.map(d => d.accuracy * 100),
        backgroundColor: 'hsl(var(--chart-1))',
        borderColor: 'hsl(var(--chart-1))',
        borderWidth: 1,
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
        text: 'Model Accuracy Comparison',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataIndex = context.dataIndex;
            const model = data[dataIndex];
            return [
              `Accuracy: ${context.parsed.y.toFixed(2)}%`,
              `Algorithm: ${model.algorithm}`,
              `Model: ${model.model}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}