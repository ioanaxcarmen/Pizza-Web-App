import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import L from 'leaflet'; // Import Leaflet for custom icon

// Fix for default marker icon issue with Webpack
// This ensures Leaflet markers appear correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const TopCustomervsStoreGeoChart = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states (similar to other charts)
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedQuarter, setSelectedQuarter] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedState, setSelectedState] = useState('all');
    const [numStores, setNumStores] = useState(10); // Default to top 10 stores

    // Filter options
    const years = ['all', '2023', '2024', '2025']; // Adjust years as per your data
    const quarters = ['all', '1', '2', '3', '4'];
    const months = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const states = ['all', 'CA', 'NY', 'TX', 'UT', 'NV', 'AZ']; // Example states

    useEffect(() => {
        const fetchStoreData = async () => {
            setLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams();
             
                if (selectedQuarter !== 'all') queryParams.append('quarter', selectedQuarter);
               
                if (selectedState !== 'all') queryParams.append('state', selectedState);
                queryParams.append('limit', numStores); // Pass the limit of stores to the backend

                // This endpoint fetches top stores by active customers with geo-coordinates
                const url = `http://localhost:3001/api/kpi/top-customer-stores-geo?${queryParams.toString()}`;
                console.log("Fetching Top Customer Stores Geo for Chart from URL:", url);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Received Top Customer Stores Geo data for Chart:", data);
                setStores(data);

            } catch (err) {
                console.error("Error fetching top customer stores geo data:", err);
                setError("Failed to load store geographical data. Please ensure stores have latitude/longitude and try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [selectedYear, selectedQuarter, selectedMonth, selectedState, numStores]);

    // Determine map center and zoom based on available stores
    // Default to approximate center of US if no stores or coordinates
    const mapCenter = stores.length > 0 && stores[0].latitude && stores[0].longitude
        ? [stores[0].latitude, stores[0].longitude]
        : [39.8283, -98.5795];
    const mapZoom = stores.length > 0 && stores.length <= 1 ? 8 : 4; // Zoom in for single store, out for multiple

    // Function to get a dynamic marker size or color based on active customers
    // For simplicity, we'll just use the default marker but you could customize L.icon
    // or use a different library to create scaled markers.
    // For now, we'll just show the activeCustomers in the popup.

    if (loading) {
        return <div style={styles.loading}>Loading Top Customer Stores Map...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    return (
        <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Top {numStores} Stores by Active Customers (Geographical)</h2>

            {/* Filter controls */}
            <div style={styles.filterContainer}>
                {/* Number of Stores to Display */}
                <label htmlFor="num-stores-select" style={styles.filterLabel}>Show Top:</label>
                <select
                    id="num-stores-select"
                    value={numStores}
                    onChange={(e) => setNumStores(Number(e.target.value))}
                    style={styles.select}
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n} Stores</option>
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

            {stores.length === 0 ? (
                <div style={styles.noData}>No store data available for the selected filters or geographical coordinates are missing.</div>
            ) : (
                <div style={styles.mapContainer}>
                    <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '500px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {stores.map(store => (
                            // Only render marker if latitude and longitude are valid numbers
                            store.latitude && store.longitude && !isNaN(store.latitude) && !isNaN(store.longitude) && (
                                <Marker key={store.storeId} position={[store.latitude, store.longitude]}>
                                    <Popup>
                                        <strong>{store.storeName}</strong><br />
                                        Active Customers: {store.activeCustomers.toLocaleString()}<br />
                                        Lat: {store.latitude}, Lon: {store.longitude}
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
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
    mapContainer: {
        width: '100%',
        height: '500px', // Fixed height for the map
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #ddd',
        marginBottom: '20px',
    },
};

export default TopCustomervsStoreGeoChart;
