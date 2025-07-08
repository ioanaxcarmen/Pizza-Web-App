import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot
} from 'recharts';
import { Button } from '@mui/material';

const AverageOrderValuePerStoreChart = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedQuarter, setSelectedQuarter] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedState, setSelectedState] = useState('all');
    const [selectedStoreId, setSelectedStoreId] = useState('all');
    const downloadCSV = (data) => {
        if (!data.length) return;
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'average-order-value-per-store.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };



    // Filter options (can be global or fetched dynamically if needed)
    const years = ['all', '2020', '2021', '2022'];
    const quarters = ['all', '1', '2', '3', '4'];
    const months = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const states = ['all', 'CA', 'UT', 'NV', 'AZ'];
    const [storesList, setStoresList] = useState([]);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams();
                if (selectedYear !== 'all') queryParams.append('year', selectedYear);
                if (selectedQuarter !== 'all') queryParams.append('quarter', selectedQuarter);
                if (selectedMonth !== 'all') queryParams.append('month', selectedMonth);
                if (selectedState !== 'all') queryParams.append('state', selectedState);
                if (selectedStoreId !== 'all') queryParams.append('storeId', selectedStoreId);

                // This URL corresponds to the backend endpoint for fetching AOV by store
                const url = `http://localhost:3001/api/kpi/avg-order-value-by-store?${queryParams.toString()}`;
                console.log("Fetching AOV by Store from URL:", url);

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Received AOV by Store data:", data);
                setChartData(data || []); // Ensure it's an empty array if no data

            } catch (err) {
                console.error("Error fetching average order value by store data:", err);
                setError("Failed to load average order value data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [selectedYear, selectedQuarter, selectedMonth, selectedState]); // Dependencies for re-fetching data

    // Tooltip formatter for currency values
    const getTooltipFormatter = (value) => `$${Number(value).toFixed(2)}`;

    if (loading) {
        return <div style={styles.loading}>Loading Average Order Value by Store...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    return (
        <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Average Order Value by Store</h2>

            <div style={styles.filterContainer}>
                {/* Year Dropdown */}
                <label htmlFor="year-select" style={styles.filterLabel}>Year:</label>
                <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={styles.select}
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year === 'all' ? 'All Years' : year}</option>
                    ))}
                </select>

                {/* Quarter Dropdown */}
                <label htmlFor="quarter-select" style={{ ...styles.filterLabel, marginLeft: '20px' }}>Quarter:</label>
                <select
                    id="quarter-select"
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    style={styles.select}
                >
                    {quarters.map(quarter => (
                        <option key={quarter} value={quarter}>{quarter === 'all' ? 'All Quarters' : `Q${quarter}`}</option>
                    ))}
                </select>

                {/* Month Dropdown */}
                <label htmlFor="month-select" style={{ ...styles.filterLabel, marginLeft: '20px' }}>Month:</label>
                <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={styles.select}
                >
                    {months.map(month => (
                        <option key={month} value={month}>{month === 'all' ? 'All Months' : new Date(0, month - 1).toLocaleString('en-US', { month: 'long' })}</option>
                    ))}
                </select>

                {/* State Dropdown */}
                <label htmlFor="state-select" style={{ ...styles.filterLabel, marginLeft: '20px' }}>State:</label>
                <select
                    id="state-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    style={styles.select}
                >
                    {states.map(state => (
                        <option key={state} value={state}>{state === 'all' ? 'All States' : state}</option>
                    ))}
                </select>
                <label htmlFor="store-id-select" style={{ ...styles.filterLabel, marginLeft: '20px' }}>Store:</label>
                <select
                    id="store-id-select"
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    style={styles.select}
                >
                    <option value="all">All Stores</option>
                    {/* Map through the fetched storesList to create dropdown options */}
                    {storesList.map(store => (
                        <option key={store.storeid} value={store.storeid}>
                            {store.name}
                        </option>
                    ))}
                </select>
                <Button
                    onClick={() => downloadCSV(chartData)}
                    variant="contained"
                    sx={{
                        background: "#faa28a",
                        borderRadius: "32px",
                        color: "#fff",
                        fontWeight: "bold",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        boxShadow: 1,
                        '&:hover': { background: "#fa7a1c" }
                    }}
                >
                    Download Report
                </Button>

            </div>

            {chartData.length === 0 ? (
                <div style={styles.noData}>No data available for the selected filters.</div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        {/* XAxis for storeName (categorical) */}
                        <XAxis dataKey="storeName" angle={-45} textAnchor="end" height={100} stroke="#333" interval={0} />
                        {/* YAxis for Average Order Value (numerical) */}
                        <YAxis label={{ value: 'Average Order Value ($)', angle: -90, position: 'insideLeft', fill: '#555' }} stroke="#333" />
                        <Tooltip
                            formatter={getTooltipFormatter}
                            labelFormatter={(label, payload) => {
                                // Find the original data item to show storeId along with storeName
                                if (payload && payload.length > 0) {
                                    const item = chartData.find(d => d.storeName === label);
                                    if (item) {
                                        return `Store: ${item.storeName} (ID: ${item.storeId})`;
                                    }
                                }
                                return `Store: ${label}`; // Fallback
                            }}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}
                            labelStyle={{ fontWeight: 'bold', color: '#333' }}
                            itemStyle={{ color: '#555' }}
                        />
                        {/*
                            Using Line component with stroke={0} and a custom dot to create a "lollipop" like effect.
                            stroke={0} makes the line invisible.
                            dot prop renders a circular marker at each data point.
                            activeDot is for when you hover over a point.
                        */}
                        <Line
                            type="monotone" // This can be 'linear' or 'monotone' (though lines might not be desired for discrete data)
                            dataKey="avgOrderValue"
                            stroke="#8884d8" // Color for the line (if strokeWidth > 0)
                            strokeWidth={2} // Adjust to 0 if you want only dots, or a small number for thin lines
                            dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4, fill: '#fff' }} // Styling for the dots
                            activeDot={{ stroke: '#8884d8', strokeWidth: 2, r: 6, fill: '#8884d8' }} // Styling for the active (hovered) dot
                            connectNulls={false} // Prevents line from connecting across missing data points
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

// Styles for the chart container, title, loading, error, and filters
const styles = {
    chartContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        padding: '25px',
        marginBottom: '30px',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        maxWidth: '90%',
        margin: '30px auto',
    },
    chartTitle: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
    },
    loading: {
        fontSize: '1.2rem',
        color: '#555',
        textAlign: 'center',
        padding: '50px',
    },
    error: {
        fontSize: '1.2rem',
        color: '#d32f2f',
        textAlign: 'center',
        padding: '50px',
        backgroundColor: '#ffebee',
        borderRadius: '8px',
        border: '1px solid #ef9a9a',
    },
    filterContainer: {
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
        padding: '10px',
        backgroundColor: '#f8f8f8',
        borderRadius: '10px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
    },
    filterLabel: {
        fontSize: '1rem',
        color: '#555',
        marginRight: '5px',
        whiteSpace: 'nowrap',
    },
    select: {
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        fontSize: '1rem',
        cursor: 'pointer',
        backgroundColor: '#f9f9f9',
        outline: 'none',
        transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        minWidth: '120px',
    },
    noData: {
        fontSize: '1.1rem',
        color: '#777',
        padding: '30px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        marginTop: '20px',
    },
};

export default AverageOrderValuePerStoreChart;
