import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Box } from '@mui/material';
import LoadingPizza from '../components/LoadingPizza';

const KpiCard = ({ title, endpoint }) => {
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}${endpoint}`)
            .then(response => {
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
            <Typography variant="h6" fontWeight="bold" color="text.secondary">
                {title}
            </Typography>
            {loading ? <LoadingPizza /> : (
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#faa28a', mt: 1 }}>
                    {/* Format number with commas */}
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
            )}
        </Paper>
    );
};

export default KpiCard;