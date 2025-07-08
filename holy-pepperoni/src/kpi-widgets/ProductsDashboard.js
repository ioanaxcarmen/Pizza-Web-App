import React, { useEffect, useState } from 'react';
import {
  Box, CssBaseline, Paper, useTheme, useMediaQuery, Typography, Button, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import ProductCohortSalesLineChart from './ProductCohortSalesLineChart';
import ProductDistributionPieCharts from './ProductDistributionPieCharts';
import ProductRevenuePieBySize from './ProductRevenuePieBySize';
import TopSellingProductsChart from './TopSellingProductsChart';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import PizzaLottie from '../components/PizzaLottie';
import TopProductsTable from './TopProductsTable';

const drawerWidth = 230;

const ProductsDashboard = (props) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate(); 
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <Typography variant="subtitle2" sx={{ color: "#fa7a1c", fontWeight: 700 }}>
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <>
      <TopBar onMenuClick={() => setMobileOpen(true)} {...props} />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#f5f7fb", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
        <CssBaseline />
        {isMdUp && <Sidebar />}
        <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <TopBar title="Products Dashboard" onMenuClick={() => setMobileOpen(true)} onLogout={handleLogout} {...props} />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, md: 3 } }}>
           
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                mt: 5,
                mb: 3,
                width: '100%' 
              }}
            >
              <OrdersSoldWidget />
            </Box>

            
            <Box sx={{ width: '100%' }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Paper elevation={3} sx={{
                  borderRadius: 5,
                  p: 3,
                  mb: 4,
                  boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
                  fontFamily: "'Inter', 'Roboto', sans-serif"
                }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                    Top Selling Products
                  </Typography>
                  <TopSellingProductsChart />
                </Paper>
              </motion.div>

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
                    Product Cohort Sales Over Time
                  </Typography>
                  <ProductCohortSalesLineChart />
                </Paper>
              </motion.div>

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
                    Product Revenue Distribution by Category
                  </Typography>
                  <ProductDistributionPieCharts />
                </Paper>
              </motion.div>

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
                    Product Revenue Distribution by Size
                  </Typography>
                  <ProductRevenuePieBySize />
                </Paper>
              </motion.div>

              
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: 0.45 }}
              >
                <Paper elevation={3} sx={{
                  borderRadius: 5,
                  p: 3,
                  mb: 4,
                  boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
                  fontFamily: "'Inter', 'Roboto', sans-serif"
                }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                    Top Products 3 Months Since Launch
                  </Typography>
                  <TopProductsTable />
                </Paper>
              </motion.div>
            </Box>


            <Divider sx={{ my: 4 }} />

            {/* Back to Main Menu button, now lower on the page */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                sx={{
                  background: "#faa28a",
                  borderRadius: "32px",
                  color: "#fff",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  px: 5,
                  py: 1.5,
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
    </>
  );
};

export default ProductsDashboard;