import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';

// Color palette for pie chart slices
const COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FFBB28', '#aa4643', '#89A54E', '#e377c2', '#b5bd61'];
// List of pizza sizes to display
const SIZE_LIST = ['Small', 'Medium', 'Large', 'Extra Large'];

const ProductRevenuePieBySize = () => {
  // State to hold fetched data from backend
  const [data, setData] = useState([]);
  // State to indicate loading status
  const [loading, setLoading] = useState(true);

  // Fetch product revenue by size data from backend API on mount
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/product-revenue-by-size`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build a unique product list for color mapping
  const allProductNames = Array.from(
    new Set(data.map(item => item.product_name))
  );
  // Map each product name to a color for consistent coloring across charts
  const colorMap = {};
  allProductNames.forEach((name, idx) => {
    colorMap[name] = COLORS[idx % COLORS.length];
  });

  // Group the data by pizza size for rendering multiple pie charts
  let groupedData = {};
  SIZE_LIST.forEach(size => { groupedData[size] = []; });
  data.forEach(item => {
    let size = item.size;
    if (SIZE_LIST.includes(size)) {
      groupedData[size].push({ name: item.product_name, value: item.total_revenue });
    }
  });

  // Utility to convert data to CSV and trigger download
  const downloadCSV = (data) => {
    if (!data.length) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_revenue_by_size.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Show loading animation while fetching data */}
      {loading ? (
        <LoadingPizza />
      ) : (
        <>
          {/* Render a pie chart for each pizza size */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {SIZE_LIST.map((size) => (
              <div key={size} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', background: "#fff" }}>
                <h3 style={{ textAlign: 'center', fontWeight: 700 }}>{size}</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={groupedData[size]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={false}
                    >
                      {/* Assign a color to each product slice */}
                      {groupedData[size].map((entry) => (
                        <Cell key={entry.name} fill={colorMap[entry.name]} />
                      ))}
                    </Pie>
                    {/* Tooltip shows revenue value on hover */}
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                {/* Show message if there is no data for this size */}
                {groupedData[size].length === 0 && (
                  <div style={{ textAlign: "center", color: "#bbb", marginTop: 30 }}>
                    No data for this size.
                  </div>
                )}
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
      )}
    </div>
  );
};

export default ProductRevenuePieBySize;