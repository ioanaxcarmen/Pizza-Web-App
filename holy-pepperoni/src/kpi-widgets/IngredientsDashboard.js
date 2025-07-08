import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Grid, Paper, Divider, Button, useTheme, useMediaQuery
} from '@mui/material';
import TopIngredientsChart from '../kpi-widgets/TopIngredientsChart';
import IngredientsConsumeOverTimeChart from '../kpi-widgets/IngredientsConsumeOverTimeChart';
import TopIngredientsByStorePieChart from '../kpi-widgets/TopIngredientsByStorePieChart';
import IngredientsOrderTable from '../kpi-widgets/IngredientsOrderTable';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import PizzaLottie from '../components/PizzaLottie'; // Assuming you have a Lottie component for the pizza animation

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

const StatWidget = ({ label, value }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      borderRadius: 5,
      bgcolor: "#fff7f0",
      boxShadow: "0 2px 12px rgba(250, 162, 138, 0.12)",
      fontFamily: "'Inter', 'Roboto', sans-serif",
      minWidth: 200,
      textAlign: 'center',
      color: "#fa7a1c"
    }}
  >
    <Typography variant="subtitle2" sx={{ color: "#fa7a1c", fontWeight: 700 }}>
      {label}
    </Typography>
    <Typography
      variant="h4"
      fontWeight="bold"
      sx={{ color: "#fa7a1c", fontFamily: "'Inter', 'Roboto', sans-serif", mt: 1 }}
    >
      {value}
    </Typography>
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
  

  
const IngredientsSummaryWidget = ({ total, min, max }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      borderRadius: 5,
      bgcolor: "#fff7f0",
      boxShadow: "0 2px 12px rgba(250, 162, 138, 0.12)",
      fontFamily: "'Inter', 'Roboto', sans-serif",
      minWidth: 340,
      display: 'flex',
      alignItems: 'center',
      color: "#fa7a1c"
    }}
  >
    {/* Ingredient Overview */}
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography variant="subtitle2" sx={{ color: "#fa7a1c", fontWeight: 700 }}>
        🍕 Ingredient Overview
      </Typography>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ color: "#fa7a1c", fontFamily: "'Inter', 'Roboto', sans-serif", mt: 1 }}
      >
        {total}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontFamily: "'Inter', 'Roboto', sans-serif", mb: 1 }}
      >
        Total Ingredients
      </Typography>
    </Box>
    {/* Divider */}
    <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#fa7a1c" }} />
    {/* Min Ingredients */}
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography variant="subtitle2" sx={{ color: "#fa7a1c", fontWeight: 700 }}>
        Min Ingredients per Product
      </Typography>
      <Typography variant="h4" sx={{ color: "#fa7a1c", fontWeight: 600 }}>
        {min}
      </Typography>
    </Box>
    {/* Divider */}
    <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "#fa7a1c" }} />
    {/* Max Ingredients */}
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography variant="subtitle2" sx={{ color: "#fa7a1c", fontWeight: 700 }}>
        Max Ingredients per Product
      </Typography>
      <Typography variant="h4" sx={{ color: "#fa7a1c", fontWeight: 600 }}>
        {max}
      </Typography>
    </Box>
    {/* Icon hoặc hình ảnh */}
    <Box sx={{ width: 150, height: 150 }}>
      <PizzaLottie sx={{ width: '100%', height: '100%', color: '#fa7a1c' }} />
    </Box>
  </Paper>
);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  // Filters for TopIngredientsChart
  const filters = useMemo(() => ({ state: selectedState }), [selectedState]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#f5f7fb", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <CssBaseline />
      {isMdUp && <Sidebar />}
      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` } }}>
        <TopBar title="Ingredients Dashboard" onMenuClick={() => setMobileOpen(true)} {...props} />
        <Box sx={{ mt: 10, p: { xs: 1, md: 3 } }}>
          {/* Ingredients Summary Widget */}
          <Box sx={{ mb: 3, width: '100%' }}>
            <IngredientsSummaryWidget
              total={stats.totalIngredients}
              min={stats.minIngredients}
              max={stats.maxIngredients}
            />
          </Box>
          {/* Stats Widgets */}
         

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
              <TopIngredientsByStorePieChart filters={filters} topN={5} groupBy="store" />
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
            <Box sx={{ flex: 1, minHeight: 600 }}>
              <TopIngredientsChart />
            </Box>
          </Paper>

          {/* Thêm bảng đặt hàng nguyên liệu */}
          <Paper elevation={3} sx={{
            borderRadius: 5,
            p: 3,
            mb: 4,
            boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
            fontFamily: "'Inter', 'Roboto', sans-serif"
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Order Ingredients
            </Typography>
            <IngredientsOrderTable />
          </Paper>

          {/* Back to Main Menu button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 2 }}>
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

export default IngredientsDashboard;