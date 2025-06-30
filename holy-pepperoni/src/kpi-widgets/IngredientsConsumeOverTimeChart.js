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
    a.download = 'ingredients_consumed_over_time.csv';
    a.click();
    URL.revokeObjectURL(url);
};

const IngredientsConsumeOverTimeChart = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [rawData, setRawData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    // For color generation for multiple lines
    const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28'];

    // Fetch data from API when filters change
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        // Pass granularity regardless
        params.append('granularity', filters.granularity);
        // For ingredient filter: if at least one is selected, join them with a comma; otherwise, indicate "all"
        if (filters.ingredient.length > 0) {
            params.append('ingredient', filters.ingredient.join(','));
        } else {
            params.append('ingredient', 'all');
        }
        // Expected API behavior:
        // - If a single ingredient is selected: [{ time, total_consumed }, …]
        // - If "all" or multiple ingredients: [{ time, ingredient_name, total_consumed }, …]
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/ingredients-consumed-over-time?${params.toString()}`)
            .then(response => {
                setRawData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching ingredients consumed over time data:", error);
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
        // If exactly one ingredient is selected, assume rawData is already in { time, total_consumed } format.
        // Otherwise (none or multiple), pivot the rawData.
        if (filters.ingredient.length === 1) {
            const mapped = rawData.map(row => ({
                time: row[timeKey],
                total_consumed: row.total_consumed
            }));
            setChartData(mapped);
        } else {
            // Pivot rawData: group by time and create a key for each ingredient
            const pivot = {};
            rawData.forEach(row => {
                const timeValue = row[timeKey];
                if (!pivot[timeValue]) {
                    pivot[timeValue] = { time: timeValue };
                }
                // row.ingredient_name is expected from the API when multiple (or all) ingredients are requested
                pivot[timeValue][row.ingredient_name] = row.total_consumed;
            });
            const pivotArray = Object.values(pivot).sort((a, b) => a.time.localeCompare(b.time));
            setChartData(pivotArray);
        }
    }, [rawData, filters.ingredient, filters.granularity]);

    // Render filter controls
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

    if (loading) {
        return <div>Loading Ingredients Consumption Chart...</div>;
    }

    return (
        <div style={{ width: '100%', position: 'relative', padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>Ingredients Consumption Over Time</h2>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
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
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(tick) => tick} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {filters.ingredient.length === 1 ? (
                        <Line type="monotone" dataKey="total_consumed" name="Total Consumed" stroke="#8884d8" />
                    ) : (
                        chartData.length > 0
                            ? Object.keys(chartData[0]).filter(key => key !== 'time').map((ingredient, index) => (
                                <Line
                                    key={ingredient}
                                    type="monotone"
                                    dataKey={ingredient}
                                    name={ingredient}
                                    stroke={lineColors[index % lineColors.length]}
                                />
                            ))
                            : null
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default IngredientsConsumeOverTimeChart;