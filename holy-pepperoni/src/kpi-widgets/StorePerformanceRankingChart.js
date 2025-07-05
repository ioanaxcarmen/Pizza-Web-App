import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StorePerformanceRankingChart = () => {
    // State variables for chart data, loading status, and errors
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State variables for filters, matching the backend's expected parameters
    const [rankingType, setRankingType] = useState('totalRevenue'); // Default ranking type
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedQuarter, setSelectedQuarter] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedState, setSelectedState] = useState('all');

    // Define filter options. Adjust years/states based on your actual data.
    const years = ['all', '2023', '2024', '2025']; // Example years, add more if needed
    const quarters = ['all', '1', '2', '3', '4'];
    const months = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const states = ['all', 'CA', 'NY', 'TX', 'UT', 'NV', 'AZ']; // Example states

    // Options for the "Rank By" dropdown
    const rankingOptions = [
        { value: 'totalRevenue', label: 'Total Revenue' },
        { value: 'totalOrders', label: 'Total Orders' },
        { value: 'avgOrderValue', label: 'Average Order Value' },
        { value: 'activeCustomers', label: 'Active Customers' },
    ];

    // useEffect hook to fetch data whenever filter dependencies change
    useEffect(() => {
        const fetchRankingData = async () => {
            setLoading(true); // Set loading to true when fetching starts
            setError(null);    // Clear any previous errors

            try {
                // Construct query parameters based on selected filters
                const queryParams = new URLSearchParams();
                queryParams.append('rankingType', rankingType);
                if (selectedYear !== 'all') queryParams.append('year', selectedYear);
                if (selectedQuarter !== 'all') queryParams.append('quarter', selectedQuarter);
                if (selectedMonth !== 'all') queryParams.append('month', selectedMonth);
                if (selectedState !== 'all') queryParams.append('state', selectedState);

                // Construct the full URL for the API call
                const url = `http://localhost:3001/api/kpi/store-performance-ranking?${queryParams.toString()}`;
                console.log("Fetching Store Performance Ranking from URL:", url); // For debugging

                // Make the API request
                const response = await fetch(url);

                // Check if the response was successful
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Parse the JSON response
                const data = await response.json();
                console.log("Received Store Performance Ranking data:", data); // For debugging

                // Set the fetched data to the chartData state.
                // The backend already returns aggregated top 10 data, so no further processing needed here.
                setChartData(data || []); // Ensure it's an empty array if data is null/undefined

            } catch (err) {
                console.error("Error fetching store performance ranking data:", err);
                setError("Failed to load store ranking data. Please try again later.");
            } finally {
                setLoading(false); // Set loading to false when fetching completes (success or error)
            }
        };

        fetchRankingData(); // Call the fetch function
    }, [rankingType, selectedYear, selectedQuarter, selectedMonth, selectedState]); // Dependencies: re-run effect when any of these change

    // Function to format tooltip values based on the selected ranking type
    /* const getTooltipFormatter = (value) => {
        switch (rankingType) {
            case 'totalRevenue':
            case 'avgOrderValue':
                return `$${Number(value).toFixed(2)}`; // Format as currency with 2 decimal places
            case 'totalOrders':
            case 'activeCustomers':
                return Number(value).toLocaleString(); // Format as a localized number
            default:
                return value; // Return as-is for other types
        } */
    const getTooltipFormatter = () => {
        switch (rankingType) {
            case 'totalRevenue':
            case 'avgOrderValue':
                return (value) => {
                    const num = Number(value);
                    return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;


                };
            case 'totalOrders':
            case 'activeCustomers':
                return (value) => {
                    const num = Number(value);
                    return isNaN(num) ? 'N/A' : num.toLocaleString();
                };
            default:
                return (value) => (value == null ? 'N/A' : value.toString());
        }
    };




    // Function to get the label for the Y-axis based on the selected ranking type
    const getAxisLabel = () => {
        const selectedOption = rankingOptions.find(opt => opt.value === rankingType);
        return selectedOption ? selectedOption.label : 'Value';
    };

    // Render loading, error, or no data messages
    if (loading) {
        return <div style={styles.loading}>Loading Store Performance Ranking...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    return (
        <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Store Performance Ranking</h2>

            {/* Filter controls */}
            <div style={styles.filterContainer}>
                {/* Ranking Type Dropdown */}
                <label htmlFor="ranking-type-select" style={styles.filterLabel}>Rank By:</label>
                <select
                    id="ranking-type-select"
                    value={rankingType}
                    onChange={(e) => setRankingType(e.target.value)}
                    style={styles.select}
                >
                    {rankingOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                {/* Year Dropdown */}
                <label htmlFor="year-select" style={{ ...styles.filterLabel, marginLeft: '20px' }}>Year:</label>
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
            </div>

            {/* Conditional rendering for no data or the chart */}
            {chartData.length === 0 ? (
                <div style={styles.noData}>No data available for the selected filters and ranking type.</div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        {/* XAxis displays storeName (e.g., "New York, NY") */}
                        <XAxis dataKey="storeName" angle={-45} textAnchor="end" height={100} stroke="#333" />
                        {/* YAxis displays the value of the selected ranking type */}
                        <YAxis label={{ value: getAxisLabel(), angle: -90, position: 'insideLeft', fill: '#555' }} stroke="#333" />
                        <Tooltip
                            formatter={getTooltipFormatter()} // Use the dynamic formatter
                            labelFormatter={(label, payload) => {
                                // Find the original data item to show storeId along with storeName in tooltip
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
                        {/* Bar for the 'value' data key, with styling */}
                        <Bar dataKey="value" fill="#82ca9d" radius={[10, 10, 0, 0]} />
                    </BarChart>
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

export default StorePerformanceRankingChart;