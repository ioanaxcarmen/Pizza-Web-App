import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

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

const TopIngredientsByStorePieChart = ({ filters = {} }) => {
    const [storeOptions, setStoreOptions] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [pieDataByStore, setPieDataByStore] = useState({});
    const [pieLoading, setPieLoading] = useState(false);

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

    return (
        <div style={{ marginTop: 40 }}>
            <h3 style={{ textAlign: 'center' }}>Top 5 Ingredients by Store</h3>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center' }}>
                {selectedStores.map(store => {
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
                                        label={({ name, percent, ingredient }) => `${ingredient || name}: ${percent}%`}
                                    >
                                        {pieData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.ingredient === 'Others'
                                                ? '#CCCCCC'
                                                : COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={value => `${value}%`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopIngredientsByStorePieChart;