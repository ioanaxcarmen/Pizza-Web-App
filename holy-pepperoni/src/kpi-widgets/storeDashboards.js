import React, { useEffect, useState } from 'react'; // Added useState for the widget's internal state
import {
  Box, CssBaseline, Paper, useTheme, useMediaQuery, Typography, Button, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
// --- Store-specific chart imports ---
import StorePerformanceRankingChart from '../kpi-widgets/StorePerformanceRankingChart';
import TopStoresByProductsSoldChart from '../kpi-widgets/TopStoresByProductsSoldChart';
import AverageOrderValuePerStoreChart from './AverageOrderValuePerStoreChart';
// Removed TotalStoresWidget import as its functionality is now merged
// import TotalStoresWidget from '../kpi-widgets/TotalStoresWidget'; 

import TotalStoresWidget from './TotalStoresWidget';



const drawerWidth = 230;

const StoreDashboards = (props) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  // Inject Google Fonts: Inter + Roboto (Important for consistent styling)
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


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#f5f7fb", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <CssBaseline />
      {isMdUp && <Sidebar />}


      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar title="Stores Dashboard" {...props} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, md: 3 } }}>
          {/* Widget tổng số orders và animation pizza */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              mt: 5,
              mb: 3,
              width: '100%' // Thêm dòng này
            }}
          >
            <TotalStoresWidget />
          </Box>
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
              mb: 4,
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
              mb: 4,
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
              mb: 4,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                Store Performance Ranking
              </Typography>
              <AverageOrderValuePerStoreChart />
            </Paper>
          </motion.div>
        </Box>

        {/* You can add more store-related charts here, e.g.: */}
        {/* <Box sx={{ width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Paper elevation={3} sx={{
                borderRadius: 5,
                p: 3,
                mb: 4, 
                boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
                fontFamily: "'Inter', 'Roboto', sans-serif"
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                  Store Rank by Active Customers
                </Typography>
                <StoreRankByCustomersChart />
              </Paper>
            </motion.div>
          </Box> */}


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
      </Box >
    </Box >




  );

};

export default StoreDashboards;
