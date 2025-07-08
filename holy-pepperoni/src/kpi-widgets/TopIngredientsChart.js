import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardFilters from '../components/DashboardFilters';
import LoadingPizza from '../components/LoadingPizza';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Default filter values for the chart
const defaultFilters = {
    week: 'all',
    month: 'all',
    quarter: 'all',
    year: 'all',
};

// Utility function to convert data to CSV and trigger download
const downloadCSV = (data) => {
    if (!data.length) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top_ingredients_report.csv';
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * TopIngredientsChart
 * Displays a vertical bar chart of the top N ingredients by total quantity used.
 * Allows filtering by week, month, quarter, and year.
 * Includes a download button for exporting the data as CSV.
 * Shows a loading animation while fetching data.
 * Shows a message if no data is available for the selected filters.
 */
const TopIngredientsChart = ({ filters: parentFilters, topN = 5 }) => {
    // State for local filters (if parentFilters is not provided)
    const [filters, setFilters] = useState(defaultFilters);
    // State for chart data
    const [data, setData] = useState([]);
    // State for loading indicator
    const [loading, setLoading] = useState(true);
    // State for invalid filter (no data)
    const [invalidFilter, setInvalidFilter] = useState(false);

    // Use parent filters if provided, otherwise use local filters
    const effectiveFilters = parentFilters || filters;

    // Fetch data from backend API whenever filters or topN change
    useEffect(() => {
        setLoading(true);
        setInvalidFilter(false);
        const params = new URLSearchParams();
        Object.entries(effectiveFilters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });

        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/top-ingredients?${params.toString()}`)
            .then(response => {
                // Map API response to chart data format
                const mappedData = response.data.slice(0, topN).map(row => ({
                    ingredient: row.ingredient_name,
                    quantityUsed: row.total_quantity_used
                }));
                setData(mappedData);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [effectiveFilters, topN]);

    // Reset filters to default values
    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <div style={{ width: '100%', minHeight: 500, position: 'relative' }}>
            {/* Filter Controls and Download Button */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 24,
                    background: '#fff7f0',
                    borderRadius: 16,
                    padding: '16px 20px',
                    boxShadow: '0 2px 8px #f7d9af44'
                }}
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                    {/* DashboardFilters component for selecting week, month, quarter, year */}
                    <DashboardFilters filters={filters} setFilters={setFilters} onReset={handleResetFilters} />
                </div>
                {/* Download CSV button */}
                <div>
                    <button
                        onClick={() => downloadCSV(data)}
                        style={{
                            background: '#f7d9afff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            padding: '12px 28px',
                            fontSize: '1rem',
                            boxShadow: '0 2px 8px #eee',
                            cursor: 'pointer'
                        }}
                    >
                        Download Report
                    </button>
                </div>
            </div>
            {/* Show loading animation, error message, or the chart */}
            {loading ? (
                <LoadingPizza />
            ) : invalidFilter ? (
                <div style={{ color: 'red', textAlign: 'center' }}>
                    No data available for the selected filters. Please adjust your filters and try again.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 300 : 500}>
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="ingredient" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                        {/* Bar for total quantity used */}
                        <Bar dataKey="quantityUsed" name="Total Quantity Used" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default TopIngredientsChart;