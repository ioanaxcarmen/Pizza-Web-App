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
    const [showAverage, setShowAverage] = useState(false);

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

    // Calculate mean and std for each ingredient (even if only one)
    let ingredientStats = {};
    if (chartData.length > 0) {
        const keys = filters.ingredient.length === 1
            ? ['total_consumed']
            : Object.keys(chartData[0]).filter(key => key !== 'time');
        keys.forEach(ingredient => {
            const series = chartData.map(item => item[ingredient]).filter(val => val !== undefined);
            if (series.length > 0) {
                const mean = series.reduce((sum, val) => sum + val, 0) / series.length;
                const std = Math.sqrt(series.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / series.length);
                ingredientStats[ingredient] = { mean, std };
            }
        });
    }

    // Custom dot for outlier detection
    const getCustomDot = (ingredient) => (props) => {
        const { cx, cy, value } = props;
        const stats = ingredientStats[ingredient];
        if (!stats) return null;
        if (value > stats.mean + 2 * stats.std || value < stats.mean - 2 * stats.std) {
            // Highlight outlier node in red
            return <circle cx={cx} cy={cy} r={8} fill="red" stroke="black" />;
        }
        // All other nodes: default color (do not override)
        return null;
    };

    // Average line data
    let averageData = [];
    if (chartData.length > 0 && filters.ingredient.length > 0) {
        averageData = chartData.map(row => {
            const keys = filters.ingredient.length === 1
                ? ['total_consumed']
                : Object.keys(row).filter(key => key !== 'time');
            const values = keys.map(k => Number(row[k]) || 0);
            const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            return { time: row.time, average: avg };
        });
    }

    // Handler for granularity change
    const handleGranularityChange = (e) => {
        setFilters(prev => ({ ...prev, granularity: e.target.value }));
    };

    let mergedChartData = chartData;
    if (showAverage && chartData.length > 0 && filters.ingredient.length > 0) {
        mergedChartData = chartData.map(row => {
            const keys = filters.ingredient.length === 1
                ? ['total_consumed']
                : Object.keys(row).filter(key => key !== 'time');
            const values = keys.map(k => Number(row[k]) || 0);
            const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            return { ...row, average: avg };
        });
    } else {
        mergedChartData = chartData;
    }

    return (
        <div style={{ width: '100%', position: 'relative', padding: '20px' }}>
            {/* Filter Controls */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 24,
                    background: '#fff7f0',
                    borderRadius: 16,
                    padding: '16px 20px',
                    boxShadow: '0 2px 8px #f7d9af44'
                }}
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                    {/* Ingredient Filter with react-select */}
                    <div style={{ minWidth: 220, maxWidth: 320, width: '100%', display: 'inline-block' }}>
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
                                container: base => ({
                                    ...base,
                                    minWidth: 220,
                                    maxWidth: 320,
                                    width: '100%',
                                }),
                                menu: base => ({ ...base, zIndex: 9999 }),
                                multiValue: base => ({
                                    ...base,
                                    backgroundColor: '#eaf7e9'
                                }),
                            }}
                        />
                    </div>
                    {/* Granularity Filter */}
                    <label style={{ marginRight: 12 }}>
                        Granularity:
                        <select
                            name="granularity"
                            style={{ marginLeft: '10px', padding: '5px' }}
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
                    <label style={{ marginRight: 12 }}>
                        <input
                            type="checkbox"
                            checked={enableOutlierDetection}
                            onChange={() => setEnableOutlierDetection(!enableOutlierDetection)}
                        />
                        Enable Outlier Detection
                    </label>
                    {/* Average Line Toggle */}
                    <label style={{ marginRight: 12 }}>
                        <input
                            type="checkbox"
                            checked={showAverage}
                            onChange={() => setShowAverage(!showAverage)}
                        />
                        Show Average Line
                    </label>
                </div>
                <div>
                    <button
                        onClick={() => downloadCSV(chartData)}
                        style={{
                            background: '#f7d9afff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            padding: '12px 28px',
                            fontSize: '1rem',
                            boxShadow: '0 2px 8px #eee',
                            cursor: 'pointer'
                        }}
                    >
                        Download Report
                    </button>
                </div>
            </div>
            {loading ? (
                <LoadingPizza />
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={mergedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                dot={enableOutlierDetection ? getCustomDot('total_consumed') : true}
                            />
                        ) : (
                            mergedChartData.length > 0 &&
                            Object.keys(mergedChartData[0]).filter(key => key !== 'time').map((ingredient, index) => (
                                <Line
                                    key={ingredient}
                                    type="monotone"
                                    dataKey={ingredient}
                                    name={ingredient}
                                    stroke={lineColors[index % lineColors.length]}
                                    dot={enableOutlierDetection ? getCustomDot(ingredient) : true}
                                />
                            ))
                        )}
                        {showAverage && averageData.length > 0 && (
                            <Line
                                type="monotone"
                                dataKey="average"
                                name="Average"
                                stroke="#000"
                                strokeDasharray="5 5"
                                dot={false}
                                data={averageData}
                                isAnimationActive={false}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default IngredientsConsumeOverTimeChart;