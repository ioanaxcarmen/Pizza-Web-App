import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardFilters from '../components/DashboardFilters';

// show multiple pieces of info
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // STEP 1: Get the storeId and share from the full data payload
        const { storeId, share } = payload[0].payload;

        return (
            <div className="custom-tooltip" style={{ background: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                
                {/* STEP 2: Display the label (store name) AND the storeId */}
                <p className="label" style={{ fontWeight: 'bold' }}>{`${label} (${storeId})`}</p>

                <p className="intro">{`Customers: ${payload[0].value}`}</p>
                <p className="desc">{`Share: ${share}% of total`}</p>
            </div>
        );
    }
    return null;
};

const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    state: 'all'
};

const StoreCustomerShareChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(defaultFilters);

    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') params.append(key, value);
        });

        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/customer-share-by-store?${params.toString()}`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching store customer data:", error);
                setLoading(false);
            });
    }, [filters]);

    const handleResetFilters = () => setFilters(defaultFilters);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        let newFilters = { ...filters, [name]: value };

        // Cascading logic: reset lower filters when higher ones change
        if (name === 'year') {
            newFilters.quarter = 'all';
            newFilters.month = 'all';
        }
        if (name === 'quarter') {
            newFilters.month = 'all';
        }

        setFilters(newFilters);
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
        a.download = 'store_customer_share_report.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div>Loading Store Performance Data...</div>;
    }

    return (
        <div style={{ width: '100%', height: 500, position: 'relative' }}>
            <DashboardFilters
                filters={filters}
                setFilters={setFilters}
                handleFilterChange={handleFilterChange}
            />
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
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="storeName"
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="customerCount" name="Number of Customers" fill="#faa28a" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StoreCustomerShareChart;