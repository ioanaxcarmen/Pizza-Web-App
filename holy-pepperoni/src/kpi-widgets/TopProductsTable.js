import React from 'react';

const sampleData = [
  {
    product_name: "Sicilian Pizza",
    launch: "2021-01-01T00:00:00.000Z",
    quantity_3months: 68550,
    revenue_3months: 1200299.5
  },
  {
    product_name: "BBQ Chicken Pizza",
    launch: "2020-01-01T00:00:00.000Z",
    quantity_3months: 49834,
    revenue_3months: 957985.66
  },
  {
    product_name: "Buffalo Chicken Pizza",
    launch: "2020-01-01T00:00:00.000Z",
    quantity_3months: 52908,
    revenue_3months: 941871.92
  },
  {
    product_name: "Oxtail Pizza",
    launch: "2021-01-01T00:00:00.000Z",
    quantity_3months: 26225,
    revenue_3months: 467461.75
  }
];

const TopProductsTable = () => {
  const data = sampleData;

  // Download CSV utility
  const downloadCSV = (data) => {
    if (!data.length) return;
    const header = ['Product Name', 'Launch Date', 'Quantity (First 3 Months)', 'Revenue (First 3 Months)'];
    const rows = data.map(row => [
      row.product_name,
      row.launch ? new Date(row.launch).toLocaleDateString() : '',
      row.quantity_3months,
      row.revenue_3months
    ]);
    const csvContent = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top_products_by_lifetime.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 20, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#fff7f0' }}>
              <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'left' }}>Product Name</th>
              <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'left' }}>Launch Date</th>
              <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'right' }}>Quantity (First 3 Months)</th>
              <th style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'right' }}>Revenue (First 3 Months)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: 10 }}>{row.product_name}</td>
                <td style={{ padding: 10 }}>{row.launch ? new Date(row.launch).toLocaleDateString() : ''}</td>
                <td style={{ padding: 10, textAlign: 'right' }}>{row.quantity_3months}</td>
                <td style={{ padding: 10, textAlign: 'right' }}>
                  {row.revenue_3months != null
                    ? row.revenue_3months.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Download Report button at the bottom, centered */}
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
    </div>
  );
};

export default TopProductsTable;