import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

// Colors for the lines
const lineColors = ['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FFBB28', '#aa4643', '#89A54E'];

// Default filters:
// • selectedProducts: an array of product names to compare. Empty means “all”
// • yMetric: either "total_quantity" or "total_revenue"
const defaultFilters = {
    selectedProducts: [],
    yMetric: 'total_quantity'
};

const ProductCohortSalesLineChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [rawData, setRawData] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [pivotData, setPivotData] = useState([]);
    const [loading, setLoading] = useState(true);
    // New state for showing or hiding the average line
    const [showAverage, setShowAverage] = useState(true);

    // Fetch raw data from the API.
    // The endpoint is expected to return rows with:
    // product_name, month_since_launch, total_quantity, total_revenue
    useEffect(() => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/product-monthly-sales-since-launch`)
            .then(response => {
                setRawData(response.data);
                setLoading(false);
                // Derive available products from data
                const products = Array.from(new Set(response.data.map(item => item.product_name)));
                setAvailableProducts(products);
                // If no product selected, default to first 3 products
                if (filters.selectedProducts.length === 0) {
                    setFilters(prev => ({ ...prev, selectedProducts: products.slice(0, 3) }));
                }
            })
            .catch(error => {
                console.error("Error fetching product cohort sales data:", error);
                setLoading(false);
            });
    }, []);

    // Pivot the raw data into an array of objects where each object represents a cohort month.
    // Example pivoted object: { month: 1, 'Product A': 10, 'Product B': 5, ... }
    useEffect(() => {
        if (rawData.length === 0) {
            setPivotData([]);
            return;
        }
        // Determine the set of products to display: if none selected, use all.
        const productsToShow = filters.selectedProducts.length > 0 ? filters.selectedProducts : availableProducts;

        // Group raw data by month_since_launch
        const pivot = {};
        rawData.forEach(row => {
            const month = Number(row.month_since_launch);
            if (!pivot[month]) {
                pivot[month] = { month };
            }
            // Only add metric for products in the selected list.
            if (productsToShow.includes(row.product_name)) {
                // Use the chosen metric as the value.
                pivot[month][row.product_name] = row[filters.yMetric];
            }
        });
        // Convert object to sorted array by month
        const pivotArray = Object.values(pivot).sort((a, b) => a.month - b.month);
        setPivotData(pivotArray);
    }, [rawData, filters.selectedProducts, filters.yMetric, availableProducts]);

    // Handler for multi-select change on products.
    const handleProductChange = (e) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setFilters(prev => ({ ...prev, selectedProducts: selected }));
    };

    // Handler for yMetric change.
    const handleMetricChange = (e) => {
        setFilters(prev => ({ ...prev, yMetric: e.target.value }));
    };

    // Handler for average line opt-out/in.
    const handleAverageToggle = (e) => {
        setShowAverage(e.target.checked);
    };

    if (loading) {
        return <div>Loading cohort chart...</div>;
    }

    // Extend pivotData with an "average" key computed from selected products.
    const extendedData = pivotData.map(row => {
        const values = filters.selectedProducts.map(product => Number(row[product]) || 0);
        const avg = values.length ? (values.reduce((acc, val) => acc + val, 0) / values.length) : 0;
        return { ...row, average: avg };
    });

    return (
        <div style={{ width: '100%', padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>
                Product Cohort Sales Analysis
            </h2>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <label style={{ marginRight: '20px' }}>
                    Select Product(s):
                    <select
                        name="product"
                        multiple
                        style={{ marginLeft: '10px', padding: '5px' }}
                        value={filters.selectedProducts}
                        onChange={handleProductChange}
                    >
                        {availableProducts.map(product => (
                            <option key={product} value={product}>
                                {product}
                            </option>
                        ))}
                    </select>
                </label>
                <label style={{ marginRight: '20px' }}>
                    Y-Axis Metric:
                    <select
                        name="yMetric"
                        style={{ marginLeft: '10px', padding: '5px' }}
                        value={filters.yMetric}
                        onChange={handleMetricChange}
                    >
                        <option value="total_quantity">Total Quantity</option>
                        <option value="total_revenue">Total Revenue (USD)</option>
                    </select>
                </label>
                <label style={{ marginRight: '20px' }}>
                    <input
                        type="checkbox"
                        checked={showAverage}
                        onChange={handleAverageToggle}
                    />
                    Show Average Line
                </label>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={extendedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Month Since Launch', position: 'insideBottomRight', offset: -10 }} />
                    <YAxis label={{ value: filters.yMetric === 'total_quantity' ? 'Total Quantity' : 'Total Revenue (USD)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {filters.selectedProducts.map((product, index) => (
                        <Line
                            key={product}
                            type="monotone"
                            dataKey={product}
                            name={product}
                            stroke={lineColors[index % lineColors.length]}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                    {showAverage && (
                        <Line
                            type="monotone"
                            dataKey="average"
                            name="Average"
                            stroke="#0000FF"
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProductCohortSalesLineChart;