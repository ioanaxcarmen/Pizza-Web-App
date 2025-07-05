import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardFilters from '../components/DashboardFilters';
import Select from 'react-select';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';

const defaultFilters = {
    week: 'all',
    month: 'all',
    quarter: 'all',
    year: 'all',
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

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

// Helper: Add "Others" to make 100%
function addOthersToPieData(data) {
    if (!Array.isArray(data) || !data.length) return [];
    const totalPercent = data.reduce((sum, item) => sum + item.percent, 0);
    const othersPercent = Math.max(0, Math.round((100 - totalPercent) * 10) / 10); // 1 decimal
    if (othersPercent > 0.1) {
        return [
            ...data,
            { ingredient: 'Others', percent: othersPercent, quantity: null }
        ];
    }
    return data;
}

const TopIngredientsChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invalidFilter, setInvalidFilter] = useState(false);

    // Pie chart state
    const [storeOptions, setStoreOptions] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [pieDataByStore, setPieDataByStore] = useState({});
    const [pieLoading, setPieLoading] = useState(false);

    // Fetch bar chart data
    useEffect(() => {
        setLoading(true);
        setInvalidFilter(false);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });

        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/top-ingredients?${params.toString()}`)
            .then(response => {
                const mappedData = response.data.slice(0, 5).map(row => ({
                    ingredient: row.ingredient_name,
                    quantityUsed: row.total_quantity_used
                }));
                setData(mappedData);
                setLoading(false);
                // Nếu có cả state và storeId, và data rỗng, báo lỗi filter
                if (
                    filters.state && filters.state !== 'all' &&
                    filters.storeId && filters.storeId !== 'all' && filters.storeId !== '' &&
                    mappedData.length === 0
                ) {
                    setInvalidFilter(true);
                }
            })
            .catch(error => {
                setLoading(false);
            });
    }, [filters]);

    // Fetch store options for pie chart (once)
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/store-list`)
            .then(res => setStoreOptions(res.data.map(store => ({
                value: store.storeid,
                label: store.name
            }))));
    }, []);

    // Fetch pie chart data for selected stores
    useEffect(() => {
        if (!selectedStores.length) {
            setPieDataByStore({});
            return;
        }
        setPieLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });
        selectedStores.forEach(store => params.append('storeId', store.value));
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/top-ingredients?${params.toString()}`)
            .then(res => {
                setPieDataByStore(res.data); // {storeId: [{ingredient, quantity, percent}, ...]}
                setPieLoading(false);
            })
            .catch(() => setPieLoading(false));
    }, [filters, selectedStores]);

    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    return (
          <div style={{ width: '100%', height: '100%', minHeight: 150, position: 'relative' }}>
            <div style={{ display: 'flex', gap: 20, padding: 20, background: '#f0f0f0', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <DashboardFilters filters={filters} setFilters={setFilters} onReset={handleResetFilters} />
                <button
                    onClick={() => downloadCSV(data)}
                    style={{
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
            </div>
            {loading ? (
                <LoadingPizza />
            ) : invalidFilter ? (
                <div style={{ color: 'red', textAlign: 'center' }}>
                    No data available for the selected filters. Please adjust your filters and try again.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
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