import React from 'react';

// Default filter values for the dashboard
const defaultFilters = {
    year: 'all',
    quarter: 'all',
    month: 'all',
    week: 'all',
    state: 'all',
    storeId: '',
    productLaunchYear: 'all',
    productLaunchMonth: 'all'
};

/**
 * DashboardFilters component
 * Renders a set of dropdowns for filtering dashboard data by store, year, quarter, month, week, and state.
 * Props:
 *   - filters: current filter state
 *   - setFilters: function to update filter state
 *   - storeOptions: array of store objects for the store dropdown
 */
const DashboardFilters = ({ filters, setFilters, storeOptions = [] }) => {
    /**
     * Handles changes to any filter dropdown.
     * Updates the filters state and resets dependent filters if needed.
     */
    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prevFilters => {
            let newFilters = { ...prevFilters, [name]: value };
            // If month is changed, format it with year if year is selected
            if (name === 'month') {
                if (value === 'all' || !prevFilters.year || prevFilters.year === 'all') {
                    newFilters.month = value;
                } else {
                    newFilters.month = `${prevFilters.year}-${value.padStart(2, '0')}`;
                }
            }
            // If quarter is changed, format it with year if year is selected
            if (name === 'quarter') {
                if (value === 'all' || !prevFilters.year || prevFilters.year === 'all') {
                    newFilters.quarter = value;
                } else {
                    newFilters.quarter = `${prevFilters.year}-"Q"${value}`;
                }
            }
            // If week is changed, format it with year if year is selected
            if (name === 'week') {
                if (value === 'all' || !prevFilters.year || prevFilters.year === 'all') {
                    newFilters.week = value;
                } else {
                    newFilters.week = `${prevFilters.year}-${value.padStart(2, '0')}`;
                }
            }
            // If year is changed, reset month, quarter, and week filters
            if (name === 'year') {
                newFilters.month = 'all';
                newFilters.quarter = 'all';
                newFilters.week = 'all';
            }
            return newFilters;
        });
    };

    /**
     * Resets all filters to their default values.
     */
    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        // Filter bar container
        <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#f0f0f0', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Store filter dropdown */}
            <div>
                <label>Store: </label>
                <select name="storeId" value={filters.storeId || ""} onChange={handleFilterChange}>
                    <option value="">All Stores</option>
                    {storeOptions && storeOptions.map(store => (
                        <option key={store.storeid} value={store.storeid}>{store.name}</option>
                    ))}
                </select>
            </div>
            {/* Year filter dropdown */}
            <div>
                <label>Year: </label>
                <select name="year" value={filters.year} onChange={handleFilterChange}>
                    <option value="all">All Years</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                </select>
            </div>
            {/* Quarter filter dropdown */}
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
            {/* Month filter dropdown */}
            <div>
                <label>Month: </label>
                <select name="month" value={filters.month || "all"} onChange={handleFilterChange}>
                    <option value="all">All Months</option>
                    {/* Generate month options dynamically */}
                    {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                            {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                        </option>
                    ))}
                </select>
            </div>
            {/* Week filter dropdown */}
            <div>
                <label>Week: </label>
                <select name="week" value={filters.week || "all"} onChange={handleFilterChange}>
                    <option value="all">All Weeks</option>
                    {/* Generate week options dynamically (1-53) */}
                    {[...Array(53)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                            {`Week ${i + 1}`}
                        </option>
                    ))}
                </select>
            </div>
            {/* State filter dropdown */}
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
                <label>Product Launch Year: </label>
                <select name="productLaunchYear" value={filters.productLaunchYear || "all"} onChange={handleFilterChange}>
                    <option value="all">All Launch Years</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                </select>
            </div>
            <div>
                <label>Product Launch Month: </label>
                <select name="productLaunchMonth" value={filters.productLaunchMonth || "all"} onChange={handleFilterChange}>
                    <option value="all">All Launch Months</option>
                    {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                            {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                        </option>
                    ))}
                </select>
            </div>
            {/* Button to reset all filters */}
            <button onClick={handleResetFilters} style={{ height: 36 }}>
                Reset Filters
            </button>
        </div>
    );
};

export default DashboardFilters;