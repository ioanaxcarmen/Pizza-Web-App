import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardFilters from '../components/DashboardFilters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const defaultFilters = {
    week: 'all',
    month: 'all',
    quarter: 'all',
    year: 'all',
};

// Utility to convert data to CSV and trigger download
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

const TopIngredientsChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });

        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/top-ingredients?${params.toString()}`)
            .then(response => {
                // Map SQL result fields to Recharts-required fields
                const mappedData = response.data.map(row => ({
                    ingredient: row.ingredient_name,
                    quantityUsed: row.total_quantity_used
                }));
                setData(mappedData);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching top ingredients chart data:", error);
                setLoading(false);
            });
    }, [filters]);

    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    if (loading) {
        return <div>Loading Top Ingredients Chart...</div>;
    }

    return (
        <div style={{ width: '100%', height: 500, position: 'relative' }}>
            <DashboardFilters filters={filters} setFilters={setFilters} onReset={handleResetFilters} />
            <button
                onClick={() => downloadCSV(data)}
                style={{
                    position: window.innerWidth < 600 ? 'static' : 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    background: '#f7d9afff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: window.innerWidth < 600 ? 16 : 0
                }}
            >
                Download Report
            </button>
            <h2 style={{ textAlign: 'center' }}>Top 20 Ingredients - Total Quantity Used</h2>
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
        </div>
    );
};

export default TopIngredientsChart;