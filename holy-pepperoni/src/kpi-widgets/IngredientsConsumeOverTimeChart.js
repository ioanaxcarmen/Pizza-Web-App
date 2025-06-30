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

// Default filters:
// • ingredient: an array; empty array means "all"
// • granularity: one of week/month/quarter/year
const defaultFilters = {
    ingredient: [],
    granularity: 'week'
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
    a.download = 'ingredients_consume_over_time.csv';
    a.click();
    URL.revokeObjectURL(url);
};

const IngredientsConsumeOverTimeChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [rawData, setRawData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    // New state for outlier detection toggle
    const [enableOutlierDetection, setEnableOutlierDetection] = useState(false);

    // For color generation for multiple lines
    const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28'];

    // Fetch data from API when filters change
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        // Set granularity and ingredient filters
        params.append('granularity', filters.granularity);
        if (filters.ingredient.length > 0) {
            params.append('ingredient', filters.ingredient.join(','));
        } else {
            params.append('ingredient', 'all');
        }
        // Expected API behavior:
        // - If a single ingredient is selected: [{ time, total_consumed }, …]
        // - Otherwise: [{ time, ingredient_name, total_consumed }, …]
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/ingredients-consume-over-time?${params.toString()}`)
            .then(response => {
                setRawData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching ingredients consume over time data:", error);
                setLoading(false);
            });
    }, [filters]);

    // Process rawData into chartData using the selected granularity as the x-axis
    useEffect(() => {
        if (!rawData.length) {
            setChartData([]);
            return;
        }
        const timeKey = filters.granularity; // 'week', 'month', 'quarter', or 'year'
        // When exactly one ingredient is selected
        if (filters.ingredient.length === 1) {
            const mapped = rawData.map(row => ({
                time: row[timeKey],
                total_consumed: row.total_consumed
            }));
            // Sort result by time (assumed orderable)
            mapped.sort((a, b) => a.time.localeCompare(b.time));
            setChartData(mapped);
        } else {
            // Pivot rawData: group by time and create a key for each ingredient
            const pivot = {};
            rawData.forEach(row => {
                const timeValue = row[timeKey];
                if (!pivot[timeValue]) {
                    pivot[timeValue] = { time: timeValue };
                }
                // Expecting row.ingredient_name from API
                pivot[timeValue][row.ingredient_name] = row.total_consumed;
            });
            const pivotArray = Object.values(pivot).sort((a, b) => a.time.localeCompare(b.time));
            setChartData(pivotArray);
        }
    }, [rawData, filters.ingredient, filters.granularity]);

    // Calculate mean and standard deviation for outlier detection if one ingredient is selected
    let mean = null, std = null;
    if (filters.ingredient.length === 1 && chartData.length > 0) {
        const series = chartData.map(item => item.total_consumed);
        mean = series.reduce((sum, val) => sum + val, 0) / series.length;
        std = Math.sqrt(series.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / series.length);
    }

    // Custom dot renderer to highlight outliers
    const renderCustomDot = (props) => {
        const { cx, cy, value } = props;
        if (value > mean + 2 * std || value < mean - 2 * std) {
            return <circle cx={cx} cy={cy} r={8} fill="red" stroke="black" />;
        }
        return <circle cx={cx} cy={cy} r={4} fill="#8884d8" />;
    };

    // Render filter controls including outlier detection tickbox
    const handleFilterChange = (e) => {
        const { name, value, options } = e.target;
        if (name === 'ingredient') {
            const selected = Array.from(options, option => option.selected ? option.value : null)
                                  .filter(val => val !== null);
            setFilters(prev => ({ ...prev, ingredient: selected }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div style={{ width: '100%', position: 'relative', padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>Ingredients Consumption Over Time</h2>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                {/* Ingredient Filter */}
                <label style={{ marginRight: '10px' }}>
                    Ingredient:
                    <select
                        name="ingredient"
                        multiple
                        style={{ marginLeft: '5px', padding: '5px' }}
                        value={filters.ingredient}
                        onChange={handleFilterChange}
                    >
                        <option value="Cheese">Cheese</option>
                        <option value="Tomato">Tomato</option>
                        <option value="Pepperoni">Pepperoni</option>
                        <option value="Mushroom">Mushroom</option>
                        {/* Add additional ingredient options as needed */}
                    </select>
                </label>
                {/* Granularity Filter */}
                <label style={{ marginLeft: '20px' }}>
                    Granularity:
                    <select
                        name="granularity"
                        style={{ marginLeft: '5px', padding: '5px' }}
                        value={filters.granularity}
                        onChange={handleFilterChange}
                    >
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="quarter">Quarter</option>
                        <option value="year">Year</option>
                    </select>
                </label>
                {/* Outlier Detection Toggle */}
                {filters.ingredient.length === 1 && (
                    <label style={{ marginLeft: '20px' }}>
                        <input
                            type="checkbox"
                            checked={enableOutlierDetection}
                            onChange={() => setEnableOutlierDetection(!enableOutlierDetection)}
                        />
                        Enable Outlier Detection
                    </label>
                )}
                <button
                    onClick={() => downloadCSV(chartData)}
                    style={{
                        marginLeft: '20px',
                        background: '#f7d9afff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 18px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Download Report
                </button>
            </div>
            {loading ? (
                <div>Loading Ingredients Consumption Chart...</div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {filters.ingredient.length === 1 ? (
                            <Line
                                type="monotone"
                                dataKey="total_consumed"
                                name="Total Consumed"
                                stroke="#8884d8"
                                dot={enableOutlierDetection ? renderCustomDot : undefined}
                            />
                        ) : (
                            // Render a Line for each ingredient when multiple or no ingredients are selected
                            Object.keys(chartData[0]).filter(key => key !== 'time').map((ingredient, index) => (
                                <Line
                                    key={ingredient}
                                    type="monotone"
                                    dataKey={ingredient}
                                    name={ingredient}
                                    stroke={lineColors[index % lineColors.length]}
                                />
                            ))
                        )}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default IngredientsConsumeOverTimeChart;