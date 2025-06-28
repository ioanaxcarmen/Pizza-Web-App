import React from 'react';

// This component takes the current filters and a function to update them
const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    state: 'all',
    storeId: ''
};

const DashboardFilters = ({ filters, setFilters }) => {
    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#f0f0f0', flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
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
            <div>
                <label>Store ID: </label>
                <input
                    type="text"
                    name="storeId"
                    value={filters.storeId || ""}
                    onChange={handleFilterChange}
                    placeholder="Store ID"
                    style={{ width: 100 }}
                />
            </div>
            <button onClick={handleResetFilters} style={{ height: 36 }}>
                Reset Filters
            </button>
        </div>
    );
};

export default DashboardFilters;