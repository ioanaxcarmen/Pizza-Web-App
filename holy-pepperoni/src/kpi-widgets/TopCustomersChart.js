import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom'; // 1. IMPORT useNavigate
import DashboardFilters from '../components/DashboardFilters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    state: 'all',
    storeId: ''
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
    a.download = 'top_customers_report.csv';
    a.click();
    URL.revokeObjectURL(url);
};

const TopCustomersChart = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const getInitialFilters = () => {
        const monthFromUrl = searchParams.get('month');
        if (monthFromUrl) {
            const year = monthFromUrl.substring(0, 4);
            const month = parseInt(monthFromUrl.substring(5, 7), 10).toString();
            return { ...defaultFilters, year: year, month: month };
        }
        return defaultFilters;
    };

    const [filters, setFilters] = useState(getInitialFilters);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });

        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/top-customers?${params.toString()}`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching top customers chart data:", error);
                setLoading(false);
            });
    }, [filters]);

    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        let newFilters = { ...filters, [name]: value };

        if (name === 'year') {
            newFilters.quarter = 'all';
            newFilters.month = 'all';
        }
        if (name === 'quarter') {
            newFilters.month = 'all';
        }

        setFilters(newFilters);
    };

    // click handler function
    const handleBarClick = (data) => {
        if (data && data.activePayload && data.activePayload.length) {
            const customerId = data.activePayload[0].payload.name;
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all' && value !== '') {
                    params.append(key, value);
                }
            });
            navigate(`/customer/order-history/${customerId}?${params.toString()}`);
        }
    };

    if (loading) {
        return <div>Loading Top Customers Chart...</div>;
    }

    return (
        <div style={{ width: '100%', height: 500, position: 'relative' }}>
            <DashboardFilters filters={filters} setFilters={setFilters} handleFilterChange={handleFilterChange} />
            <button
                onClick={() => downloadCSV(data)}
                style={{
                    position: window.innerWidth < 600 ? "static" : "absolute",
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
           
            <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 300 : 500}>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                        type="category" 
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar
                        dataKey="spend"
                        name="Total Spend"
                        fill="#faa28a"
                        onClick={(data, index) => {
                            if (data && data.name) {
                                const params = new URLSearchParams();
                                Object.entries(filters).forEach(([key, value]) => {
                                    if (value && value !== 'all' && value !== '') {
                                        params.append(key, value);
                                    }
                                });
                                navigate(`/customer/order-history/${data.name}?${params.toString()}`);
                            }
                        }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TopCustomersChart;