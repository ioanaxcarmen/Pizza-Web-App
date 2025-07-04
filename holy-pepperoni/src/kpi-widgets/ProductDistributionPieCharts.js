import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Màu cho các product, mỗi pie chart dùng lại palette này
const COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FFBB28', '#aa4643', '#89A54E'];
const SIZE_LIST = ['Small', 'Medium', 'Large', 'Extra Large'];
const SIZE_LABELS = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  'extra large': 'Extra Large'
};

const ALL_SIZES = ['small', 'medium', 'large', 'extra large'];

const ProductDistributionPieCharts = () => {
  const [metric, setMetric] = useState('revenue');
  const [compareBy, setCompareBy] = useState('category');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (compareBy === 'size') {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/kpi/product-size-distribution?metric=${metric}`)
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching product size distribution data", error);
          setLoading(false);
        });
    } else {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/kpi/product-sales-distribution?metric=${metric}&compareBy=category`)
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching product distribution data", error);
          setLoading(false);
        });
    }
  }, [metric, compareBy]);

  // Pivot dữ liệu cho 4 size cố định, đảm bảo luôn show 4 chart
  let groupedData = {};
  if (compareBy === 'size') {
    // Khởi tạo 4 size rỗng, nếu không có data vẫn sẽ có PieChart trống
    SIZE_LIST.forEach(size => { groupedData[size] = []; });
    data.forEach(item => {
      // Đảm bảo chuẩn hóa tên size trùng với SIZE_LIST (ví dụ: "Small", không phải "small")
      let size = item.size;
      if (SIZE_LIST.includes(size)) {
        groupedData[size].push({ name: item.product, value: item.value });
      }
    });
  } else {
    // category: như cũ, group theo group
    groupedData = data.reduce((acc, curr) => {
      const group = curr.group;
      if (!acc[group]) acc[group] = [];
      acc[group].push({ name: curr.product, value: curr.value });
      return acc;
    }, {});
  }

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
      </div>

      {/* Rendering */}
      {loading ? (
        <div>Loading data...</div>
      ) : (
        Object.keys(groupedData).length === 0 ? (
          <div>No data available for the selected filters.</div>
        ) : compareBy === "size" ? (
          // Show exactly 4 pie chart, 1 chart/size (ngay cả khi trống)
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {SIZE_LIST.map((size) => (
              <div key={size} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', background: "#fff" }}>
                <h3 style={{ textAlign: 'center', fontWeight: 700 }}>{size}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={groupedData[size]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) =>
                        groupedData[size].length > 0
                          ? `${name}: ${(percent * 100).toFixed(0)}%`
                          : ""
                      }
                    >
                      {groupedData[size].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                {groupedData[size].length === 0 && (
                  <div style={{ textAlign: "center", color: "#bbb", marginTop: 30 }}>
                    No data for this size.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // category view (như cũ)
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