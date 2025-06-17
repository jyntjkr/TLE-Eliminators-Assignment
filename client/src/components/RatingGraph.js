// src/components/RatingGraph.js
import React, { useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { ThemeContext } from '../App';
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
  const { isDarkMode } = useContext(ThemeContext);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#fff' : '#333'
        }
      },
      title: {
        display: true,
        text: 'Codeforces Rating History',
        color: isDarkMode ? '#fff' : '#333'
      },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Contest Date',
                color: isDarkMode ? '#fff' : '#333'
            },
            ticks: {
                color: isDarkMode ? '#fff' : '#333'
            },
            grid: {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
        },
        y: {
            title: {
                display: true,
                text: 'Rating',
                color: isDarkMode ? '#fff' : '#333'
            },
            ticks: {
                color: isDarkMode ? '#fff' : '#333'
            },
            grid: {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
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
        borderColor: 'rgba(153, 102, 255, 0.8)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.1,
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default RatingGraph;