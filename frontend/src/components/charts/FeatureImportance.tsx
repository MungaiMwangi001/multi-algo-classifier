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

interface FeatureImportanceProps {
  features: Array<{ feature: string; importance: number }>;
  maxFeatures?: number;
}

export function FeatureImportance({ features, maxFeatures = 10 }: FeatureImportanceProps) {
  // Sort by importance and take top N features
  const sortedFeatures = [...features]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, maxFeatures);

  const chartData = {
    labels: sortedFeatures.map(f => f.feature),
    datasets: [
      {
        label: 'Importance',
        data: sortedFeatures.map(f => f.importance),
        backgroundColor: 'hsl(var(--chart-3))',
        borderColor: 'hsl(var(--chart-3))',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Feature Importance',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Importance: ${context.parsed.x.toFixed(4)}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Importance Score',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Features',
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="w-full" style={{ height: `${Math.max(300, sortedFeatures.length * 40)}px` }}>
        <Bar data={chartData} options={options} />
      </div>
      
      {features.length > maxFeatures && (
        <p className="text-sm text-muted-foreground text-center">
          Showing top {maxFeatures} of {features.length} features
        </p>
      )}
    </div>
  );
}