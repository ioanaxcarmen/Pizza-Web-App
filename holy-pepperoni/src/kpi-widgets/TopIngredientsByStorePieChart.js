import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Color palette for pie chart slices
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

// Helper function: Add an "Others" slice to the pie chart so the total is 100%
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

// Utility function: Convert data to CSV and trigger download
const downloadCSV = (data, storeLabel) => {
    if (!data.length) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top_ingredients_by_store_${storeLabel || 'report'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

const TopIngredientsByStorePieChart = ({ filters = {} }) => {
    // State for store options in the select dropdown
    const [storeOptions, setStoreOptions] = useState([]);
    // State for currently selected stores
    const [selectedStores, setSelectedStores] = useState([]);
    // State for pie chart data by store (object: storeId -> data array)
    const [pieDataByStore, setPieDataByStore] = useState({});
    // State for loading indicator
    const [pieLoading, setPieLoading] = useState(false);

    // Fetch store options for the select dropdown (run once on mount)
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/store-list`)
            .then(res => setStoreOptions(res.data.map(store => ({
                value: store.storeid,
                label: store.name
            }))));
    }, []);

    // Fetch pie chart data for selected stores whenever filters or selectedStores change
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
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/top-ingredients-by-store?${params.toString()}`)
            .then(res => {
                setPieDataByStore(res.data); // {storeId: [{ingredient, quantity, percent}, ...]}
                setPieLoading(false);
            })
            .catch(() => setPieLoading(false));
    }, [filters, selectedStores]);

    return (
        <div style={{ marginTop: 40 }}>
            {/* Store selection dropdown */}
            <div style={{ maxWidth: 400, margin: '0 auto 20px auto' }}>
                <label style={{ fontWeight: 'bold' }}>Stores:&nbsp;</label>
                <Select
                    isMulti
                    options={storeOptions}
                    value={selectedStores}
                    onChange={setSelectedStores}
                    placeholder="Select store(s)..."
                    closeMenuOnSelect={false}
                    isClearable
                />
            </div>
            {/* Render a pie chart for each selected store */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center' }}>
                {selectedStores.map(store => {
                    // Add "Others" slice if needed
                    const pieData = addOthersToPieData(pieDataByStore[store.value] || []);
                    return (
                        <div key={store.value} style={{ width: 350 }}>
                            <h4 style={{ textAlign: 'center' }}>{store.label}</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="percent"
                                        nameKey="ingredient"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                    >
                                        {/* Assign a color to each ingredient slice */}
                                        {pieData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.ingredient === 'Others'
                                                ? '#CCCCCC'
                                                : COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    {/* Tooltip shows percent value on hover */}
                                    <Tooltip formatter={value => `${value}%`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Download CSV button for this store */}
                            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                                <button
                                    onClick={() => downloadCSV(pieData, store.label)}
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
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopIngredientsByStorePieChart;