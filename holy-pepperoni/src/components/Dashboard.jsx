import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Card, CardActionArea, CardContent, Button } from "@mui/material";
import { motion } from "framer-motion";

// Icons for the cards
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PublicIcon from '@mui/icons-material/Public';

const Dashboard = () => {
    const navigate = useNavigate();

    // Handle logout: remove auth token and redirect to login page
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/");
    };

    // Styles for header and greeting
    const styles = {
        header: {
            background: "#faa28a",
            color: "#000000ff",
            padding: "24px 0",
            fontSize: "2.5rem",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            textAlign: "center",
        },
        goodDay: {
            textAlign: "center",
            fontSize: "1.4rem",
            fontWeight: "bold",
            marginTop: "24px",
            marginBottom: "48px",
        },
    };

    // Define the items for each row of dashboard cards
    const row1Items = [
        { title: "Product", path: "/product/dashboard", icon: <FastfoodIcon sx={{ fontSize: 40 }} /> },
        { title: "Store", path: "/store/dashboard", icon: <StorefrontIcon sx={{ fontSize: 40 }} /> },
    ];
    const row2Items = [
        { title: "Customer", path: "/customer", icon: <PeopleIcon sx={{ fontSize: 40 }} /> },
        { title: "Orders", path: "/orders/dashboard", icon: <ReceiptLongIcon sx={{ fontSize: 40 }} /> },
    ];
    const row3Items = [
        { title: "Ingredients", path: "/ingredients/dashboard", icon: <LocalOfferIcon sx={{ fontSize: 40 }} /> },
        { title: "Geographical", path: "/geo/powerbi-map2", icon: <PublicIcon sx={{ fontSize: 40 }} /> },
    ];

    // Animation variants for Framer Motion (card entrance)
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    return (
        <Box sx={{ bgcolor: "#fefaf0", minHeight: "100vh" }}>
            {/* Dashboard header and greeting */}
            <div style={styles.header}>Main Menu</div>
            <div style={styles.goodDay}>Good Day, Admin!</div>

            {/* Main dashboard grid */}
            <Box sx={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                {/* --- Row 1: Product and Store --- */}
                <Grid container spacing={4} sx={{ justifyContent: 'center', mb: 4 }}>
                    {row1Items.map((item, index) => (
                        <Grid item xs={10} sm={5} md={4} key={item.title}>
                            <motion.div initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: index * 0.2 }}>
                                {/* Dashboard card */}
                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        width: 180,        
                                        height: 180,
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mx: 'auto',
                                        '&:hover': { boxShadow: "0 8px 24px rgba(250, 162, 138, 0.2)" }
                                    }}
                                >
                                    {/* Card clickable area */}
                                    <CardActionArea
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            bgcolor: '#f7d9afff',
                                            height: '100%',
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {/* Icon */}
                                        <Box sx={{ color: '#000000' }}>{item.icon}</Box>
                                        {/* Card title */}
                                        <CardContent sx={{ p: 0, mt: 1 }}>
                                            <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* --- Row 2: Customer and Orders --- */}
                <Grid container spacing={4} sx={{ justifyContent: 'center', mb: 4 }}>
                    {row2Items.map((item, index) => (
                        <Grid item xs={10} sm={5} md={4} key={item.title}>
                            <motion.div initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: (index + 2) * 0.2 }}>
                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        width: 180,
                                        height: 180,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mx: 'auto',
                                        '&:hover': { boxShadow: "0 8px 24px rgba(250, 162, 138, 0.2)" }
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            bgcolor: '#f7d9afff',
                                            height: '100%',
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Box sx={{ color: '#000000' }}>{item.icon}</Box>
                                        <CardContent sx={{ p: 0, mt: 1 }}>
                                            <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* --- Row 3: Ingredients and Geographical --- */}
                <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
                    {row3Items.map((item, index) => (
                        <Grid item xs={10} sm={5} md={4} key={item.title}>
                            <motion.div initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: (index + 4) * 0.2 }}>
                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        width: 180,
                                        height: 180,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mx: 'auto',
                                        '&:hover': { boxShadow: "0 8px 24px rgba(250, 162, 138, 0.2)" }
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            bgcolor: '#f7d9afff',
                                            height: '100%',
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Box sx={{ color: '#000000' }}>{item.icon}</Box>
                                        <CardContent sx={{ p: 0, mt: 1 }}>
                                            <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Log Out button at the bottom */}
            <Box sx={{ mt: 6, pb: 4, display: 'flex', justifyContent: 'center' }}>
                <button
                    style={{
                        background: "#faa28a",
                        color: "#000000ff",
                        border: "none",
                        borderRadius: "50px",
                        padding: "20px 0",           
                        width: "260px",
                        fontSize: "1.3rem",
                        fontWeight: "bold",
                        cursor: 'pointer',
                        boxShadow: "0 4px 16px rgba(250, 162, 138, 0.18)"
                    }}
                    onClick={handleLogout}
                >
                    Log Out
                </button>
            </Box>
        </Box>
    );
};

export default Dashboard;