import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';

const COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FFBB28', '#aa4643', '#89A54E'];

const weekdayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const OrdersDistributionWeekdayChart = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/orders-distribution-weekday?groupBy=category`)
            .then(res => {
                // Pivot data: mỗi weekday là 1 object, mỗi category là 1 key
                const raw = res.data;
                const cats = Array.from(new Set(raw.map(r => r.category)));
                setCategories(cats);

                // Group by weekday_name
                const grouped = {};
                raw.forEach(row => {
                    const key = row.weekday_name;
                    if (!grouped[key]) grouped[key] = { weekday_name: row.weekday_name };
                    grouped[key][row.category] = row.total_orders;
                });
                // Đảm bảo đúng thứ tự ngày trong tuần
                const chartData = weekdayOrder.map(day => grouped[day] || { weekday_name: day });
                setData(chartData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <LoadingPizza />;

    return (
        <div style={{ width: '100%', height: 400 }}>
            <h2 style={{ textAlign: 'center' }}>Orders Distribution by Weekday (Stacked by Category)</h2>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="weekday_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {categories.map((cat, idx) => (
                        <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[idx % COLORS.length]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrdersDistributionWeekdayChart;