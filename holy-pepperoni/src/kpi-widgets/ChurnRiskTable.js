import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box } from '@mui/material';

/**
 * ChurnRiskTable component
 * Displays a paginated table of customers at risk of churn.
 * Allows sending a promotional email to each customer.
 * Includes a Download Report button.
 */
const ChurnRiskTable = () => {
    // State to hold the list of churned customers
    const [churnedCustomers, setChurnedCustomers] = useState([]);
    // State to track loading status
    const [loading, setLoading] = useState(true);
    // State for current page in pagination
    const [page, setPage] = useState(1);
    // State for total number of pages
    const [totalPages, setTotalPages] = useState(0);

    // Fetch churn risk customers from backend when page changes
    useEffect(() => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/churn-risk?page=${page}&limit=10`)
            .then(response => {
                setChurnedCustomers(response.data.data);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching churn risk customers:", error);
                setLoading(false);
            });
    }, [page]);

    // Utility to generate a fake email address for a customer
    const getCustomerEmail = (customerId) => `${customerId}@example-pizza.com`;

    // Utility to download the current page as CSV
    const downloadCSV = (data) => {
        if (!data.length) return;
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'churn_risk_report.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Show loading message while fetching data
    if (loading) {
        return <div>Loading Churn Risk Data...</div>;
    }

    return (
        <TableContainer
            component={Paper}
            elevation={3}
            sx={{
                borderRadius: 5,
                boxShadow: "0 4px 16px rgba(250, 162, 138, 0.08)",
                width: '100%',
                minWidth: 0,
                overflowX: 'auto',
                position: 'relative'
            }}
        >
            {/* Download Report button - absolute position, does not push table down */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 2,
                    bottom: 10,     
                    right: 16,   
                    zIndex: 2,
                }}
            >
                <Button
                    onClick={() => downloadCSV(churnedCustomers)}
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
            <Table
                aria-label="churn risk table"
                sx={{
                    width: '100%',
                    minWidth: 600,
                }}
            >
                <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Customer ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Last Order Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Render a row for each churned customer, or a message if none */}
                    {churnedCustomers && churnedCustomers.length > 0 ? (
                        churnedCustomers.map((customer) => (
                            <TableRow key={customer.CUSTOMER_ID} hover>
                                <TableCell>{customer.CUSTOMER_ID}</TableCell>
                                <TableCell>{new Date(customer.LAST_ORDER_DATE).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    {/* Button to send a promo email to the customer */}
                                    <Button
                                        variant="contained"
                                        size="small"
                                        href={`mailto:${getCustomerEmail(customer.CUSTOMER_ID)}?subject=We Miss You at Holy Pepperoni!&body=Hi there, we noticed you haven't ordered in a while. Here is a 20% discount code for your next order: WELCOMEBACK20`}
                                        sx={{
                                            background: "#007bff",
                                            '&:hover': { background: "#0056b3" },
                                            borderRadius: '20px',
                                            textTransform: 'none'
                                        }}
                                    >
                                        Send Promo
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                                No customers currently at risk of churn. Great job!
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {/* Pagination controls */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    variant="outlined"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    sx={{ borderRadius: '20px', textTransform: 'none' }}
                >
                    Previous
                </Button>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Page {page} of {totalPages}
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    sx={{ borderRadius: '20px', textTransform: 'none' }}
                >
                    Next
                </Button>
            </Box>
        </TableContainer>
    );
};

export default ChurnRiskTable;