import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const AverageSpendLineChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/avg-spend-monthly`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching average spend data:", error);
                setLoading(false);
            });
    }, []);

    const CustomDot = (props) => {
        const { cx, cy, payload } = props;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={8}
                fill="#8884d8"
                stroke="#fff"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    if (payload && payload.month) {
                        // Only set the month filter and navigate
                        navigate(`/customer/top-10?month=${payload.month}`);
                    }
                }}
            />
        );
    };

    if (loading) {
        return <div>Loading Average Spend Data...</div>;
    }

    return (
        <div style={{ width: '100%', height: 500 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="avgSpend"
                        name="Average Spend"
                        stroke="#8884d8"
                        dot={<CustomDot />}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AverageSpendLineChart;