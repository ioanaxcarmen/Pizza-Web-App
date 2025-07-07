import React, { useEffect } from 'react';
import {
  Box, CssBaseline, useTheme, useMediaQuery
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import OrdersDistributionWeekdayChart from './OrdersDistributionWeekdayChart';
import OrdersDistributionWeekdaySizeChart from './OrdersDistributionWeekdaySizeChart';
import OrdersDistributionHourlyCategory from './OrdersDistributionHourlyCategory';
import OrdersDistributionHourlySize from './OrdersDistributionHourlySize';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import PizzaLottie from '../components/PizzaLottie';

const drawerWidth = 230;

const OrdersDashboard = (props) => {
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

  const OrdersSoldWidget = () => (
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
        <TopBar title="Orders Dashboard" {...props} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, md: 3 }, width: '100%', pt: { xs: 7, md: 10 } }}>
          <Box sx={{ mb: 3, width: '100%' }}>
            <OrdersSoldWidget />
          </Box>
          {/* Chart 1 & 2: Weekday charts side by side */}
          <Box sx={{ mb: 3, width: '100%', display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Paper elevation={3} sx={{
              flex: 1,
              borderRadius: 5,
              p: 3,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}>
              <OrdersDistributionWeekdayChart />
            </Paper>
            <Paper elevation={3} sx={{
              flex: 1,
              borderRadius: 5,
              p: 3,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}>
              <OrdersDistributionWeekdaySizeChart />
            </Paper>
          </Box>
          {/* Chart 3 & 4: Hourly charts side by side */}
          <Box sx={{ mb: 3, width: '100%', display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Paper elevation={3} sx={{
              flex: 1,
              borderRadius: 5,
              p: 3,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}>
              <OrdersDistributionHourlyCategory />
            </Paper>
            <Paper elevation={3} sx={{
              flex: 1,
              borderRadius: 5,
              p: 3,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}>
              <OrdersDistributionHourlySize />
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OrdersDashboard;