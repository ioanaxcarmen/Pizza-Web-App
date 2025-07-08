import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define color palette for pie chart slices
const COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FFBB28', '#aa4643', '#89A54E'];

const ProductDistributionPieCharts = () => {
  // State to hold fetched data
  const [data, setData] = useState([]);
  // State to indicate loading status
  const [loading, setLoading] = useState(false);

  // Fetch product sales distribution data by category from backend API on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/kpi/product-sales-distribution?metric=revenue&compareBy=category`)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product distribution data", error);
        setLoading(false);
      });
  }, []);

  // Group the data by category for rendering multiple pie charts
  const groupedData = data.reduce((acc, curr) => {
    const group = curr.group;
    if (!acc[group]) acc[group] = [];
    acc[group].push({ name: curr.product, value: curr.value });
    return acc;
  }, {});

  // Utility function to export the raw data as CSV
  const downloadCSV = (data) => {
    if (!data.length) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_distribution_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Show loading indicator while fetching data */}
      {loading ? (
        <div>Loading data...</div>
      ) : (
        Object.keys(groupedData).length === 0 ? (
          // Show message if no data is available
          <div>No data available.</div>
        ) : (
          <>
            {/* Render a pie chart for each product category */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {Object.keys(groupedData).map((groupKey) => (
                <div key={groupKey} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', background: "#fff" }}>
                  <h3 style={{ textAlign: 'center' }}>{groupKey}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={groupedData[groupKey]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={false}
                      >
                        {/* Assign a color to each slice */}
                        {groupedData[groupKey].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
            {/* Download Report button centered below charts */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <button
                onClick={() => downloadCSV(data)}
                style={{
                  background: '#f7d9afff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  padding: '12px 28px',
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px #eee',
                  cursor: 'pointer'
                }}
              >
                Download Report
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default ProductDistributionPieCharts;