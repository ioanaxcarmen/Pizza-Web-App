import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box } from '@mui/material';
import LoadingPizza from '../components/LoadingPizza';

const SegmentDetailsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const segment = searchParams.get('segment');
    const page = parseInt(searchParams.get('page') || '1', 10);

    const [customers, setCustomers] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/api/segment-details`, { params: { segment, page } })
            .then(response => {
                setCustomers(response.data.data);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching segment details:", error);
                setLoading(false);
            });
    }, [segment, page]);

    const handlePageChange = (newPage) => {
        setSearchParams({ segment, page: newPage });
    };

    if (loading) return <LoadingPizza />;

    return (
        <Paper elevation={3} sx={{ m: 3, p: 3, borderRadius: 5 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                    component={Link}
                    to="/customer"
                    variant="contained"
                    sx={{
                        background: "#faa28a",
                        borderRadius: "32px",
                        color: "#fff",
                        fontWeight: "bold",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        '&:hover': { background: "#fa7a1c" }
                    }}
                >
                    &larr; Back to Customer Dashboard
                </Button>
            </Box>
            <Typography variant="h4" gutterBottom>
                Customers in Segment: <strong>{segment}</strong>
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Customer ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total Orders</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total Revenue</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.CUSTOMER_ID} hover>
                                <TableCell>{customer.CUSTOMER_ID}</TableCell>
                                <TableCell>{customer.TOTAL_ORDERS}</TableCell>
                                <TableCell>${customer.TOTAL_REVENUE.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ pt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <Button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>Previous</Button>
                <Typography>Page {page} of {totalPages}</Typography>
                <Button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>Next</Button>
            </Box>
        </Paper>
    );
};

export default SegmentDetailsPage;