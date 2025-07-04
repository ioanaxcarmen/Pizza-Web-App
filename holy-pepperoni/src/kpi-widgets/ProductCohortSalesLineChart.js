import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
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

const pizzaOptions = [
    { value: "Margherita Pizza", label: "Margherita Pizza" },
    { value: "Pepperoni Pizza", label: "Pepperoni Pizza" },
    { value: "Hawaiian Pizza", label: "Hawaiian Pizza" },
    { value: "Meat Lover's Pizza", label: "Meat Lover's Pizza" },
    { value: "Veggie Pizza", label: "Veggie Pizza" },
    { value: "BBQ Chicken Pizza", label: "BBQ Chicken Pizza" },
    { value: "Buffalo Chicken Pizza", label: "Buffalo Chicken Pizza" },
    { value: "Sicilian Pizza", label: "Sicilian Pizza" },
    { value: "Oxtail Pizza", label: "Oxtail Pizza" }
];

// Default filters:
// • selectedProducts: an array of product names to compare. Empty means “all”
// • yMetric: either "total_quantity" or "total_revenue"
const defaultFilters = {
    selectedProducts: [],
    yMetric: 'total_quantity'
};

// Colors for the lines
const lineColors = ['#8884d8', '#82ca9d', '#ff7300', '#0088FE', '#FFBB28', '#aa4643', '#89A54E'];

const ProductCohortSalesLineChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [rawData, setRawData] = useState([]);
    const [pivotData, setPivotData] = useState([]);
    const [loading, setLoading] = useState(true);
    // New state for showing or hiding the average line
    const [showAverage, setShowAverage] = useState(true);
    const [enableOutlierDetection, setEnableOutlierDetection] = useState(false);

    // Fetch raw data from the API.
    // The endpoint is expected to return rows with:
    // product_name, category, month_since_launch, total_quantity, total_revenue
    useEffect(() => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/product-monthly-sales-since-launch`)
            .then(response => {
                setRawData(response.data);
                setLoading(false);
                // Nếu chưa chọn sản phẩm thì mặc định chọn tất cả sản phẩm
                if (filters.selectedProducts.length === 0) {
                    setFilters(prev => ({
                        ...prev,
                        selectedProducts: pizzaOptions.map(opt => opt.value)
                    }));
                }
            })
            .catch(error => {
                console.error("Error fetching product cohort sales data:", error);
                setLoading(false);
            });
        // eslint-disable-next-line
    }, []);

    // Pivot the raw data into an array of objects where each object represents a cohort month.
    // Example pivoted object: { month: 1, 'Product A': 10, 'Product B': 5, ... }
    useEffect(() => {
        if (rawData.length === 0) {
            setPivotData([]);
            return;
        }
        // Chỉ lấy các sản phẩm được chọn
        const productsToShow = filters.selectedProducts.length > 0 ? filters.selectedProducts : pizzaOptions.map(opt => opt.value);
        const pivot = {};
        rawData.forEach(row => {
            const month = Number(row.month_since_launch);
            if (!pivot[month]) {
                pivot[month] = { month };
            }
            if (productsToShow.includes(row.product_name)) {
                // Use the chosen metric as the value.
                pivot[month][row.product_name] = row[filters.yMetric];
            }
        });
        // Convert object to sorted array by month
        const pivotArray = Object.values(pivot).sort((a, b) => a.month - b.month);
        setPivotData(pivotArray);
    }, [rawData, filters.selectedProducts, filters.yMetric]);

    // Handler for product multi-select
    const handleProductChange = (selectedOptions) => {
        setFilters(prev => ({
            ...prev,
            selectedProducts: selectedOptions ? selectedOptions.map(opt => opt.value) : []
        }));
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
        return <LoadingPizza />;
    }

    // Extend pivotData with an "average" key computed from selected products.
    const extendedData = pivotData.map(row => {
        const values = filters.selectedProducts.map(product => Number(row[product]) || 0);
        const avg = values.length ? (values.reduce((acc, val) => acc + val, 0) / values.length) : 0;
        return { ...row, average: avg };
    });

    function getOutlierIndices(data, product) {
        const values = data.map(row => Number(row[product]) || 0).filter(v => v > 0);
        if (values.length < 2) return [];
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
        return data.map((row, idx) =>
            (row[product] && row[product] > mean + 2 * std) ? idx : null
        ).filter(idx => idx !== null);
    }

    const renderCustomDot = (product, outlierIndices) => (props) => {
        const { cx, cy, index } = props;
        if (outlierIndices.includes(index)) {
            return (
                <circle cx={cx} cy={cy} r={7} fill="red" stroke="#fff" strokeWidth={2} />
            );
        }
        return (
            <circle cx={cx} cy={cy} r={4} fill="#fff" stroke="#8884d8" strokeWidth={1} />
        );
    };

    return (
        <div style={{ width: '100%', padding: '20px' }}>
            {/* Product Cohort Sales Chart */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <label style={{ marginRight: '20px' }}>
                    Select Pizza(s):
                    <div style={{ minWidth: 300, display: 'inline-block', marginLeft: 10 }}>
                        <Select
                            isMulti
                            options={pizzaOptions}
                            value={pizzaOptions.filter(opt => filters.selectedProducts.includes(opt.value))}
                            onChange={handleProductChange}
                            placeholder="Select pizza(s)..."
                            closeMenuOnSelect={false}
                            isClearable
                        />
                    </div>
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
                <label style={{ marginRight: '20px' }}>
                    <input
                        type="checkbox"
                        checked={enableOutlierDetection}
                        onChange={e => setEnableOutlierDetection(e.target.checked)}
                    />
                    Highlight Outliers
                </label>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={extendedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Month Since Launch', position: 'insideBottomRight', offset: -10 }} />
                    <YAxis label={{ value: filters.yMetric === 'total_quantity' ? 'Total Quantity' : 'Total Revenue (USD)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {filters.selectedProducts.map((product, index) => {
                        let outlierIndices = [];
                        if (enableOutlierDetection) {
                            outlierIndices = getOutlierIndices(extendedData, product);
                        }
                        return (
                            <Line
                                key={product}
                                type="monotone"
                                dataKey={product}
                                name={product}
                                stroke={lineColors[index % lineColors.length]}
                                activeDot={enableOutlierDetection ? renderCustomDot(product, outlierIndices) : { r: 5 }}
                            />
                        );
                    })}
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