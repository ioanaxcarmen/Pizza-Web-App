import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    state: 'all'
};

const StoreKPIRadarChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [rawData, setRawData] = useState([]);
    const [pivotData, setPivotData] = useState([]);
    const [loading, setLoading] = useState(true);
    // For generating different colors per store
    const radarColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28'];

    // Fetch data from API when filters change.
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('state', filters.state);
        // API: Returns an array of store summary objects with keys:
        // storeid, city, state, total_orders, total_revenue, avg_order_value, active_customers, customer_share_pct, revenue_rank
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/store-summary?${params.toString()}`)
            .then(response => {
                setRawData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching store summary data:", error);
                setLoading(false);
            });
    }, [filters]);

    // Pivot the data for the radar chart.
    // The radar chart will have five axes representing KPIs:
    // "Total Orders", "Total Revenue", "Avg Order Value", "Active Customers", "Customer Share (%)"
    // We create an array of 5 objects (one per KPI) and add a property for each store.
    useEffect(() => {
        if (!rawData.length) {
            setPivotData([]);
            return;
        }
        const kpiLabels = [
          { label: 'Revenue', key: 'revenue_point' },
          { label: 'Avg Order Value', key: 'avg_value_point' },
          { label: 'Order Count', key: 'order_count_point' },
          { label: 'Active Customers', key: 'active_cust_point' },
         { label: 'Customer Share (%)', key: 'customer_share_point' }
        ];
        // Initialize pivot array with one row per KPI
        const pivot = kpiLabels.map(item => ({ kpi: item.label }));
        // For each store set its KPI value on the corresponding row using storeid as the key.
        rawData.forEach(store => {
            kpiLabels.forEach((item, index) => {
                pivot[index][store.storeid] = store[item.key];
            });
        });
        setPivotData(pivot);
    }, [rawData]);

    // Handle filter change for state.
    const handleFilterChange = (e) => {
        setFilters({ ...filters, state: e.target.value });
    };

    if (loading) {
        return <div>Loading Store KPIs...</div>;
    }

    // Get list of store IDs (and names) to render Radar components.
    const stores = rawData.map(store => ({
        id: store.storeid,
        name: store.city + ' (' + store.storeid + ')'
    }));

    return (
        <div style={{ width: '100%', padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>Store KPIs Comparison</h2>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <label style={{ marginRight: '10px' }}>
                    Filter by State:
                    <select
                        name="state"
                        style={{ marginLeft: '5px', padding: '5px' }}
                        value={filters.state}
                        onChange={handleFilterChange}
                    >
                        <option value="all">All</option>
                        {/* Replace the static list with dynamic states if available */}
                        <option value="California">California</option>
                        <option value="Nevada">Nevada</option>
                        <option value="Arizona">Arizona</option>
                        <option value="Utah">Utah</option>
                    </select>
                </label>
            </div>
            <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={pivotData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="kpi" />
                    <PolarRadiusAxis />
                    <Tooltip />
                    <Legend />
                    {stores.map((store, index) => (
                        <Radar
                            key={store.id}
                            name={store.name}
                            dataKey={store.id}
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

export default StoreKPIRadarChart;