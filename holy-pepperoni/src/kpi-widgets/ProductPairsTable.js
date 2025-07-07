import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box } from '@mui/material';
import LoadingPizza from '../components/LoadingPizza';

/**
 * ProductPairsTable component
 * Displays a table of the top 20 most frequently bought together product pairs.
 * Allows downloading the table data as a CSV report.
 */
const ProductPairsTable = () => {
    // State for product pairs data
    const [data, setData] = useState([]);
    // State for loading status
    const [loading, setLoading] = useState(true);

    // Fetch product pairs data from backend API on mount
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/product-pairs`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching product pairs data:", error);
                setLoading(false);
            });
    }, []);

    // Utility to convert data to CSV and trigger download
    const downloadCSV = (data) => {
        if (!data.length) return;
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product_pairs_report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Show loading animation while fetching data
    if (loading) {
        return <LoadingPizza />;
    }

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 5 }}>
            {/* Table title and Download Report button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Top 20 Frequently Bought Together Products
                </Typography>
                <Button
                    onClick={() => downloadCSV(data)}
                    variant="contained"
                    sx={{
                        background: "#f7d9afff",
                        color: "#000",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        boxShadow: 1,
                        '&:hover': { background: "#ffe0b2" }
                    }}
                >
                    Download Report
                </Button>
            </Box>
            {/* Product pairs table */}
            <TableContainer>
                <Table aria-label="product pairs table">
                    <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Product 1</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Product 2</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Times Purchased Together</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((pair, index) => (
                            <TableRow key={index} hover>
                                <TableCell>{pair.PRODUCT_A}</TableCell>
                                <TableCell>{pair.PRODUCT_B}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>{pair.ORDERS_TOGETHER}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default ProductPairsTable;