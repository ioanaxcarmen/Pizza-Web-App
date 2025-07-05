import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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

const StoreDistanceMap = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [distances, setDistances] = useState([]);

    // Filter states (similar to other charts)
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedQuarter, setSelectedQuarter] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedState, setSelectedState] = useState('all');
    const [numStores, setNumStores] = useState(5); // Number of top stores to display

    // Filter options
    const years = ['all', '2023', '2024', '2025'];
    const quarters = ['all', '1', '2', '3', '4'];
    const months = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const states = ['all', 'CA', 'NY', 'TX', 'UT', 'NV', 'AZ']; // Example states

    // Haversine formula to calculate distance between two lat/lon points (in kilometers)
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    };

    useEffect(() => {
        const fetchStoreData = async () => {
            setLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams();
                if (selectedYear !== 'all') queryParams.append('year', selectedYear);
                if (selectedQuarter !== 'all') queryParams.append('quarter', selectedQuarter);
                if (selectedMonth !== 'all') queryParams.append('month', selectedMonth);
                if (selectedState !== 'all') queryParams.append('state', selectedState);
                queryParams.append('limit', numStores); // Pass the limit to the backend

                const url = `http://localhost:3001/api/kpi/top-customer-stores-geo?${queryParams.toString()}`;
                console.log("Fetching Top Customer Stores Geo for Map from URL:", url);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Received Top Customer Stores Geo data for Map:", data);
                setStores(data);

                // Calculate distances between all pairs of fetched stores
                const calculatedDistances = [];
                for (let i = 0; i < data.length; i++) {
                    for (let j = i + 1; j < data.length; j++) {
                        const storeA = data[i];
                        const storeB = data[j];
                        if (storeA.latitude && storeA.longitude && storeB.latitude && storeB.longitude) {
                            const dist = haversineDistance(
                                storeA.latitude, storeA.longitude,
                                storeB.latitude, storeB.longitude
                            );
                            calculatedDistances.push({
                                from: storeA,
                                to: storeB,
                                distance: dist.toFixed(2) // Round to 2 decimal places
                            });
                        }
                    }
                }
                setDistances(calculatedDistances);

            } catch (err) {
                console.error("Error fetching store distance data:", err);
                setError("Failed to load store distance data. Please ensure stores have latitude/longitude and try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [selectedYear, selectedQuarter, selectedMonth, selectedState, numStores]);

    // Determine map center and zoom based on available stores
    const mapCenter = stores.length > 0
        ? [stores[0].latitude, stores[0].longitude]
        : [39.8283, -98.5795]; // Default center (approx. center of US)
    const mapZoom = stores.length > 0 && stores.length <= 1 ? 8 : 4; // Zoom in for single store, out for multiple

    if (loading) {
        return <div style={styles.loading}>Loading Store Distances Map...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    return (
        <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Geographical Distance Between Top {numStores} Customer Stores</h2>

            {/* Filter controls */}
            <div style={styles.filterContainer}>
                {/* Number of Stores */}
                <label htmlFor="num-stores-select" style={styles.filterLabel}>Show Top:</label>
                <select
                    id="num-stores-select"
                    value={numStores}
                    onChange={(e) => setNumStores(Number(e.target.value))}
                    style={styles.select}
                >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
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
                <>
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
                            {distances.map((d, index) => (
                                <Polyline
                                    key={index}
                                    positions={[[d.from.latitude, d.from.longitude], [d.to.latitude, d.to.longitude]]}
                                    color="red"
                                    weight={2}
                                    dashArray="5, 5"
                                >
                                    <Popup>
                                        Distance between {d.from.storeName} and {d.to.storeName}:<br />
                                        <strong>{d.distance} km</strong>
                                    </Popup>
                                </Polyline>
                            ))}
                        </MapContainer>
                    </div>

                    <h3 style={styles.distanceListTitle}>Distances Between Top Stores:</h3>
                    <div style={styles.distanceListContainer}>
                        {distances.length === 0 ? (
                            <p style={styles.noDataSmall}>No distances to display (need at least 2 stores with coordinates).</p>
                        ) : (
                            <ul style={styles.distanceList}>
                                {distances.map((d, index) => (
                                    <li key={index} style={styles.distanceListItem}>
                                        <strong>{d.from.storeName}</strong> to <strong>{d.to.storeName}</strong>: {d.distance} km
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
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
    noDataSmall: {
        fontSize: '0.9rem',
        color: '#777',
        padding: '10px',
    },
    mapContainer: {
        width: '100%',
        height: '500px', // Fixed height for the map
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #ddd',
        marginBottom: '20px',
    },
    distanceListTitle: {
        fontSize: '1.4rem',
        fontWeight: 'bold',
        color: '#333',
        marginTop: '30px',
        marginBottom: '15px',
    },
    distanceListContainer: {
        backgroundColor: '#fefefe',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        padding: '20px',
        textAlign: 'left',
        maxHeight: '300px', // Limit height and add scroll
        overflowY: 'auto',
        border: '1px solid #eee',
    },
    distanceList: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
    },
    distanceListItem: {
        padding: '10px 0',
        borderBottom: '1px solid #eee',
        fontSize: '1rem',
        color: '#555',
    },
};

export default StoreDistanceMap;
