import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';
import { Button } from '@mui/material'; // Import MUI Button

// Colors for each size in the stacked bar chart
const COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FFBB28', '#aa4643', '#89A54E'];

// Order of weekdays for consistent chart display
const weekdayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * OrdersDistributionWeekdaySizeChart component
 * Displays a stacked bar chart of order distribution by weekday and pizza size.
 * Allows downloading the chart data as a CSV report.
 */
const OrdersDistributionWeekdaySizeChart = () => {
    // State for chart data
    const [data, setData] = useState([]);
    // State for unique pizza sizes
    const [sizes, setSizes] = useState([]);
    // State for loading status
    const [loading, setLoading] = useState(true);

    // Fetch order distribution data from backend API on mount
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/orders-distribution-weekday?groupBy=size`)
            .then(res => {
                // Pivot data: each weekday is an object, each size is a key
                const raw = res.data;
                const sizeList = Array.from(new Set(raw.map(r => r.size)));
                setSizes(sizeList);

                // Group by weekday_name
                const grouped = {};
                raw.forEach(row => {
                    const key = row.weekday_name;
                    if (!grouped[key]) grouped[key] = { weekday_name: row.weekday_name };
                    grouped[key][row.size] = row.total_orders;
                });
                // Ensure correct weekday order
                const chartData = weekdayOrder.map(day => grouped[day] || { weekday_name: day });
                setData(chartData);
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
        a.download = 'orders_distribution_by_weekday_size.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Show loading animation while fetching data
    if (loading) return <LoadingPizza />;

    return (
        <div style={{ width: '100%', height: 400 }}>
            {/* Download CSV button */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    onClick={() => downloadCSV(data)}
                    variant="contained"
                    sx={{
                        background: "#f7d9afff",
                        color: "#000",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        boxShadow: 1,
                        '&:hover': { background: "#ffe0b2" }
                    }}
                >
                    Download Report
                </Button>
            </div>
            {/* Chart title */}
            <h2 style={{ textAlign: 'center' }}>Orders Distribution by Weekday (Stacked by Size)</h2>
            {/* Responsive stacked bar chart */}
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="weekday_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* Render a bar for each pizza size */}
                    {sizes.map((size, idx) => (
                        <Bar key={size} dataKey={size} stackId="a" fill={COLORS[idx % COLORS.length]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrdersDistributionWeekdaySizeChart;