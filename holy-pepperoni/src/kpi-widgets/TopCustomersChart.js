import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import DashboardFilters from '../components/DashboardFilters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';
import { Button, Paper, Box } from '@mui/material';

const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    state: 'all',
    storeId: ''
};

const downloadCSV = (data) => {
    if (!data.length) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top_customers_report.csv';
    a.click();
    URL.revokeObjectURL(url);
};

const TopCustomersChart = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const getInitialFilters = () => {
        const monthFromUrl = searchParams.get('month');
        if (monthFromUrl) {
            const year = monthFromUrl.substring(0, 4);
            const month = parseInt(monthFromUrl.substring(5, 7), 10).toString();
            return { ...defaultFilters, year: year, month: month };
        }
        return defaultFilters;
    };

    const [filters, setFilters] = useState(getInitialFilters());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Convert filter values to match backend expectations
    const getBackendFilters = () => {
        const backendFilters = { ...filters };
        if (backendFilters.month && backendFilters.month !== 'all') {
            backendFilters.month = String(Number(backendFilters.month));
        }
        if (backendFilters.quarter && backendFilters.quarter !== 'all') {
            backendFilters.quarter = String(Number(backendFilters.quarter));
        }
        return backendFilters;
    };

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        const backendFilters = getBackendFilters();
        Object.entries(backendFilters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') params.append(key, value);
        });

        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/top-customers?${params.toString()}`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching top customers chart data:", error);
                setLoading(false);
            });
    // eslint-disable-next-line
    }, [filters]);

    const handleBarClick = (barData) => {
        if (barData && barData.name) {
            const customerId = barData.name;
            const params = new URLSearchParams();
            const backendFilters = getBackendFilters();
            Object.entries(backendFilters).forEach(([key, value]) => {
                if (value && value !== 'all' && value !== '') {
                    params.append(key, value);
                }
            });
            navigate(`/customer/order-history/${customerId}?${params.toString()}`);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetFilters = () => {
        setFilters({ ...defaultFilters });
    };

    useEffect(() => {
        // Hide ChartPage's back button if present
        const btns = Array.from(document.querySelectorAll('button'));
        btns.forEach(btn => {
            if (
                btn.textContent &&
                btn.textContent.trim().toLowerCase() === 'back'
            ) {
                btn.style.display = 'none';
            }
        });
        return () => {
            btns.forEach(btn => {
                if (
                    btn.textContent &&
                    btn.textContent.trim().toLowerCase() === 'back'
                ) {
                    btn.style.display = '';
                }
            });
        };
    }, []);

    if (loading) {
        return <LoadingPizza />;
    }

    // Helper for months by quarter
    const QUARTER_MONTHS = {
        '1': [0, 1, 2],   // Jan, Feb, Mar
        '2': [3, 4, 5],   // Apr, May, Jun
        '3': [6, 7, 8],   // Jul, Aug, Sep
        '4': [9, 10, 11], // Oct, Nov, Dec
    };

    return (
        <Paper elevation={3} sx={{ width: '100%', p: 2, mb: 2 }}>
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
                <div>
                    <label>Year: </label>
                    <select name="year" value={filters.year} onChange={handleFilterChange} style={{ padding: '5px' }}>
                        <option value="all">All Years</option>
                        <option value="2020">2020</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                    </select>
                </div>
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
            </Box>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="spend" name="Total Spend" fill="#faa28a" onClick={handleBarClick} />
                </BarChart>
            </ResponsiveContainer>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                    component={Link}
                    to="/customer"
                    variant="contained"
                    sx={{
                        background: "#faa28a",
                        borderRadius: "32px",
                        color: "#fff",
                        fontWeight: "bold",
                        textTransform: "none",
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        boxShadow: 2,
                        '&:hover': { background: "#fa7a1c" }
                    }}
                >
                    Back to Customer Dashboard
                </Button>
            </Box>
        </Paper>
    );
};


export default TopCustomersChart;