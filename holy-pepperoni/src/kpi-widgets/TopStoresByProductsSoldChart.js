import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Button } from '@mui/material';
// Define a set of colors for the pie chart slices.
// You might need more colors if you consistently have 10 stores and want unique colors.
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0', '#19FFD4', '#FFD419', '#8884d8', '#82ca9d'];

const TopStoresByProductsSoldChart = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states, matching the backend's expected parameters
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedQuarter, setSelectedQuarter] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedState, setSelectedState] = useState('all');
     const downloadCSV = (data) => {
        if (!data.length) return;
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'top-stores-by-products-sold.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Filter options (adjust years/states based on your actual data)
    const years = ['all', '2020', '2021', '2022'];
    const quarters = ['all', '1', '2', '3', '4'];
    const months = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const states = ['all', 'CA', 'UT', 'NV', 'AZ']; 

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Construct query parameters based on selected filters
                const queryParams = new URLSearchParams();
                if (selectedYear !== 'all') queryParams.append('year', selectedYear);
                if (selectedQuarter !== 'all') queryParams.append('quarter', selectedQuarter);
                if (selectedMonth !== 'all') queryParams.append('month', selectedMonth);
                if (selectedState !== 'all') queryParams.append('state', selectedState);

                // API endpoint for fetching top stores by products sold
                const url = `http://localhost:3001/api/kpi/top-stores-by-products-sold?${queryParams.toString()}`;
                console.log("Fetching Top Stores By Products Sold from URL:", url);

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Received Top Stores By Products Sold data:", data);

                // Recharts PieChart expects 'name' and 'value' keys.
                // Map 'productsSold' to 'value' and 'storeName' to 'name'.
                const formattedData = data.map(item => ({
                    name: item.storeName,
                    value: item.productsSold,
                    storeId: item.storeId // Keep storeId for tooltip if needed
                }));
                setChartData(formattedData || []);

            } catch (err) {
                console.error("Error fetching top stores by products sold data:", err);
                setError("Failed to load top stores by products sold data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [selectedYear, selectedQuarter, selectedMonth, selectedState]); // Dependencies for re-fetching

    // Custom Tooltip component for the Pie Chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0]; // Data for the hovered slice
            return (
                <div style={styles.tooltip}>
                    <p className="label" style={{ fontWeight: 'bold', color: data.color }}>{`${data.name} (ID: ${data.payload.storeId})`}</p>
                    <p className="intro">{`Products Sold: ${data.value.toLocaleString()}`}</p>
                    {/* Recharts payload often includes 'percent' for pie charts */}
                    <p className="desc">{`Share: ${(data.percent * 100).toFixed(2)}%`}</p>
                </div>
            );
        }
        return null;
    };

    // Calculate total products for the "No data available" check
    const totalProductsSold = chartData.reduce((sum, entry) => sum + entry.value, 0);

    if (loading) {
        return <div style={styles.loading}>Loading Top Stores by Products Sold...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    return (
        <div style={styles.chartContainer}>
            

            {/* Filter controls */}
            <div style={styles.filterContainer}>
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

            {chartData.length === 0 || totalProductsSold === 0 ? (
                <div style={styles.noData}>No data available for the selected filters.</div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value" // 'productsSold' mapped to 'value'
                            nameKey="name"  // 'storeName' mapped to 'name'
                            cx="50%"        // Center X position of the pie chart
                            cy="50%"        // Center Y position of the pie chart
                            outerRadius={120} // Outer radius of the pie chart
                            fill="#8884d8"   // Default fill color (will be overridden by Cell colors)
                            labelLine={false} // Hide lines connecting labels to slices
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`} // Display percentage on slices
                        >
                            {/* Map colors to slices based on their index */}
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip component */}
                        <Legend /> {/* Display labels and colors below the chart */}
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

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
    tooltip: { // Style for the custom tooltip
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '0.9rem'
    }
};

export default TopStoresByProductsSoldChart;
