import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is installed: npm install axios
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Button } from '@mui/material';

// Default filter values
const defaultFilters = {
    state: 'all',
    city: 'all',
    storeId: 'all'
};

const StoreKPIRadarChart = () => {
    // State variables for filters, raw data from API, pivoted data for chart, loading status, and dropdown lists
    const [filters, setFilters] = useState(defaultFilters);
    const [rawData, setRawData] = useState([]);
    const [pivotData, setPivotData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [storesList, setStoresList] = useState([]); // List of stores for the store dropdown
    const [citiesList, setCitiesList] = useState([]); // List of cities for the city dropdown
    const downloadCSV = (data) => {
        if (!data.length) return;
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Store-KPIs.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    // Colors for the radar chart lines/fills
    const radarColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28'];

    // Filter options (states are hardcoded based on your data, years/quarters/months are removed as requested)
    const states = ['all', 'AZ', 'NV', 'UT', 'CA'];

    // useEffect hook to fetch the list of stores for the dropdown when the component mounts
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/kpi/store-list');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStoresList(data); // Data format: [{ storeid: 1, name: 'City - State' }]
            } catch (err) {
                console.error("Error fetching store list for radar chart dropdown:", err);
            }
        };
        fetchStores();
    }, []); // Empty dependency array means this effect runs only once on mount

    // useEffect hook to fetch the list of cities for the dropdown when the component mounts
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/kpi/city-list');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCitiesList(data); // Data format: ['City1', 'City2', ...]
            } catch (err) {
                console.error("Error fetching city list for radar chart dropdown:", err);
            }
        };
        fetchCities();
    }, []); // Empty dependency array means this effect runs only once on mount

    // useEffect hook to fetch the main radar chart data from the API when filters change
    useEffect(() => {
        setLoading(true); // Set loading to true when data fetching starts
        const params = new URLSearchParams();
        // Append only state, city, and storeId filters to the URL
        if (filters.state !== 'all') params.append('state', filters.state);
        if (filters.city !== 'all') params.append('city', filters.city);
        if (filters.storeId !== 'all') params.append('storeId', filters.storeId);

        axios.get(`http://localhost:3001/api/kpi/store-summary?${params.toString()}`)
            .then(response => {
                setRawData(response.data); // Set the raw data received from the backend
                setLoading(false); // Set loading to false on success
            })
            .catch(error => {
                console.error("Error fetching store summary data for radar chart:", error);
                setLoading(false); // Set loading to false on error
            });
    }, [filters]); // Re-run this effect whenever filters change

    // useEffect hook to pivot the raw data into the specific format required by Recharts RadarChart
    useEffect(() => {
        if (!rawData.length) {
            setPivotData([]); // If no raw data, clear pivot data
            return;
        }
        // --- IMPORTANT: Log rawData to check its exact structure and casing ---
        // This log helps verify that the data keys (e.g., STOREID, REVENUE_POINT) match frontend expectations
        console.log("Raw Data for Radar Chart (from API):", rawData);
        // ---

        // Define the KPIs that will be displayed on the radar chart axes
        const kpiLabels = [
            // 'key' must match the exact property name (case-sensitive) from your backend's response (e.g., 'REVENUE_POINT')
            // 'fullKey' is used in the tooltip to display the original, unnormalized value
            { label: 'Revenue', key: 'REVENUE_POINT', fullKey: 'TOTAL_REVENUE' },
            { label: 'Avg Order Value', key: 'AVG_VALUE_POINT', fullKey: 'AVG_ORDER_VALUE' },
            { label: 'Order Count', key: 'ORDER_COUNT_POINT', fullKey: 'TOTAL_ORDERS' },
            { label: 'Active Customers', key: 'ACTIVE_CUST_POINT', fullKey: 'ACTIVE_CUSTOMERS' },
            { label: 'Customer Share (%)', key: 'CUSTOMER_SHARE_POINT', fullKey: 'CUSTOMER_SHARE_PCT' }
        ];

        // Initialize the pivot data array. Each element in this array will correspond to an axis on the radar chart.
        // Each element is an object with a 'kpi' property (the axis label) and then properties for each store's score.
        const pivot = kpiLabels.map(kpiItem => {
            const row = { kpi: kpiItem.label }; // Start with the KPI label for this axis
            rawData.forEach(store => {
                // Use the store's ID (e.g., 'S302800') as the key for its score on this KPI axis
                const storeIdKey = store.STOREID;
                if (storeIdKey) {
                    // Assign the store's KPI point value (from backend) to the corresponding storeIdKey
                    // Use Number() to ensure it's a number, and fallback to 0 if undefined
                    row[storeIdKey] = store[kpiItem.key] !== undefined ? Number(store[kpiItem.key]) : 0;
                }
            });
            return row;
        });
        setPivotData(pivot); // Update the pivotData state
    }, [rawData]); // Re-run this effect whenever rawData changes

    // Handle changes in any of the filter dropdowns
    const handleFilterChange = (e) => {
        const { name, value } = e.target; // Get the name and value of the changed filter
        setFilters(prevFilters => ({ ...prevFilters, [name]: value })); // Update the filters state
    };

    // Render loading state
    if (loading) {
        return <div style={styles.loading}>Loading Store KPIs...</div>;
    }

    // Prepare the list of stores that will have radar lines rendered.
    // This logic filters 'rawData' based on the 'storeId' selected in the dropdown.
    const storesToRender = filters.storeId !== 'all'
        ? rawData.filter(store => store.STOREID == filters.storeId).map((store, index) => ({ // Filter if a specific store is selected
            id: store.STOREID || `fallback-${index}`, // Use STOREID as ID, with fallback for key prop
            name: `${store.CITY || 'Unknown City'} (ID: ${store.STOREID || 'N/A'})` // Robust name for legend and tooltip
        }))
        : rawData.map((store, index) => ({ // If 'All Stores' selected, map all rawData stores
            id: store.STOREID || `fallback-${index}`, // Use STOREID as ID, with fallback for key prop
            name: `${store.CITY || 'Unknown City'} (ID: ${store.STOREID || 'N/A'})` // Robust name for legend and tooltip
        }));

    // Custom Tooltip component for the Recharts RadarChart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload; // The data object for the hovered point (e.g., {kpi: "Revenue", S123: 85})
            const kpiLabel = data.kpi; // The KPI label (e.g., 'Revenue')
            const storeId = payload[0].dataKey; // The store ID (e.g., 'S123')
            const storeData = rawData.find(s => s.STOREID == storeId); // Find the full raw store data using STOREID

            if (!storeData) return null; // Return null if store data isn't found (shouldn't happen with consistent data)

            let displayValue = '';
            // Determine which original KPI value to display in the tooltip based on the kpiLabel
            switch (kpiLabel) {
                case 'Revenue':
                    displayValue = `$${Number(storeData.TOTAL_REVENUE || 0).toLocaleString()}`;
                    break;
                case 'Avg Order Value':
                    displayValue = `$${Number(storeData.AVG_ORDER_VALUE || 0).toFixed(2)}`;
                    break;
                case 'Order Count':
                    displayValue = Number(storeData.TOTAL_ORDERS || 0).toLocaleString();
                    break;
                case 'Active Customers':
                    displayValue = Number(storeData.ACTIVE_CUSTOMERS || 0).toLocaleString();
                    break;
                case 'Customer Share (%)':
                    displayValue = `${Number(storeData.CUSTOMER_SHARE_PCT || 0).toFixed(2)}%`;
                    break;
                default:
                    displayValue = 'N/A';
            }

            return (
                <div style={styles.tooltip}>
                    <p className="label" style={{ fontWeight: 'bold' }}>{`${storeData.CITY || 'Unknown City'} (ID: ${storeData.STOREID || 'N/A'})`}</p>
                    <p className="intro">{`${kpiLabel}: ${displayValue}`}</p>
                    <p className="point">{`Score: ${payload[0].value !== undefined ? payload[0].value.toFixed(2) : 'N/A'}`}</p>
                </div>
            );
        }
        return null;
    };

    // Render "No data available" message if no stores to render or no data after filtering
    if (storesToRender.length === 0) {
        return <div style={styles.noData}>No data available for the selected filters.</div>;
    }

    return (
        <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Store KPIs Comparison</h2>
            <div style={styles.filterContainer}>
                {/* State Dropdown */}
                <label htmlFor="state-select" style={styles.filterLabel}>State:</label>
                <select
                    id="state-select"
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    {states.map(state => (
                        <option key={state} value={state}>{state === 'all' ? 'All States' : state}</option>
                    ))}
                </select>

                {/* City Dropdown */}
                <label htmlFor="city-select" style={{ ...styles.filterLabel, marginLeft: '20px' }}>City:</label>
                <select
                    id="city-select"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="all">All Cities</option>
                    {citiesList.map(city => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>

                {/* Store ID Filter Dropdown */}
                <label htmlFor="store-id-select" style={{ ...styles.filterLabel, marginLeft: '20px' }}>Store:</label>
                <select
                    id="store-id-select"
                    name="storeId"
                    value={filters.storeId}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="all">All Stores</option>
                    {storesList.map(store => (
                        <option key={store.storeid} value={store.storeid}>
                            {store.name}
                        </option>
                    ))}
                </select>
                <Button
                    onClick={() => downloadCSV(rawData)}
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

            <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={pivotData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="kpi" />
                    <PolarRadiusAxis domain={[0, 100]} /> {/* Scale from 0 to 100 for points */}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {storesToRender.map((store, index) => (
                        <Radar
                            key={store.id} // Use the robust 'id' for the key prop
                            name={store.name} // Use the robust 'name' for the legend
                            dataKey={store.id} // Data key is the store ID
                            stroke={radarColors[index % radarColors.length]}
                            fill={radarColors[index % radarColors.length]}
                            fillOpacity={0.6}
                        />
                    ))}
                </RadarChart>
            </ResponsiveContainer>
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

export default StoreKPIRadarChart;
