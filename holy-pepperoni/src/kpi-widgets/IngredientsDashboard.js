import React, { useEffect, useState } from 'react';
import {
  Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Drawer,
  List, ListItem, ListItemIcon, ListItemText, Grid, Paper, Divider, Button, useTheme, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import { motion } from 'framer-motion';
import TopIngredientsChart from '../kpi-widgets/TopIngredientsChart';
import IngredientsConsumeOverTimeChart from '../kpi-widgets/IngredientsConsumeOverTimeChart';
import TopIngredientsByStorePieChart from '../kpi-widgets/TopIngredientsByStorePieChart';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        🍕 LOGO
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
            Ingredients Dashboard
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

const DashboardStat = ({ label, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 36 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay }}
    whileHover={{ scale: 1.04, boxShadow: "0 6px 20px rgba(250, 162, 138, 0.22)" }}
  >
    <Paper elevation={2} sx={{
      p: 3,
      textAlign: 'center',
      minWidth: 180,
      borderRadius: 5,
      bgcolor: "#fff8f3",
      boxShadow: "0 2px 12px rgba(250, 162, 138, 0.12)",
      fontFamily: "'Inter', 'Roboto', sans-serif"
    }}>
      <Typography variant="h5" fontWeight="bold" sx={{ color: "#fa7a1c", fontFamily: "'Inter', 'Roboto', sans-serif" }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>{label}</Typography>
    </Paper>
  </motion.div>
);

const pageTitle = "Ingredients Dashboard";

const IngredientsDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIngredients: '...',
    minIngredients: '...',
    maxIngredients: '...'
  });

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

  // Fetch stats from backend
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/ingredients-dashboard-stats`)
      .then(res => {
        setStats({
          totalIngredients: res.data.totalIngredients,
          minIngredients: res.data.minIngredients,
          maxIngredients: res.data.maxIngredients
        });
      })
      .catch(() => {
        setStats({
          totalIngredients: 'N/A',
          minIngredients: 'N/A',
          maxIngredients: 'N/A'
        });
      });
  }, []);

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#f5f7fb", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <CssBaseline />
      {isMdUp && <Sidebar />}
      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` } }}>
        <TopBar />
        <Box sx={{ mt: 10, p: { xs: 1, md: 3 } }}>
          {/* Stats Widgets with animation */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4} md={2}>
              <DashboardStat label="Total Ingredients" value={stats.totalIngredients} delay={0.1} />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <DashboardStat label="Min Ingredients per Product" value={stats.minIngredients} delay={0.3} />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <DashboardStat label="Max Ingredients per Product" value={stats.maxIngredients} delay={0.5} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Charts Section with animation */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <Paper elevation={3} sx={{
              borderRadius: 5,
              p: 3,
              mb: 4,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                Ingredients Consumed Over Time
              </Typography>
              <IngredientsConsumeOverTimeChart />
            </Paper>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.27 }}
          >
            <Paper elevation={3} sx={{
              borderRadius: 5,
              p: 3,
              mb: 4,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                Top 5 Ingredients - Total Quantity Used
              </Typography>
              <TopIngredientsChart topN={5} />
            </Paper>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
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
                Top 5 Ingredients by Store
              </Typography>
              <TopIngredientsByStorePieChart topN={5} groupBy="store" />
            </Paper>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              variant="contained"
              sx={{
                background: "#faa28a",
                borderRadius: "32px",
                color: "#fff",
                fontWeight: 700,
                px: 5,
                py: 1.5,
                mt: 3,
                fontSize: "1.1rem",
                fontFamily: "'Inter', 'Roboto', sans-serif",
                '&:hover': { background: "#fa7a1c" }
              }}
              onClick={() => navigate("/ingredients")}
            >
              Back
            </Button>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default IngredientsDashboard;