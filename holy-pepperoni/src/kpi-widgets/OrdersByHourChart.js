import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';
import { Button } from '@mui/material';

// Default filter values for the chart
const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    state: 'all',
    storeId: ''
};

/**
 * OrdersByHourChart component
 * Displays a bar chart of number of orders by hour of day.
 * Allows filtering by year, quarter, month, state, store, and downloading the data as CSV.
 */
const OrdersByHourChart = () => {
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

    // Fetch orders by hour data from backend API whenever filters change
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') params.append(key, value);
        });

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

    // Handle filter dropdown/input changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Reset all filters to default values
    const handleResetFilters = () => {
        setFilters({ ...defaultFilters });
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
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                        <select name="year" value={filters.year} onChange={handleFilterChange}>
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
                        <select name="state" value={filters.state} onChange={handleFilterChange}>
                            <option value="all">All States</option>
                            <option value="CA">California</option>
                            <option value="NV">Nevada</option>
                            <option value="AZ">Arizona</option>
                            <option value="UT">Utah</option>
                        </select>
                    </div>
                </div>
                {/* Right: Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
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