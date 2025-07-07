import React, { useEffect, useState } from 'react'; // Added useState for the widget's internal state
import {
  Box, CssBaseline, Paper, useTheme, useMediaQuery, Typography
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
// --- Store-specific chart imports ---
import StorePerformanceRankingChart from '../kpi-widgets/StorePerformanceRankingChart';
import TopStoresByProductsSoldChart from '../kpi-widgets/TopStoresByProductsSoldChart';
// Removed TotalStoresWidget import as its functionality is now merged
// import TotalStoresWidget from '../kpi-widgets/TotalStoresWidget'; 

// Assuming PizzaLottie is used somewhere else or you want to keep it for a future widget
import PizzaLottie from '../components/PizzaLottie';
import { motion } from 'framer-motion';
import TotalStoresWidget from './TotalStoresWidget';


const drawerWidth = 230;

const StoreDashboards = (props) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

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

  // --- MODIFIED WIDGET: Now displays Total Stores with PizzaLottie animation ---
  const TotalStoresAnimatedWidget = () => {
    const [totalStores, setTotalStores] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchTotalStores = async () => {
        setLoading(true);
        setError(null);
        try {
          const url = `http://localhost:3001/api/kpi/total-stores-count`; // API endpoint for total stores
          console.log("Fetching Total Stores Count for Widget from URL:", url);

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Received Total Stores Count for Widget data:", data);
          setTotalStores(data.totalStores);

        } catch (err) {
          console.error("Error fetching total stores count for widget:", err);
          setError("Failed to load total stores count.");
        } finally {
          setLoading(false);
        }
      };

      fetchTotalStores();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) {
      return (
        <Paper elevation={2} sx={{ ...widgetStyles, bgcolor: "#fff7f0", color: "#fa7a1c" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">Loading Stores...</Typography>
          </Box>
        </Paper>
      );
    }

    if (error) {
      return (
        <Paper elevation={2} sx={{ ...widgetStyles, bgcolor: "#ffebee", color: "#d32f2f" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">{error}</Typography>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 5,
          bgcolor: "#fff7f0", // Light orange background
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

  // Styles for the widget (used by TotalStoresAnimatedWidget)
  const widgetStyles = {
    p: 3,
    borderRadius: 5,
    fontFamily: "'Inter', 'Roboto', sans-serif",
    minWidth: 300,
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  };
  // --- END MODIFIED WIDGET ---

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

            </Box>
          </Box>
        
        );
};

        export default StoreDashboards;
