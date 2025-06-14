// src/components/RatingGraph.js
import React from 'react';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RatingGraph = ({ contestData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Codeforces Rating History',
      },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Contest Date'
            }
        },
        y: {
            title: {
                display: true,
                text: 'Rating'
            }
        }
    }
  };

  const data = {
    labels: contestData.map(c => new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString()),
    datasets: [
      {
        label: 'Rating',
        data: contestData.map(c => c.newRating),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default RatingGraph;