import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box } from '@mui/material';

const ChurnRiskTable = () => {
    const [churnedCustomers, setChurnedCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1); // State for current page
    const [totalPages, setTotalPages] = useState(0); // State for total pages

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

    const getCustomerEmail = (customerId) => `${customerId}@example-pizza.com`;

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
                width: '100%',           // Ensure full width
                minWidth: 0,             // Prevent overflow
                overflowX: 'auto',       // Allow horizontal scroll if needed
            }}
        >
            <Table
                aria-label="churn risk table"
                sx={{
                    width: '100%',        // Make table fill container
                    minWidth: 600,        // Optional: set a min width for better layout
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
                    {churnedCustomers && churnedCustomers.length > 0 ? (
                        churnedCustomers.map((customer) => (
                            <TableRow key={customer.CUSTOMER_ID} hover>
                                <TableCell>{customer.CUSTOMER_ID}</TableCell>
                                <TableCell>{new Date(customer.LAST_ORDER_DATE).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
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