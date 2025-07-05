import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FFBB28', '#aa4643', '#89A54E', '#e377c2', '#b5bd61'];
const SIZE_LIST = ['Small', 'Medium', 'Large', 'Extra Large'];

const ProductRevenuePieBySize = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/product-revenue-by-size`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Pivot dữ liệu cho 4 size cố định, luôn show 4 chart
  let groupedData = {};
  SIZE_LIST.forEach(size => { groupedData[size] = []; });
  data.forEach(item => {
    let size = item.size;
    if (SIZE_LIST.includes(size)) {
      groupedData[size].push({ name: item.product_name, value: item.total_revenue });
    }
  });

  return (
    <div style={{ padding: '20px' }}>
      {loading ? (
        <div>Loading data...</div>
      ) : (
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
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
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
      )}
    </div>
  );
};

export default ProductRevenuePieBySize;