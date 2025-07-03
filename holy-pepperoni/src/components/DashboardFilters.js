import React from 'react';

// This component takes the current filters and a function to update them
const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    week: 'all',
    state: 'all',
    storeId: ''
};

const DashboardFilters = ({ filters, setFilters, storeOptions = [] }) => {
    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prevFilters => {
            let newFilters = { ...prevFilters, [name]: value };
            // Month
            if (name === 'month') {
                if (value === 'all' || !prevFilters.year || prevFilters.year === 'all') {
                    newFilters.month = value;
                } else {
                    newFilters.month = `${prevFilters.year}-${value.padStart(2, '0')}`;
                }
            }
            // Quarter
            if (name === 'quarter') {
                if (value === 'all' || !prevFilters.year || prevFilters.year === 'all') {
                    newFilters.quarter = value;
                } else {
                    newFilters.quarter = `${prevFilters.year}-"Q"${value}`;
                }
            }
            // Week
            if (name === 'week') {
                if (value === 'all' || !prevFilters.year || prevFilters.year === 'all') {
                    newFilters.week = value;
                } else {
                    newFilters.week = `${prevFilters.year}-${value.padStart(2, '0')}`;
                }
            }
            // Nếu đổi year thì reset các filter phụ
            if (name === 'year') {
                newFilters.month = 'all';
                newFilters.quarter = 'all';
                newFilters.week = 'all';
            }
            return newFilters;
        });
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#f0f0f0', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
                <label>Store: </label>
                <select name="storeId" value={filters.storeId || ""} onChange={handleFilterChange}>
                    <option value="">All Stores</option>
                    {storeOptions && storeOptions.map(store => (
                        <option key={store.storeid} value={store.storeid}>{store.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Year: </label>
                <select name="year" value={filters.year} onChange={handleFilterChange}>
                    <option value="all">All Years</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                </select>
            </div>
            <div>
                <label>Quarter: </label>
                <select name="quarter" value={filters.quarter || "all"} onChange={handleFilterChange}>
                    <option value="all">All Quarters</option>
                    <option value="1">Q1</option>
                    <option value="2">Q2</option>
                    <option value="3">Q3</option>
                    <option value="4">Q4</option>
                </select>
            </div>
            <div>
                <label>Month: </label>
                <select name="month" value={filters.month || "all"} onChange={handleFilterChange}>
                    <option value="all">All Months</option>
                    {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                            {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Week: </label>
                <select name="week" value={filters.week || "all"} onChange={handleFilterChange}>
                    <option value="all">All Weeks</option>
                    {[...Array(53)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                            {`Week ${i + 1}`}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>State: </label>
                <select name="state" value={filters.state} onChange={handleFilterChange}>
                    <option value="all">All States</option>
                    <option value="CA">California</option>
                    <option value="NV">Nevada</option>
                    <option value="AZ">Arizona</option>
                    <option value="UT">Utah</option>
                </select>
            </div>
            <button onClick={handleResetFilters} style={{ height: 36 }}>
                Reset Filters
            </button>
        </div>
    );
};

export default DashboardFilters;