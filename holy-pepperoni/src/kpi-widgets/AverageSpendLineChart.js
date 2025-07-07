import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import LoadingPizza from '../components/LoadingPizza';
import { Button } from '@mui/material';

/**
 * AverageSpendLineChart component
 * Displays a line chart of average customer spend per month.
 * Allows CSV download and drill-down to top customers for a month.
 */
const AverageSpendLineChart = () => {
    // State to hold chart data
    const [data, setData] = useState([]);
    // State to track loading status
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch average spend data from backend API on mount
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

    /**
     * Utility to convert data to CSV and trigger download
     * @param {Array} data - The data to export as CSV
     */
    const downloadCSV = (data) => {
        if (!data.length) return;
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'average_spend_over_time.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    /**
     * Custom Dot component for the line chart
     * Shows a larger dot on hover and allows clicking to drill down to top customers for that month
     */
    const CustomDot = (props) => {
        const { cx, cy, payload } = props;
        const [isHovered, setIsHovered] = useState(false);
        return (
            <circle
                cx={cx} cy={cy} r={isHovered ? 10 : 6} fill="#8884d8" stroke="#fff" strokeWidth={2}
                style={{ cursor: 'pointer', transition: 'r 0.2s ease-in-out' }}
                onClick={() => {
                    if (payload && payload.month) {
                        // Navigate to the Top 10 Customers page for the selected month
                        navigate(`/customer/top-10?month=${payload.month}`);
                    }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        );
    };

    return (
        <div
            style={{
                width: '100%',
                minWidth: 1100,
                position: 'relative',
                padding: '20px',
                overflowX: 'auto'
            }}
        >
            {/* Download CSV button */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    onClick={() => downloadCSV(data)}
                    variant="contained"
                    sx={{
                        background: "#f7d9afff",
                        color: "#000",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        boxShadow: 1,
                        '&:hover': { background: "#ffe0b2" }
                    }}
                >
                    Download Report
                </Button>
            </div>

            {/* Show loading animation while fetching data */}
            {loading ? (
                <LoadingPizza />
            ) : (
                // Responsive line chart for average spend
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                            strokeWidth={2}
                            dot={<CustomDot />}
                            activeDot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default AverageSpendLineChart;