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

// Default filters:
const defaultFilters = {
    ingredient: [],
    granularity: 'week'
};

// Ingredient options for react-select
const ingredientOptions = [
  { value: "BBQ Sauce", label: "BBQ Sauce" },
  { value: "Bacon", label: "Bacon" },
  { value: "Basil", label: "Basil" },
  { value: "Bell Peppers", label: "Bell Peppers" },
  { value: "Blue Cheese", label: "Blue Cheese" },
  { value: "Buffalo Sauce", label: "Buffalo Sauce" },
  { value: "Fresh Mozzarella", label: "Fresh Mozzarella" },
  { value: "Grilled Chicken", label: "Grilled Chicken" },
  { value: "Ham", label: "Ham" },
  { value: "Mozzarella", label: "Mozzarella" },
  { value: "Mushrooms", label: "Mushrooms" },
  { value: "Olive Oil", label: "Olive Oil" },
  { value: "Olives", label: "Olives" },
  { value: "Onions", label: "Onions" },
  { value: "Pepperoni", label: "Pepperoni" },
  { value: "Pineapple", label: "Pineapple" },
  { value: "Red Onions", label: "Red Onions" },
  { value: "Sausage", label: "Sausage" },
  { value: "Tomato Sauce", label: "Tomato Sauce" },
];

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
    const [enableOutlierDetection, setEnableOutlierDetection] = useState(false);

    const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28'];

    // Fetch data from API when filters change
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('granularity', filters.granularity);
        if (filters.ingredient.length > 0) {
            params.append('ingredient', filters.ingredient.join(','));
        } else {
            params.append('ingredient', 'all');
        }
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
        const timeKey = filters.granularity;
        if (filters.ingredient.length === 1) {
            const mapped = rawData.map(row => ({
                time: row[timeKey],
                total_consumed: row.total_consumed
            }));
            mapped.sort((a, b) => a.time.localeCompare(b.time));
            setChartData(mapped);
        } else {
            const pivot = {};
            rawData.forEach(row => {
                const timeValue = row[timeKey];
                if (!pivot[timeValue]) {
                    pivot[timeValue] = { time: timeValue };
                }
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

    // Tính mean/std cho từng ingredient khi chọn nhiều ingredient
    let ingredientStats = {};
    if (filters.ingredient.length > 1 && chartData.length > 0) {
        filters.ingredient.forEach(ingredient => {
            const series = chartData.map(item => item[ingredient]).filter(val => val !== undefined);
            if (series.length > 0) {
                const mean = series.reduce((sum, val) => sum + val, 0) / series.length;
                const std = Math.sqrt(series.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / series.length);
                ingredientStats[ingredient] = { mean, std };
            }
        });
    }

    // Hàm custom dot cho từng ingredient
    const getCustomDot = (ingredient) => (props) => {
        const { cx, cy, value } = props;
        const stats = ingredientStats[ingredient];
        if (!stats) return <circle cx={cx} cy={cy} r={4} fill={lineColors[filters.ingredient.indexOf(ingredient) % lineColors.length]} />;
        if (value > stats.mean + 2 * stats.std || value < stats.mean - 2 * stats.std) {
            return <circle cx={cx} cy={cy} r={8} fill="red" stroke="black" />;
        }
        return <circle cx={cx} cy={cy} r={4} fill={lineColors[filters.ingredient.indexOf(ingredient) % lineColors.length]} />;
    };

    // Handler for granularity change
    const handleGranularityChange = (e) => {
        setFilters(prev => ({ ...prev, granularity: e.target.value }));
    };

    return (
        <div style={{ width: '100%', position: 'relative', padding: '20px' }}>
            <div style={{ marginBottom: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                {/* Ingredient Filter with react-select */}
                <div style={{ minWidth: 300, display: 'inline-block', marginRight: 20 }}>
                    <Select
                        isMulti
                        options={ingredientOptions}
                        value={ingredientOptions.filter(opt => filters.ingredient.includes(opt.value))}
                        onChange={selectedOptions => {
                            setFilters(prev => ({
                                ...prev,
                                ingredient: selectedOptions ? selectedOptions.map(opt => opt.value) : []
                            }));
                        }}
                        placeholder="Select ingredient(s)..."
                        closeMenuOnSelect={false}
                        isClearable
                        styles={{
                            menu: base => ({ ...base, zIndex: 9999 }),
                            multiValue: base => ({
                                ...base,
                                backgroundColor: '#eaf7e9'
                            }),
                        }}
                    />
                </div>
                {/* Granularity Filter */}
                <label style={{ marginLeft: '20px' }}>
                    Granularity:
                    <select
                        name="granularity"
                        style={{ marginLeft: '5px', padding: '5px' }}
                        value={filters.granularity}
                        onChange={handleGranularityChange}
                    >
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="quarter">Quarter</option>
                        <option value="year">Year</option>
                    </select>
                </label>
                {/* Outlier Detection Toggle */}
                {filters.ingredient.length > 0 && (
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
                            chartData.length > 0 &&
                            Object.keys(chartData[0]).filter(key => key !== 'time').map((ingredient, index) => (
                                <Line
                                    key={ingredient}
                                    type="monotone"
                                    dataKey={ingredient}
                                    name={ingredient}
                                    stroke={lineColors[index % lineColors.length]}
                                    dot={enableOutlierDetection ? getCustomDot(ingredient) : undefined}
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