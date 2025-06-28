import React, { useState } from 'react';

// 1. Import the specific mock data we need for this page
import { productInventoryData } from '../mockdata'; 

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Product = () => {
  // 2. Use the product inventory data as the state for our chart
  const [inventoryData, setInventoryData] = useState(productInventoryData);

  return (
    <div style={{ padding: '20px' }}>
      {/* Updated heading for the product page */}
      <h2>Product Inventory Status</h2>
      <p>This chart shows the current stock levels per warehouse.</p>
      
      <div style={{ width: '100%', height: 400, marginTop: '20px' }}>
        <ResponsiveContainer>
          {/* 3. Configure the BarChart to use our inventory data */}
          <BarChart data={inventoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            {/* The X-axis now shows the 'warehouse' name */}
            <XAxis dataKey="warehouse" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* The Bar now shows the 'stock' value */}
            <Bar dataKey="stock" fill="#2E8B57" /> 
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Product;