import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardFilters from '../components/DashboardFilters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    state: 'all',
};

const AverageSpendLineChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams(filters);

        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/avg-spend-monthly?${params.toString()}`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching average spend data:", error);
                setLoading(false);
            });
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        let newFilters = { ...filters, [name]: value };
        if (name === 'year') newFilters.quarter = 'all';
        setFilters(newFilters);
    };

    const handleChartClick = (chartData) => {
        if (chartData && chartData.activePayload && chartData.activePayload.length) {
            const clickedMonth = chartData.activePayload[0].payload.month;
            navigate(`/customer/top-10?month=${clickedMonth}`);
        }
    };

    if (loading) {
        return <div>Loading Average Spend Data...</div>;
    }

    return (
        <div style={{ width: '100%', height: 500 }}>
            <DashboardFilters filters={filters} setFilters={setFilters} handleFilterChange={handleFilterChange} />
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    onClick={handleChartClick}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="avgSpend" name="Average Spend" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AverageSpendLineChart;