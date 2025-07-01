import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardFilters from '../components/DashboardFilters';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    a.download = 'customer_order_frequency.csv';
    a.click();
    URL.revokeObjectURL(url);
};

const CustomerOrderFrequencyChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });
        // Fetching data from the API with the current filters
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/order-frequency?${params.toString()}`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching order frequency data:", error);
                setLoading(false);
            });
    }, [filters]);

    const handleResetFilters = () => setFilters(defaultFilters);
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        let newFilters = { ...filters, [name]: value };
        if (name === 'year') {
            newFilters.quarter = 'all';
            newFilters.month = 'all';
        }
        if (name === 'quarter') {
            newFilters.month = 'all';
        }
        setFilters(newFilters);
    };

    if (loading) {
        return <div>Loading Customer Frequency Data...</div>;
    }

    // Define some colors for the pie chart slices
    const COLORS = ['#0088FE', '#00C49F'];

    return (
        <div style={{ width: '100%', height: 560, position: 'relative' }}>
            <DashboardFilters filters={filters} setFilters={setFilters} />
            <button onClick={() => downloadCSV(data)} style={{ position: "absolute", top: 16, right: 16, zIndex: 2, background: '#f7d9afff', color: '#000', border: 'none', borderRadius: '20px', padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer' }}>
                Download Report
            </button>

            <h2 style={{ textAlign: 'center' }}>Customer Order Frequency</h2>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value" // The pie slice size is determined by the 'value' key from our API
                        nameKey="name" // The label name is from the 'name' key
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} Customers`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomerOrderFrequencyChart;