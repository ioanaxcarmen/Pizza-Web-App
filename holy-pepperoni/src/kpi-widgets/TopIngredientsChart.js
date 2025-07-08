import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardFilters from '../components/DashboardFilters';
import LoadingPizza from '../components/LoadingPizza';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const defaultFilters = {
    week: 'all',
    month: 'all',
    quarter: 'all',
    year: 'all',
};

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

const TopIngredientsChart = ({ filters: parentFilters, topN = 5 }) => {
    const [filters, setFilters] = useState(defaultFilters);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invalidFilter, setInvalidFilter] = useState(false);

    // Use parent filters if provided, otherwise use local filters
    const effectiveFilters = parentFilters || filters;

    useEffect(() => {
        setLoading(true);
        setInvalidFilter(false);
        const params = new URLSearchParams();
        Object.entries(effectiveFilters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });

        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/top-ingredients?${params.toString()}`)
            .then(response => {
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

    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <div style={{ width: '100%', minHeight: 500, position: 'relative' }}>
            {/* Filter Controls */}
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
                    <DashboardFilters filters={filters} setFilters={setFilters} onReset={handleResetFilters} />
                </div>
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
                        <Bar dataKey="quantityUsed" name="Total Quantity Used" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default TopIngredientsChart;