import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Box } from '@mui/material';
import LoadingPizza from '../components/LoadingPizza';

/**
 * KpiCard component
 * Displays a single KPI value in a styled card.
 * Fetches the KPI value from the backend using the provided endpoint.
 * Shows a loading animation while fetching.
 * Props:
 *   - title: string, the label for the KPI
 *   - endpoint: string, API endpoint to fetch the KPI value
 */
const KpiCard = ({ title, endpoint }) => {
    // State to hold the KPI value
    const [value, setValue] = useState(0);
    // State to track loading status
    const [loading, setLoading] = useState(true);

    // Fetch KPI value from backend API when endpoint or title changes
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}${endpoint}`)
            .then(response => {
                // Set the first value from the response object as the KPI value
                setValue(Object.values(response.data)[0]);
                setLoading(false);
            })
            .catch(error => {
                console.error(`Error fetching KPI for ${title}:`, error);
                setLoading(false);
            });
    }, [endpoint, title]);

    return (
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderRadius: 5, height: '100%' }}>
            {/* KPI title */}
            <Typography variant="h6" fontWeight="bold" color="text.secondary">
                {title}
            </Typography>
            {/* Show loading animation or the KPI value */}
            {loading ? <LoadingPizza /> : (
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#faa28a', mt: 1 }}>
                    {/* Format number with commas for readability */}
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
            )}
        </Paper>
    );
};

export default KpiCard;