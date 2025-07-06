import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';

// Component-level styles for the table for better organization
const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};
const thStyles = {
    background: '#f8f9fa',
    padding: '12px 15px',
    border: '1px solid #dee2e6',
    textAlign: 'left',
    fontWeight: '600'
};
const tdStyles = {
    padding: '12px 15px',
    border: '1px solid #dee2e6'
};

const CustomerHistoryPage = () => {
    // Get the main customer ID from the URL path (e.g., /.../C612070)
    const { customerId } = useParams();
    // Get the filter parameters from the URL query string (e.g., ?year=2024&month=5)
    const [searchParams] = useSearchParams();

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Pass the searchParams directly to axios. It will correctly build the query string.
        axios.get(`${process.env.REACT_APP_API_URL}/api/customer-history/${customerId}`, { params: searchParams })
            .then(response => {
                setHistory(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching customer history:", error);
                setLoading(false);
            });
    // This effect re-runs if the customerId or the filters in the URL change
    }, [customerId, searchParams]);

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading customer order history...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <Button
                component={Link}
                to="/customer/top-10"
                variant="contained"
                sx={{
                    background: "#faa28a",
                    borderRadius: "32px",
                    color: "#fff",
                    fontWeight: "bold",
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    mb: 3,
                    fontSize: "1rem",
                    boxShadow: 2,
                    '&:hover': { background: "#fa7a1c" }
                }}
            >
                Back to Top 10 Customers
            </Button>
            <h2>Order History for Customer: <strong>{customerId}</strong></h2>
            
            <table style={tableStyles}>
                <thead>
                    <tr>
                        <th style={thStyles}>Date</th>
                        <th style={thStyles}>Product</th>
                        <th style={thStyles}>Category</th>
                        <th style={thStyles}>Size</th>
                        <th style={thStyles}>Quantity</th>
                        <th style={thStyles}>Product Price</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? (
                        history.map((item, index) => (
                            <tr key={index}>
                                <td style={tdStyles}>{new Date(item.ORDERDATE).toLocaleString()}</td>
                                <td style={tdStyles}>{item.PRODUCT_NAME}</td>
                                <td style={tdStyles}>{item.CATEGORY}</td>
                                <td style={tdStyles}>{item.PRODUCT_SIZE}</td>
                                <td style={tdStyles}>{item.QUANTITY}</td>
                                <td style={tdStyles}>${item.PRODUCT_PRICE.toFixed(2)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ ...tdStyles, textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                                No order history found for this customer with the selected filter criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerHistoryPage;