import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';
import { Button } from '@mui/material';

// Default filter values for the chart
const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    state: 'all'
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
    a.download = 'customer_order_frequency.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Helper for months by quarter (used for filtering)
const QUARTER_MONTHS = {
    '1': [0, 1, 2],   // Jan, Feb, Mar
    '2': [3, 4, 5],   // Apr, May, Jun
    '3': [6, 7, 8],   // Jul, Aug, Sep
    '4': [9, 10, 11], // Oct, Nov, Dec
};

/**
 * CustomerOrderFrequencyChart component
 * Displays a pie chart of customer order frequency with filter controls.
 * Allows CSV download and dynamic filtering by year, quarter, month, and state.
 */
const CustomerOrderFrequencyChart = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Get initial filters (could be extended to read from URL)
    const getInitialFilters = () => {
        return defaultFilters;
    };

    // State for filters, chart data, and loading status
    const [filters, setFilters] = useState(getInitialFilters);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch chart data from backend API whenever filters change
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });
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

    // Handle changes to filter dropdowns
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        let newFilters = { ...filters, [name]: value };
        // Cascading logic to reset dependent filters
        if (name === 'year') {
            newFilters.quarter = 'all';
            newFilters.month = 'all';
        }
        if (name === 'quarter') {
            newFilters.month = 'all';
        }
        setFilters(newFilters);
    };

    // Reset all filters to default values and clear URL params
    const handleResetFilters = () => {
        setFilters(defaultFilters);
        setSearchParams({}); // Also clear any URL params
    };

    // Show loading animation while fetching data
    if (loading) {
        return <LoadingPizza />;
    }

    // Colors for the pie chart slices
    const COLORS = ['#ff3d6f', '#ffb5c8'];

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            {/* Filter Controls */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Year filter */}
                <div>
                    <label>Year: </label>
                    <select name="year" value={filters.year} onChange={handleFilterChange} style={{ padding: '5px' }}>
                        <option value="all">All Years</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                    </select>
                </div>
                {/* Quarter filter */}
                <div>
                    <label>Quarter: </label>
                    <select name="quarter" value={filters.quarter} onChange={handleFilterChange} style={{ padding: '5px' }} disabled={filters.year === 'all'}>
                        <option value="all">All Quarters</option>
                        <option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option>
                    </select>
                </div>
                {/* Month filter */}
                <div>
                    <label>Month: </label>
                    <select
                        name="month"
                        value={filters.month}
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
                    Reset
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
            </div>

            {/* Chart Title */}
            <h2 style={{ textAlign: 'center' }}>
                Customer Order Frequency
            </h2>
            {/* Responsive Pie Chart */}
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
                        dataKey="value"
                        nameKey="name"
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