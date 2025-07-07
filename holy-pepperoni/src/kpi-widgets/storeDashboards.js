import React, { useEffect } from 'react';
import {
  Box, CssBaseline, Paper, useTheme, useMediaQuery, Typography, Button, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import StorePerformanceRankingChart from './StorePerformanceRankingChart';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import PizzaLottie from '../components/PizzaLottie';
import TopStoresByProductsSoldChart from './TopStoresByProductsSoldChart';


const drawerWidth = 230;

const StoreDashboards = (props) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate(); 

  // Inject Google Fonts: Inter + Roboto
  useEffect(() => {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@400;700&display=swap';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(preconnect1);
      document.head.removeChild(preconnect2);
    };
  }, []);

  // Widget Orders Sold với PizzaLottie
  const OrdersSoldWidget = () => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 5,
        bgcolor: "#fff7f0",
        boxShadow: "0 2px 12px rgba(250, 162, 138, 0.12)",
        fontFamily: "'Inter', 'Roboto', sans-serif",
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        color: "#fa7a1c"
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ color: "#fa7a1c", fontWeight: 700, mt: 8 }}>
          🎉 Amazing milestone!
        </Typography>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: "#fa7a1c", fontFamily: "'Inter', 'Roboto', sans-serif", mt: 0.5 }}
        >
          2,916,015
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}
        >
          Pizzas Sold!
        </Typography>
      </Box>
      <Box sx={{ width: 150, height: 150 }}>
        <PizzaLottie style={{ width: "100%", height: "100%" }} />
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#f5f7fb", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <CssBaseline />
      {isMdUp && <Sidebar />}
      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar title="Store Menu Page" {...props} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, md: 3 } }}>
          
          {/* Render the Orders Sold Widget */}
          <Box sx={{ mb: 4, width: '100%' }}>
            <OrdersSoldWidget />
          </Box>

          {/* Store Performance Ranking Chart */}
          <Box sx={{ width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Paper elevation={3} sx={{
                borderRadius: 5,
                p: 3,
                mb: 4, // Add margin-bottom to separate from next chart
                boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
                fontFamily: "'Inter', 'Roboto', sans-serif"
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                  Store Performance Ranking
                </Typography>
                <StorePerformanceRankingChart />
              </Paper>
            </motion.div>
          </Box>

          {/* --- ADD THE NEW CHART HERE --- */}
          {/* Top Stores by Products Sold Chart */}
          <Box sx={{ width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.2 }} 
        
            >
              <Paper elevation={3} sx={{
                borderRadius: 5,
                p: 3,
                mb: 4, // Add margin-bottom for spacing
                boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
                fontFamily: "'Inter', 'Roboto', sans-serif"
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                  Top Stores by Products Sold
                </Typography>
                <TopStoresByProductsSoldChart />
              </Paper>
            </motion.div>
          </Box>
          {/* --- END NEW CHART --- */}

          <Divider sx={{ my: 4 }} />

          {/* Back to Main Menu button */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              sx={{
                background: "#faa28a",
                borderRadius: "32px",
                color: "#fff",
                '&:hover': { background: "#fa7a1c" }
              }}
              onClick={() => navigate("/dashboard")}
            >
              Back to Main Menu
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};


export default StoreDashboards;