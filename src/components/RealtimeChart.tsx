import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface RealtimeChartProps {
  data: number[];
  label: string;
  color: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
  maxDataPoints?: number;
}

const colorMap = {
  blue: {
    border: 'rgb(59, 130, 246)',
    background: 'rgba(59, 130, 246, 0.1)',
  },
  purple: {
    border: 'rgb(168, 85, 247)',
    background: 'rgba(168, 85, 247, 0.1)',
  },
  green: {
    border: 'rgb(34, 197, 94)',
    background: 'rgba(34, 197, 94, 0.1)',
  },
  red: {
    border: 'rgb(239, 68, 68)',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  yellow: {
    border: 'rgb(234, 179, 8)',
    background: 'rgba(234, 179, 8, 0.1)',
  },
};

export const RealtimeChart: React.FC<RealtimeChartProps> = ({
  data,
  label,
  color,
  maxDataPoints = 60,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Ensure data array has correct length
  const paddedData = [...data];
  while (paddedData.length < maxDataPoints) {
    paddedData.unshift(0);
  }
  if (paddedData.length > maxDataPoints) {
    paddedData.splice(0, paddedData.length - maxDataPoints);
  }

  const labels = Array.from({ length: maxDataPoints }, (_, i) => {
    const secondsAgo = maxDataPoints - i - 1;
    return secondsAgo === 0 ? 'Now' : `-${secondsAgo}s`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data: paddedData,
        borderColor: colorMap[color].border,
        backgroundColor: colorMap[color].background,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `${(context.parsed.y ?? 0).toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  useEffect(() => {
    // Update chart when data changes
    if (chartRef.current) {
      chartRef.current.update('none');
    }
  }, [data]);

  return (
    <div className="h-full w-full">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};
