import React, { useEffect, useState } from 'react';
import {
  Box, CssBaseline, useTheme, useMediaQuery, Button, Paper, Typography, Grid
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import OrdersDistributionWeekdayChart from './OrdersDistributionWeekdayChart';
import OrdersDistributionWeekdaySizeChart from './OrdersDistributionWeekdaySizeChart';
import OrdersByHourChart from './OrdersByHourChart'; 
import PizzaLottie from '../components/PizzaLottie';
import { useNavigate } from 'react-router-dom'; 
import ProductPairsTable from './ProductPairsTable'; // <-- Changed import
import OrdersDistributionHourlyCategory from './OrdersDistributionHourlyCategory';
import OrdersDistributionHourlySize from './OrdersDistributionHourlySize';

const drawerWidth = 230;

/**
 * OrdersDashboard component
 * Displays the orders dashboard with charts, summary widget, and product pairs table.
 * Includes a "Back to Main Menu" button at the bottom of the page.
 */
const OrdersDashboard = (props) => {
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

  // Widget showing total orders sold
  const OrdersSoldWidget = () => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 5,
        bgcolor: "#fff7f0", // light orange
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
        <Typography variant="subtitle2" sx={{ color: "#fa7a1c", fontWeight: 700, mt: 2 }}>
          🎉 Amazing milestone!
        </Typography>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: "#fa7a1c", fontFamily: "'Inter', 'Roboto', sans-serif", mt: 0.5 }}
        >
          2,554,534
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}
        >
          Orders Sold!
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
        <TopBar title="Orders Dashboard" onMenuClick={() => setMobileOpen(true)} {...props} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, md: 3 }, width: '100%', pt: { xs: 7, md: 10 } }}>
          {/* Orders sold summary widget */}
          <Box sx={{ mb: 3, width: '100%' }}>
            <OrdersSoldWidget />
          </Box>
          {/* Chart 1: Orders by weekday and category */}
          <Box sx={{ mb: 3, width: '100%' }}>
            <Paper elevation={3} sx={{
              borderRadius: 5,
              p: 3,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif",
              height: 550,
              width: '100%'
            }}>
              <OrdersDistributionWeekdayChart />
            </Paper>
          </Box>
          <Box sx={{ mb: 3, width: '100%' }}>
            <Paper elevation={3} sx={{
              borderRadius: 5,
              p: 3,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif",
              height: 550,
              width: '100%'
            }}>
              <OrdersDistributionWeekdaySizeChart />
            </Paper>
          </Box>
          {/* Chart 3: Orders by hour */}
          <Box sx={{ mb: 3, width: '100%' }}>
            <Paper elevation={3} sx={{
              borderRadius: 5,
              p: 3,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif",
              width: '100%'
            }}>
              <OrdersByHourChart />
            </Paper>
          </Box>
          {/* Chart 4: Orders by hour and category/size */}
          <Box sx={{ mb: 3, width: '100%' }}>
            <Paper elevation={3} sx={{
              borderRadius: 5,
              p: 3,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif",
              height: 580,
              width: '100%'
            }}>
              <OrdersDistributionHourlyCategory />
            </Paper>
          </Box>
          <Box sx={{ mb: 3, width: '100%' }}>
            <Paper elevation={3} sx={{
              borderRadius: 5,
              p: 3,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif",
              height: 580,
              width: '100%'
            }}>
              <OrdersDistributionHourlySize />
            </Paper>
          </Box>
          {/* Table: Product Pairs (replaces ProductNetworkGraph) */}
          <Box sx={{ mb: 3, width: '100%' }}>
            <ProductPairsTable />
          </Box>
          {/* Spacer to push the button lower */}
          <Box sx={{ flexGrow: 1 }} />
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
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    </Box>
  );
};

export default OrdersDashboard;