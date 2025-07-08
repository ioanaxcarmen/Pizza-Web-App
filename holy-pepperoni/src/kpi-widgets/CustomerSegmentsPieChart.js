import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingPizza from '../components/LoadingPizza';
import { Button, Box } from '@mui/material';

// Colors for each segment in the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

/**
 * Utility to convert data to CSV and trigger download
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
    a.download = 'customer_segments_report.csv';
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * CustomerSegmentsPieChart component
 * Displays a pie chart of customer segments.
 * Allows clicking on a segment to drill down to segment details.
 * Includes a Download Report button.
 */
const CustomerSegmentsPieChart = () => {
    // State to hold the segment data
    const [data, setData] = useState([]);
    // State to track loading status
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch customer segment data from backend API on mount
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/customer-segments`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => console.error("Error fetching customer segments:", error));
    }, []);

    /**
     * Handles clicking on a pie segment.
     * Navigates to the segment details page, passing the segment name as a query parameter.
     */
    const handlePieClick = (data) => {
        if (data && data.name) {
            // Navigate to the details page, passing the segment as a filter
            navigate(`/customer/segment-details?segment=${data.name}`);
        }
    };

    // Show loading animation while fetching data
    if (loading) return <LoadingPizza />;

    return (
        <div style={{ width: '100%', height: 400, position: 'relative' }}>
            {/* Download Report button - absolute position, does not push chart down */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 2,
                    m: 2 // margin for spacing from top/right
                }}
            >
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
            </Box>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={handlePieClick} 
                    >
                        {/* Render a colored cell for each segment */}
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ cursor: 'pointer' }} />
                        ))}
                    </Pie>
                    {/* Tooltip shows customer count on hover */}
                    <Tooltip formatter={(value) => `${value.toLocaleString()} Customers`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomerSegmentsPieChart;