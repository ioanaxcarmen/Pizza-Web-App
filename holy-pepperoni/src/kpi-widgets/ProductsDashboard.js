import React, { useEffect } from 'react';
import {
  Box, CssBaseline, Paper, useTheme, useMediaQuery, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import ProductCohortSalesLineChart from './ProductCohortSalesLineChart';
import ProductDistributionPieCharts from './ProductDistributionPieCharts';
import ProductRevenuePieBySize from './ProductRevenuePieBySize';
import TopSellingProductsChart from './TopSellingProductsChart';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import CookingChef from '../components/CookingChef';
import Lottie from "lottie-react";
import chefAnimation from "../components/chef.json";

const drawerWidth = 230;

const ProductsDashboard = (props) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

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

  // Widget Orders Sold với Chef trắng và to hơn
  const OrdersSoldWidget = () => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 5,
        bgcolor: "#fff", // nền trắng hoàn toàn
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
          🎉 You're doing amazing!
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
      <Box sx={{ width: 300, height: 290 }}>
        <Lottie
          animationData={chefAnimation}
          loop={true}
          style={{
            width: "100%",
            height: "100%"
          }}
        />
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#f5f7fb", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <CssBaseline />
      {isMdUp && <Sidebar />}
      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` } }}>
        <TopBar title="Products Dashboard" {...props} />

        {/* Widget tổng số orders và animation chef trắng to */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            mt: 10,
            mb: 3,
            px: { xs: 1, md: 3 }
          }}
        >
          <OrdersSoldWidget />
        </Box>

        <Box sx={{ p: { xs: 0, md: 0 } }}>
          {/* Product Cohort Sales Line Chart */}
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

          {/* Product Distribution Pie Charts */}
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

          {/* Product Revenue Pie By Size */}
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

          {/* Top Selling Products Chart */}
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
        </Box>
      </Box>
    </Box>
  );
};

export default ProductsDashboard;