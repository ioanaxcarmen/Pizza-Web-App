import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0", "#FF6699"
];

function pivotData(raw) {
  // raw: [{ order_hour, category, total_items }]
  // output: [{ order_hour, [category1]: value, [category2]: value, ... }]
  const hourMap = {};
  raw.forEach(row => {
    const hour = row.order_hour;
    if (!hourMap[hour]) hourMap[hour] = { order_hour: hour };
    hourMap[hour][row.category] = row.total_items;
  });
  // Fill missing categories with 0
  const allCategories = Array.from(new Set(raw.map(r => r.category)));
  Object.values(hourMap).forEach(obj => {
    allCategories.forEach(cat => {
      if (obj[cat] === undefined) obj[cat] = 0;
    });
  });
  // Sort by hour
  return Object.values(hourMap).sort((a, b) => a.order_hour - b.order_hour);
}

const OrdersDistributionHourlyCategory = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/items-by-category-hour`)
      .then(res => {
        setCategories(Array.from(new Set(res.data.map(r => r.category))));
        setData(pivotData(res.data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
    a.download = 'orders_distribution_by_hour_category.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ width: '100%', height: 450 }}>
      {loading ? (
        <LoadingPizza />
      ) : (
        <>
          <h3 style={{ textAlign: 'center' }}>Orders Distribution by Hour & Category</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="order_hour" tickFormatter={h => `${h}:00`} />
              <YAxis />
              <Tooltip />
              <Legend />
              {categories.map((cat, idx) => (
                <Area
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stackId="1"
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          {/* Download Report button centered below chart */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
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

export default OrdersDistributionHourlyCategory;