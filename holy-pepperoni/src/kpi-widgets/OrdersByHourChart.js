import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';
import { Button } from '@mui/material'; 

// Default filter values for the chart
const defaultFilters = {
    year: 'all',
    state: 'all',
};

/**
 * OrdersByHourChart component
 * Displays a bar chart of number of orders by hour of day.
 * Allows filtering by year and state, and downloading the data as CSV.
 */
const OrdersByHourChart = () => {
    // State for filters (year, state)
    const [filters, setFilters] = useState(defaultFilters);
    // State for chart data
    const [data, setData] = useState([]);
    // State for loading status
    const [loading, setLoading] = useState(true);

    // Fetch orders by hour data from backend API whenever filters change
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams(filters);
        
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/orders-by-hour?${params.toString()}`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching orders by hour data:", error);
                setLoading(false);
            });
    }, [filters]);

    // Handle filter dropdown changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
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
        a.download = 'orders_by_hour_report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            {/* Filter controls and download button */}
            <div style={{
                marginBottom: '20px',
                display: 'flex',
                gap: '15px',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Left: Filter controls */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {/* Year filter */}
                    <div>
                        <label>Year: </label>
                        <select name="year" value={filters.year} onChange={handleFilterChange}>
                            <option value="all">All Years</option>
                            <option value="2020">2020</option>
                            <option value="2021">2021</option>
                            <option value="2022">2022</option>
                        </select>
                    </div>
                    {/* Add other filters like State here */}
                </div>
                {/* Right: Download CSV button */}
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

            {/* Show loading animation or the bar chart */}
            {loading ? <LoadingPizza /> : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="orderCount" name="Number of Orders" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default OrdersByHourChart;