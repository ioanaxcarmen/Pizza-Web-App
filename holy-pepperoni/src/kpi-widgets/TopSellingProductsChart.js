import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';
import { Button, Paper, Box } from '@mui/material';

// Default filter values for the chart
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

/**
 * TopSellingProductsChart component
 * Displays a vertical bar chart of the top selling products by quantity and revenue.
 * Allows filtering by year, quarter, month, state, and store.
 * Includes CSV download and reset filters functionality.
 */
const TopSellingProductsChart = () => {
    // State for filters
    const [filters, setFilters] = useState(defaultFilters);
    // State for chart data
    const [data, setData] = useState([]);
    // State for loading status
    const [loading, setLoading] = useState(true);

    // Helper for months by quarter (for month dropdown)
    const QUARTER_MONTHS = {
        '1': [0, 1, 2],   // Jan, Feb, Mar
        '2': [3, 4, 5],   // Apr, May, Jun
        '3': [6, 7, 8],   // Jul, Aug, Sep
        '4': [9, 10, 11], // Oct, Nov, Dec
    };

    // Fetch chart data from backend API whenever filters change
    useEffect(() => {
        setLoading(true);
        // Build query string from filters
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });

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

    // Handle filter dropdown/input changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset all filters to default values
    const handleResetFilters = () => {
        setFilters({ ...defaultFilters });
    };

    // Show loading animation while fetching data
    if (loading) {
        return <LoadingPizza />;
    }

    return (
        <Paper elevation={3} sx={{ width: '100%', p: 2, mb: 2 }}>
            {/* Filter controls */}
            <Box
                sx={{
                    mb: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 2,
                    alignItems: 'center',
                    background: '#f0f0f0',
                    borderRadius: 2,
                    p: 2
                }}
            >
                {/* Store ID as text input */}
                <div>
                    <label>Store ID: </label>
                    <input
                        type="text"
                        name="storeId"
                        value={filters.storeId || ""}
                        onChange={handleFilterChange}
                        placeholder="Enter Store ID"
                        style={{ height: 32, padding: '0 8px' }}
                    />
                </div>
                {/* Year filter */}
                <div>
                    <label>Year: </label>
                    <select name="year" value={filters.year} onChange={handleFilterChange} style={{ padding: '5px' }}>
                        <option value="all">All Years</option>
                        <option value="2020">2020</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                    </select>
                </div>
                {/* Quarter filter */}
                <div>
                    <label>Quarter: </label>
                    <select
                        name="quarter"
                        value={filters.quarter || "all"}
                        onChange={handleFilterChange}
                        style={{ padding: '5px' }}
                        disabled={filters.year === 'all'}
                    >
                        <option value="all">All Quarters</option>
                        <option value="1">Q1</option>
                        <option value="2">Q2</option>
                        <option value="3">Q3</option>
                        <option value="4">Q4</option>
                    </select>
                </div>
                {/* Month filter */}
                <div>
                    <label>Month: </label>
                    <select
                        name="month"
                        value={filters.month || "all"}
                        onChange={handleFilterChange}
                        style={{ padding: '5px' }}
                        disabled={filters.year === 'all' || filters.quarter === 'all'}
                    >
                        <option value="all">All Months</option>
                        {filters.quarter !== 'all'
                            ? QUARTER_MONTHS[filters.quarter].map((i) => (
                                <option key={i + 1} value={String(i + 1)}>
                                    {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                                </option>
                            ))
                            : [...Array(12)].map((_, i) => (
                                <option key={i + 1} value={String(i + 1)}>
                                    {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                                </option>
                            ))
                        }
                    </select>
                </div>
                {/* State filter */}
                <div>
                    <label>State: </label>
                    <select name="state" value={filters.state} onChange={handleFilterChange} style={{ padding: '5px' }}>
                        <option value="all">All States</option>
                        <option value="CA">California</option>
                        <option value="NV">Nevada</option>
                        <option value="AZ">Arizona</option>
                        <option value="UT">Utah</option>
                    </select>
                </div>
                {/* Reset filters button */}
                <Button
                    onClick={handleResetFilters}
                    variant="contained"
                    sx={{
                        background: "#faa28a",
                        borderRadius: "32px",
                        color: "#fff",
                        fontWeight: "bold",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        '&:hover': { background: "#fa7a1c" }
                    }}
                >
                    Reset Filters
                </Button>
                {/* Download CSV button */}
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
            </Box>
            {/* Bar chart of top selling products */}
            <ResponsiveContainer width="100%" height={400}>
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
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const { name, quantity, revenue, size} = payload[0].payload;
                                return (
                                    <div style={{ 
                                        background: "#fff", 
                                        padding: 8, 
                                        border: "1px solid #ccc",
                                        borderRadius: 4,
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}>
                                        <div><b>{name}</b></div>
                                        {size && <div>Size: {size}</div>}
                                        <div>Quantity: {quantity?.toLocaleString()}</div>
                                        <div>Revenue: €{revenue?.toLocaleString()}</div>
                
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend />
                    <Bar dataKey="quantity" name="Quantity Sold" fill="#3498db" />
                    <Bar dataKey="revenue" name="Revenue" fill="#faa28a" />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default TopSellingProductsChart;