import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const defaultFilters = {
    state: 'all',
    // Start with one metric selected by default (if needed you can add a multi-select control)
    metrics: ['total_revenue']
};

const metricOptions = [
    { key: 'total_orders', label: 'Total Orders', color: '#8884d8' },
    { key: 'total_revenue', label: 'Total Revenue (USD)', color: '#82ca9d' },
    { key: 'avg_order_value', label: 'Avg Order Value (USD)', color: '#ff7300' },
    { key: 'active_customers', label: 'Active Customers', color: '#0088FE' },
    { key: 'customer_share_pct', label: 'Customer Share (%)', color: '#FFBB28' }
];

const StoreComparisonGroupedBarChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch store summary data based on state filter from the API.
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('state', filters.state);
        // Expected API: returns an array of objects with keys:
        // storeid, city, state, total_orders, total_revenue, avg_order_value, active_customers, customer_share_pct
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/store-summary?${params.toString()}`)
            .then(response => {
                // Create a label for X-axis: e.g., city (state)
                const mapped = response.data.map(store => ({
                    storeLabel: `${store.city} (${store.state})`,
                    total_revenue: store.total_revenue,
                    total_orders: store.total_orders,
                    avg_order_value: store.avg_order_value,
                    active_customers: store.active_customers,
                    customer_share_pct: store.customer_share_pct
                }));
                setData(mapped);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching store summary data:", error);
                setLoading(false);
            });
    }, [filters.state]);

    // Handler for filtering by state.
    const handleStateChange = (e) => {
        setFilters(prev => ({ ...prev, state: e.target.value }));
    };

    // Handler for metric multi-select.
    // Allows selection of up to 2 metrics.
    const handleMetricChange = (e) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        const limited = selected.slice(0, 2);
        setFilters(prev => ({ ...prev, metrics: limited }));
    };

    if (loading) {
        return <div>Loading store metrics chart...</div>;
    }

    return (
        <div style={{ width: '100%', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                Store Metrics Comparison
            </h2>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <label style={{ marginRight: '20px' }}>
                    Filter by State:
                    <select
                        name="state"
                        style={{ marginLeft: '10px', padding: '5px' }}
                        value={filters.state}
                        onChange={handleStateChange}
                    >
                        <option value="all">All</option>
                        {/* Update these options with dynamic states if needed */}
                        <option value="CA">CA</option>
                        <option value="NV">NV</option>
                        <option value="AZ">AZ</option>
                        <option value="UT">UT</option>
                    </select>
                </label>
                <label>
                    Select Metric(s) (up to 2):
                    <select
                        name="metrics"
                        multiple
                        style={{ marginLeft: '10px', padding: '5px' }}
                        value={filters.metrics}
                        onChange={handleMetricChange}
                    >
                        {metricOptions.map(metric => (
                            <option key={metric.key} value={metric.key}>
                                {metric.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="storeLabel" />
                    {filters.metrics.length === 1 ? (
                        <>
                            <YAxis
                                label={{
                                    value: metricOptions.find(m => m.key === filters.metrics[0]).label,
                                    angle: -90,
                                    position: 'insideLeft'
                                }}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey={filters.metrics[0]}
                                name={metricOptions.find(m => m.key === filters.metrics[0]).label}
                                fill={metricOptions.find(m => m.key === filters.metrics[0]).color}
                            />
                        </>
                    ) : (
                        <>
                            <YAxis
                                yAxisId="left"
                                label={{
                                    value: metricOptions.find(m => m.key === filters.metrics[0]).label,
                                    angle: -90,
                                    position: 'insideLeft'
                                }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                label={{
                                    value: metricOptions.find(m => m.key === filters.metrics[1]).label,
                                    angle: 90,
                                    position: 'insideRight'
                                }}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey={filters.metrics[0]}
                                name={metricOptions.find(m => m.key === filters.metrics[0]).label}
                                fill={metricOptions.find(m => m.key === filters.metrics[0]).color}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey={filters.metrics[1]}
                                name={metricOptions.find(m => m.key === filters.metrics[1]).label}
                                fill={metricOptions.find(m => m.key === filters.metrics[1]).color}
                            />
                        </>
                    )}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StoreComparisonGroupedBarChart;