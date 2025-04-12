import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axiosConfig from '../utils/AxiosConfig';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function OptimizationResults() {
  const [sizeData, setSizeData] = useState(null);
  const [accuracyData, setAccuracyData] = useState(null);
  const [summary, setSummary] = useState({ sizeReduction: '', accuracyChange: '' });

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const response = await axiosConfig.get('/prev-runs');
      const runs = response.data.runs;

      if (!runs || Object.keys(runs).length === 0) {
        console.error('No data available for graph rendering');
        return;
      }

      const expNames = Object.keys(runs);

      // Prepare data for model size comparison
      const originalSizes = expNames.map((exp) => runs[exp].results.original.size);
      const prunedSizes = expNames.map((exp) => runs[exp].results.pruned.size);
      const quantizedSizes = expNames.map((exp) => runs[exp].results.quantized.size);

      setSizeData({
        labels: expNames,
        datasets: [
          { label: 'Original Size (MB)', data: originalSizes, backgroundColor: '#42a5f5' },
          { label: 'Pruned Size (MB)', data: prunedSizes, backgroundColor: '#66bb6a' },
          { label: 'Quantized Size (MB)', data: quantizedSizes, backgroundColor: '#ffa726' },
        ],
      });

      // Prepare data for accuracy vs compression
      const originalAccuracies = expNames.map((exp) => runs[exp].results.original.accuracy);
      const prunedAccuracies = expNames.map((exp) => runs[exp].results.pruned.accuracy);
      const quantizedAccuracies = expNames.map((exp) => runs[exp].results.quantized.accuracy);

      setAccuracyData({
        labels: expNames,
        datasets: [
          { label: 'Original Accuracy (%)', data: originalAccuracies, borderColor: '#42a5f5', backgroundColor: 'rgba(66, 165, 245, 0.2)', fill: true },
          { label: 'Pruned Accuracy (%)', data: prunedAccuracies, borderColor: '#66bb6a', backgroundColor: 'rgba(102, 187, 106, 0.2)', fill: true },
          { label: 'Quantized Accuracy (%)', data: quantizedAccuracies, borderColor: '#ffa726', backgroundColor: 'rgba(255, 167, 38, 0.2)', fill: true },
        ],
      });

      const avgOriginalSize = average(originalSizes);
      const avgQuantizedSize = average(quantizedSizes);
      const sizeReduction = ((avgOriginalSize - avgQuantizedSize) / avgOriginalSize * 100).toFixed(2);

      const avgOriginalAccuracy = average(originalAccuracies);
      const avgQuantizedAccuracy = average(quantizedAccuracies);
      const accuracyChange = (avgQuantizedAccuracy - avgOriginalAccuracy).toFixed(2);

      setSummary({
        sizeReduction: `${sizeReduction}%`,
        accuracyChange: `${accuracyChange}%`,
      });

    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };

  const average = (arr) => {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Optimization Results</h2>

      {sizeData && (
        <div style={styles.chartContainer}>
          <h3 style={styles.subheading}>Model Size Comparison</h3>
          <Bar data={sizeData} options={{ responsive: true }} />
        </div>
      )}

      {accuracyData && (
        <div style={styles.chartContainer}>
          <h3 style={styles.subheading}>Accuracy vs. Compression</h3>
          <Line data={accuracyData} options={{ responsive: true }} />
        </div>
      )}

      <div style={styles.summary}>
        <h3 style={styles.subheading}>Summary</h3>
        <p><strong>Size Reduction:</strong> {summary.sizeReduction}</p>
        <p><strong>Accuracy Change:</strong> {summary.accuracyChange}</p>
      </div>
    </div>
  );
}

// Inline styles for the component
const styles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '20px',
  },
  subheading: {
    fontSize: '1.3rem',
    color: '#555',
    margin: '15px 0',
  },
  chartContainer: {
    margin: '30px 0',
    padding: '15px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  summary: {
    marginTop: '20px',
    fontSize: '1.1rem',
    color: '#444',
  },
};

export default OptimizationResults;
