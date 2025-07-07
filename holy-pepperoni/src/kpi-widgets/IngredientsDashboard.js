import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Grid, Paper, Divider, Button, useTheme, useMediaQuery
} from '@mui/material';
import TopIngredientsChart from '../kpi-widgets/TopIngredientsChart';
import IngredientsConsumeOverTimeChart from '../kpi-widgets/IngredientsConsumeOverTimeChart';
import TopIngredientsByStorePieChart from '../kpi-widgets/TopIngredientsByStorePieChart';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const drawerWidth = 230;

// Sửa DashboardStat: bỏ motion.div
const DashboardStat = ({ label, value }) => (
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
);

const pageTitle = "Ingredients Dashboard";

const IngredientsDashboard = (props) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIngredients: '...',
    minIngredients: '...',
    maxIngredients: '...'
  });
  const [selectedState, setSelectedState] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleStateClick = (stateObj) => {
    setSelectedState(stateObj.abbr);
  };

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

  // Filters for TopIngredientsChart
  const filters = useMemo(() => selectedState ? { state: selectedState } : undefined, [selectedState]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#f5f7fb", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <CssBaseline />
      {isMdUp && <Sidebar />}
      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` } }}>
        <TopBar title="Ingredients Dashboard" onMenuClick={() => setMobileOpen(true)} {...props} />
        <Box sx={{ mt: 10, p: { xs: 1, md: 3 } }}>
          {/* Stats Widgets */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4} md={4}>
              <DashboardStat label="Total Ingredients" value={stats.totalIngredients} />
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <DashboardStat label="Min Ingredients per Product" value={stats.minIngredients} />
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <DashboardStat label="Max Ingredients per Product" value={stats.maxIngredients} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Charts Section */}
          <Box sx={{ mb: 4 }}>
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
          </Box>

          <Box sx={{ mb: 4 }}>
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
              <TopIngredientsByStorePieChart topN={5} groupBy="store" filters={filters} />
            </Paper>
          </Box>

          {/* Hiển thị widget Top 5 Ingredients nếu chọn bang */}
          {selectedState && (
            <Paper elevation={3} sx={{
              borderRadius: 5,
              p: 3,
              mb: 4,
              boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                  Top 5 Ingredients in {selectedState}
                </Typography>
                <Button size="small" onClick={() => setSelectedState(null)}>Clear</Button>
              </Box>
              <TopIngredientsChart topN={5} filters={filters} />
            </Paper>
          )}

          {/* Chỉ giữ lại Top 5 Ingredients - Total Quantity Used */}
          <Paper elevation={3} sx={{
            borderRadius: 5,
            p: 3,
            mb: 4,
            boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
            fontFamily: "'Inter', 'Roboto', sans-serif",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Top 5 Ingredients - Total Quantity Used
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <TopIngredientsChart topN={5} />
            </Box>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
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
              onClick={() => navigate("/dashboard")}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Box>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    </Box>
  );
};

export default IngredientsDashboard;