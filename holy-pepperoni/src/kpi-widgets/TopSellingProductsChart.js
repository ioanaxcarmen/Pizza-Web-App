import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardFilters from '../components/DashboardFilters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    state: 'all',
    storeId: ''
};

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
    a.download = 'top_products_report.csv';
    a.click();
    URL.revokeObjectURL(url);
};

const TopProductsChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Build query string from filters
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });

        // Use environment variable for API URL
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/top-products?${params.toString()}`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching top products chart data:", error);
                setLoading(false);
            });
    }, [filters]);

    if (loading) {
        return <div>Loading Top Selling Products Chart...</div>;
    }

    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <div style={{ width: '100%', height: 500, position: 'relative' }}>
            <DashboardFilters filters={filters} setFilters={setFilters} />
            <button
                onClick={() => downloadCSV(data)}
                style={{
                    position: window.innerWidth < 600 ? "static" : "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    background: '#f7d9afff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: window.innerWidth < 600 ? 16 : 0
                }}
            >
                Download Report
            </button>
           
            <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 300 : 500}>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                        type="category" 
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                        formatter={(value, name) =>
                            name === "Revenue"
                                ? `€${Number(value).toLocaleString()}`
                                : Number(value).toLocaleString()
                        }
                    />
                    <Legend />
                    <Bar dataKey="quantity" name="Quantity Sold" fill="#3498db" />
                    <Bar dataKey="revenue" name="Revenue" fill="#faa28a" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TopProductsChart;