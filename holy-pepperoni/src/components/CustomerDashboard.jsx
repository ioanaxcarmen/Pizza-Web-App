import React from 'react';
import {
    Box, CssBaseline, Typography, Paper, Button, Grid, Divider, useTheme, useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Existing layout components
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

// Chart and new KPI card components
import TopCustomersChart from '../kpi-widgets/TopCustomersChart';
import CustomerOrderFrequencyChart from '../kpi-widgets/CustomerOrderFrequencyChart';
import AverageSpendLineChart from '../kpi-widgets/AverageSpendLineChart';
import KpiCard from '../kpi-widgets/KpiCard';
import ChurnRiskTable from '../kpi-widgets/ChurnRiskTable';
import CustomerSegmentsPieChart from '../kpi-widgets/CustomerSegmentsPieChart';
import PizzaLottie from '../components/PizzaLottie';

const drawerWidth = 230;
const pageTitle = "Customer Dashboard";

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

    React.useEffect(() => {
        const preconnect1 = document.createElement('link');
        preconnect1.rel = 'preconnect';
        preconnect1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(preconnect1);
        return () => {
        };
    }, []);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: "#f5f7fb" }}>
            <CssBaseline />
            {isMdUp && <Sidebar />}

            <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` } }}>
                <TopBar title={pageTitle} />

                {/* The content area starts here */}
                <Box sx={{ mt: 10, p: { xs: 1, md: 3 } }}>
                    <Grid container spacing={3} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                        {/* --- Row 1: High-Level KPI Cards + Lottie Animation --- */}
                        <Grid item xs={12} md={4}>
                            <KpiCard title="Total Unique Customers" endpoint="/api/kpi/total-customers" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <KpiCard title="Average Order Value" endpoint="/api/kpi/avg-order-value" />
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box sx={{ width: 150, height: 150 }}>
                                <PizzaLottie style={{ width: "100%", height: "100%" }} />
                            </Box>
                        </Grid>

                        {/* --- Row 2: Detailed Charts --- */}
                        <Grid item xs={12} lg={7}>
                            <Paper elevation={3} sx={{ borderRadius: 5, p: 3, height: '100%' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                    Average Spend Over Time
                                </Typography>
                                <AverageSpendLineChart />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} lg={5}>
                            <Paper elevation={3} sx={{ borderRadius: 5, p: 3, height: '100%' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                    Top 10 Customers
                                </Typography>
                                <TopCustomersChart />
                            </Paper>
                        </Grid>
                        {/* --- Row for Order Frequency (Centered) --- */}
                        <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
                            <Paper elevation={3} sx={{ borderRadius: 5, p: 3 }}>
                                <CustomerOrderFrequencyChart />
                            </Paper>
                        </Grid>

                        {/* --- Row for Customer Segmentation --- */}
                        <Grid item xs={12} md={8} lg={8} xl={7} sx={{ mx: 'auto' }}>
                            <Paper
                                elevation={3}
                                sx={{
                                    borderRadius: 5,
                                    p: 3,
                                    width: { xs: '100%', md: '650px', lg: '800px', xl: '950px' }, // Make the white box itself wider
                                    mx: 'auto'
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold" align="center" sx={{ mb: 2 }}>
                                    Customer Segmentation
                                </Typography>
                                <CustomerSegmentsPieChart />
                            </Paper>
                        </Grid>

                        {/* --- Row for Actionable Table --- */}
                        <Grid item xs={12}>
                            <Paper elevation={3} sx={{ borderRadius: 5, p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                    Customers at Risk of Churn
                                </Typography>
                                <ChurnRiskTable />
                            </Paper>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* The "Back to Main Menu" button remains the same */}
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
                </Box>
            </Box>
        </Box>
    );
};

export default CustomerDashboard;