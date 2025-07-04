import React, { useEffect } from 'react';
import {
  Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Drawer,
  List, ListItem, ListItemIcon, ListItemText, Grid, Paper, Divider, useTheme, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import { motion } from 'framer-motion';
import ProductCohortSalesLineChart from './ProductCohortSalesLineChart';
import ProductDistributionPieCharts from './ProductDistributionPieCharts';
import ProductRevenuePieBySize from './ProductRevenuePieBySize';
import TopSellingProductsChart from './TopSellingProductsChart';

const drawerWidth = 230;

const navItems = [
  { icon: <DashboardIcon />, label: 'Dashboard' },
  { icon: <AnalyticsIcon />, label: 'Analytics' },
  { icon: <SettingsIcon />, label: 'Settings' }
];

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{ sx: { width: drawerWidth, background: "#232a37", color: "#fff" } }}
      sx={{ display: { xs: 'none', md: 'block' } }}
      open
    >
      <Box sx={{ p: 2, mb: 2, textAlign: 'center', fontWeight: 700, fontSize: 24, letterSpacing: 2 }}>
        🍕 HOLLY  PEPPERONI 🍕
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <List>
        {navItems.map((item, idx) => (
          <ListItem button key={idx} sx={{
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            transition: 'background 0.2s'
          }}>
            <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

function TopBar() {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        background: "#fff",
        color: "#232a37",
        boxShadow: "0 2px 8px rgba(35,42,55,0.04)"
      }}
      elevation={1}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 68 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit" sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
            Products Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Avatar sx={{ bgcolor: "#faa28a", width: 36, height: 36 }}>
            <AccountCircle sx={{ color: "#fff" }} />
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

const ProductsDashboard = () => {
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#f5f7fb", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <CssBaseline />
      {isMdUp && <Sidebar />}
      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` } }}>
        <TopBar />
        <Box sx={{ mt: 10, p: { xs: 1, md: 3 } }}>
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
                Product Sales Distribution by Category
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
