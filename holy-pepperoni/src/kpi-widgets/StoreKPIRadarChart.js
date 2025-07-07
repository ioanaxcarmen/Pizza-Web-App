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

// Default filter: state filter ("all" means all states)
const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    state: 'all',
    storeId: 'all' // Default storeId filter
};

const StoreKPIRadarChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [rawData, setRawData] = useState([]);
    const [pivotData, setPivotData] = useState([]);
    const [loading, setLoading] = useState(true); // Correct and clean useState declaration
    const [storesList, setStoresList] = useState([]); // State to store list of stores for dropdown

    // For generating different colors per store
    const radarColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28'];

    // Filter options (consistent with your other charts)
    const years = ['all', '2020', '2021', '2022']; // Adjust years as per your data
    const quarters = ['all', '1', '2', '3', '4'];
    const months = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const states = ['all', 'AZ', 'NV', 'UT', 'CA']; // Example states

    // useEffect: Fetch list of stores on component mount for the dropdown
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
    }, []); // Runs only once on mount

    // useEffect: Fetch radar chart data from API when filters change.
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        // Append all filters to the URL
        if (filters.year !== 'all') params.append('year', filters.year);
        if (filters.quarter !== 'all') params.append('quarter', filters.quarter);
        if (filters.month !== 'all') params.append('month', filters.month);
        if (filters.state !== 'all') params.append('state', filters.state);
        if (filters.storeId !== 'all') params.append('storeId', filters.storeId);

        axios.get(`http://localhost:3001/api/kpi/store-summary?${params.toString()}`)
            .then(response => {
                setRawData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching store summary data for radar chart:", error);
                setLoading(false);
            });
    }, [filters]);

    // useEffect: Pivot the raw data into the format required by Recharts RadarChart.
    useEffect(() => {
        if (!rawData.length) {
            setPivotData([]);
            return;
        }
        // --- IMPORTANT: Log rawData to check its exact structure and casing ---
        console.log("Raw Data for Radar Chart (from API):", rawData);
        // ---

        const kpiLabels = [
            // Corrected 'key' to match lowercase from backend response
            { label: 'Revenue', key: 'revenue_point', fullKey: 'total_revenue' },
            { label: 'Avg Order Value', key: 'avg_value_point', fullKey: 'avg_order_value' },
            { label: 'Order Count', key: 'order_count_point', fullKey: 'total_orders' },
            { label: 'Active Customers', key: 'active_cust_point', fullKey: 'active_customers' },
            { label: 'Customer Share (%)', key: 'customer_share_point', fullKey: 'customer_share_pct' }
        ];

        // Initialize pivot data with KPI labels and then populate store values
        // This creates an array where each element is an object representing a KPI axis
        const pivot = kpiLabels.map(kpiItem => {
            const row = { kpi: kpiItem.label }; // Start with the KPI label for the axis
            rawData.forEach(store => {
                // Ensure store.storeid exists and is a valid key for the radar dataKey
                const storeIdKey = store.storeid; 
                if (storeIdKey) {
                    // Add the store's KPI point value to this row, using storeId as the key
                    row[storeIdKey] = store[kpiItem.key] !== undefined ? Number(store[kpiItem.key]) : 0;
                }
            });
            return row;
        });
        setPivotData(pivot);
    }, [rawData]);

    // Handle filter change for all dropdowns
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    if (loading) {
        return <div style={styles.loading}>Loading Store KPIs...</div>;
    }

    // Prepare the list of stores to render radar lines for
    // This handles filtering by 'storeId' from the dropdown
    const storesToRender = filters.storeId !== 'all'
        ? rawData.filter(store => store.storeid == filters.storeId).map(store => ({ // Corrected 'storeid'
            id: store.storeid, // Corrected 'storeid'
            name: `${store.city || 'Unknown City'} (ID: ${store.storeid || 'N/A'})` // Corrected 'city' and 'storeid'
        }))
        : rawData.map(store => ({
            id: store.storeid, // Corrected 'storeid'
            name: `${store.city || 'Unknown City'} (ID: ${store.storeid || 'N/A'})` // Corrected 'city' and 'storeid'
        }));

    // Custom Tooltip component for the Radar Chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload; // The data object for the hovered point (e.g., {kpi: "Revenue", STOREID_X: 85})
            const kpiLabel = data.kpi; // The KPI label (e.g., 'Revenue')
            const storeId = payload[0].dataKey; // The store ID (e.g., '101')
            const storeData = rawData.find(s => s.storeid == storeId); // Corrected 'storeid' to find the full raw store data

            if (!storeData) return null; // Should not happen if data is consistent

            let displayValue = '';
            // Determine which full KPI value to display in the tooltip based on kpiLabel
            switch (kpiLabel) {
                case 'Revenue':
                    displayValue = `$${Number(storeData.total_revenue || 0).toLocaleString()}`; // Corrected 'total_revenue'
                    break;
                case 'Avg Order Value':
                    displayValue = `$${Number(storeData.avg_order_value || 0).toFixed(2)}`; // Corrected 'avg_order_value'
                    break;
                case 'Order Count':
                    displayValue = Number(storeData.total_orders || 0).toLocaleString(); // Corrected 'total_orders'
                    break;
                case 'Active Customers':
                    displayValue = Number(storeData.active_customers || 0).toLocaleString(); // Corrected 'active_customers'
                    break;
                case 'Customer Share (%)':
                    displayValue = `${Number(storeData.customer_share_pct || 0).toFixed(2)}%`; // Corrected 'customer_share_pct'
                    break;
                default:
                    displayValue = 'N/A';
            }

            return (
                <div style={styles.tooltip}>
                    <p className="label" style={{ fontWeight: 'bold' }}>{`${storeData.city || 'Unknown City'} (ID: ${storeData.storeid || 'N/A'})`}</p> {/* Corrected 'city' and 'storeid' */}
                    <p className="intro">{`${kpiLabel}: ${displayValue}`}</p>
                    <p className="point">{`Score: ${payload[0].value !== undefined ? payload[0].value.toFixed(2) : 'N/A'}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Store KPIs Comparison</h2>
            <div style={styles.filterContainer}>
                {/* Year Dropdown */}
                <label htmlFor="year-select" style={styles.filterLabel}>Year:</label>
                <select
                    id="year-select"
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
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
                    name="quarter"
                    value={filters.quarter}
                    onChange={handleFilterChange}
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
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
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
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    {states.map(state => (
                        <option key={state} value={state}>{state === 'all' ? 'All States' : state}</option>
                    ))}
                </select>

                {/* Store ID Filter Dropdown */}
                <label htmlFor="store-id-select" style={{ ...styles.filterLabel, marginLeft: '20px' }}>Store:</label>
                <select
                    id="store-id-select"
                    name="storeId" // Match the filter key
                    value={filters.storeId}
                    onChange={handleFilterChange}
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
            </div>

            {storesToRender.length === 0 ? (
                <div style={styles.noData}>No data available for the selected filters.</div>
            ) : (
                <ResponsiveContainer width="100%" height={500}>
                    <RadarChart data={pivotData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="kpi" />
                        <PolarRadiusAxis domain={[0, 100]} /> {/* Scale from 0 to 100 for points */}
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {storesToRender.map((store, index) => (
                            <Radar
                                key={store.id}
                                name={store.name} // Use the robust 'name' for the legend
                                dataKey={store.id} // Data key is the store ID
                                stroke={radarColors[index % radarColors.length]}
                                fill={radarColors[index % radarColors.length]}
                                fillOpacity={0.6}
                            />
                        ))}
                    </RadarChart>
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

export default StoreKPIRadarChart;