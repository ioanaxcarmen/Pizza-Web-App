import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StoreIcon from '@mui/icons-material/Store'; // Using MUI icon for stores
import PizzaLottie from '../components/PizzaLottie';

const TotalStoresWidget = () => {
    const [totalStores, setTotalStores] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTotalStores = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `http://localhost:3001/api/kpi/total-stores-count`;
                console.log("Fetching Total Stores Count from URL:", url);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Received Total Stores Count data:", data);
                setTotalStores(data.totalStores);

            } catch (err) {
                console.error("Error fetching total stores count:", err);
                setError("Failed to load total stores count.");
            } finally {
                setLoading(false);
            }
        };

        fetchTotalStores();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) {
        return (
            <Paper elevation={2} sx={{ ...widgetStyles, bgcolor: "#e0f2f7", color: "#0288d1" }}>
                <Typography variant="h6" fontWeight="bold">Loading...</Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={2} sx={{ ...widgetStyles, bgcolor: "#ffebee", color: "#d32f2f" }}>
                <Typography variant="h6" fontWeight="bold">{error}</Typography>
            </Paper>
        );
    }

    return (
        <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 5,
        bgcolor: "#fff7f0", // cam nhạt
        boxShadow: "0 2px 12px rgba(250, 162, 138, 0.12)",
        fontFamily: "'Inter', 'Roboto', sans-serif",
        minWidth: 340,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        color: "#fa7a1c"
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ color: "#fa7a1c", fontWeight: 700 }}>
          📍 Our Network
        </Typography>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: "#fa7a1c", fontFamily: "'Inter', 'Roboto', sans-serif", mt: 0.5 }}
        >
          {totalStores.toLocaleString()}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}
        >
          Stores!
        </Typography>
      </Box>
      <Box sx={{ width: 150, height: 150 }}>
        <PizzaLottie style={{ width: "100%", height: "100%" }} />
      </Box>
    </Paper>
  );
};

const widgetStyles = {
    p: 3,
    borderRadius: 5,
    fontFamily: "'Inter', 'Roboto', sans-serif",
    minWidth: 300, // Adjusted minWidth for better layout flexibility
    display: 'flex',
    alignItems: 'center',
    gap: 3,
};

export default TotalStoresWidget;
