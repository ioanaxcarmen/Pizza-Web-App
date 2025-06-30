import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FFBB28', '#aa4643', '#89A54E'];

const ProductDistributionPieCharts = () => {
  // Toggle filter for metric: "revenue" or "orders"
  const [metric, setMetric] = useState('revenue');
  // Comparison mode: "category" or "size"
  const [compareBy, setCompareBy] = useState('category');
  // Time resolution: "month", "quarter", or "year"
  const [timeResolution, setTimeResolution] = useState('month');
  // Specific time window value (e.g., "2025-06", "Q1-2025", "2025")
  const [timeValue, setTimeValue] = useState('');
  // Fetched data array; expected format is:
  // [ { group: "Vegetarian", product: "Veggie Delight", value: 1000 }, ... ]
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data from the API whenever filter values change.
  useEffect(() => {
    setLoading(true);
    // Build query parameters based on user's filters.
    const params = new URLSearchParams();
    params.append('metric', metric);
    params.append('compareBy', compareBy);
    params.append('timeResolution', timeResolution);
    // If timeValue is empty, default to "all" to fetch data for the entire available time range.
    params.append('timeValue', timeValue.trim() !== '' ? timeValue : 'all');

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/kpi/product-sales-distribution?${params.toString()}`)
      .then((response) => {
        // Assume API returns an array of objects in the format: { group, product, value }
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product distribution data", error);
        setLoading(false);
      });
  }, [metric, compareBy, timeResolution, timeValue]);

  // Pivot the raw data: group by the 'group' key (either category or size)
  const groupedData = data.reduce((acc, curr) => {
    const group = curr.group;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push({ name: curr.product, value: curr.value });
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Product Sales Distribution</h2>
      
      {/* Controls */}
      <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
        {/* Metric Toggle */}
        <div>
          <label>
            <input 
              type="radio" 
              name="metric" 
              value="revenue" 
              checked={metric === 'revenue'} 
              onChange={() => setMetric('revenue')} 
            />
            Total Revenue
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input 
              type="radio" 
              name="metric" 
              value="orders" 
              checked={metric === 'orders'} 
              onChange={() => setMetric('orders')} 
            />
            Total Orders
          </label>
        </div>
        {/* Comparison Mode Selector */}
        <div>
          <label>
            Compare by:
            <select 
              value={compareBy} 
              onChange={(e) => setCompareBy(e.target.value)} 
              style={{ marginLeft: '10px' }}
            >
              <option value="category">Category</option>
              <option value="size">Size</option>
            </select>
          </label>
        </div>
        {/* Time Resolution */}
        <div>
          <label>
            Time Resolution:
            <select 
              value={timeResolution} 
              onChange={(e) => setTimeResolution(e.target.value)} 
              style={{ marginLeft: '10px' }}
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </label>
        </div>
        {/* Specific Time Input */}
        <div>
          <label>
            {timeResolution === 'month' && 'Month (YYYY-MM):'}
            {timeResolution === 'quarter' && 'Quarter (e.g., Q1-2025):'}
            {timeResolution === 'year' && 'Year (YYYY):'}
            <input 
              type="text" 
              value={timeValue} 
              onChange={(e) => setTimeValue(e.target.value)} 
              placeholder={
                timeResolution === 'month'
                  ? "2025-06"
                  : timeResolution === 'quarter'
                  ? "Q1-2025"
                  : "2025"
              } 
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
      </div>

      {/* Rendering */}
      {loading ? (
        <div>Loading data...</div>
      ) : (
        Object.keys(groupedData).length === 0 ? (
          <div>No data available for the selected filters.</div>
        ) : (
          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px' 
            }}>
            {Object.keys(groupedData).map((groupKey) => (
              <div key={groupKey} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
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
        )
      )}
    </div>
  );
};

export default ProductDistributionPieCharts;
