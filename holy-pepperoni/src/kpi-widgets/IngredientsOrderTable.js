import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, Button
} from '@mui/material';
import axios from 'axios';

// List of available ingredients for ordering
const INGREDIENTS = [
  "Tomato Sauce", "Fresh Mozzarella", "Basil", "Olive Oil", "Mozzarella", "Pepperoni", "Pineapple", "Ham", "Sausage", "Bacon",
  "Mushrooms", "Bell Peppers", "Onions", "Olives", "BBQ Sauce", "Grilled Chicken", "Red Onions", "Bufalo Sauce", "Blue Cheese", "Oxtail"
];

// Initialize default rows for the table, one for each ingredient
const defaultRows = INGREDIENTS.map((name, idx) => ({
  id: idx + 1,
  ingredient: name,
  quantity: '',
  store: ''
}));

const IngredientsOrderTable = () => {
  // State for table rows (ingredient orders)
  const [rows, setRows] = useState(defaultRows);
  // State for list of stores fetched from backend
  const [stores, setStores] = useState([]);

  // Fetch the list of stores from backend API when component mounts
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/kpi/store-list`)
      .then(res => setStores(res.data))
      .catch(() => setStores([]));
  }, []);

  // Handle changes in quantity or store selection for a row
  const handleChange = (idx, field, value) => {
    setRows(prev =>
      prev.map((row, i) => i === idx ? { ...row, [field]: value } : row)
    );
  };

  // Handle sending the order via email using mailto link
  const handleSendOrder = (row) => {
    const subject = encodeURIComponent(`Order Request: ${row.ingredient}`);
    const body = encodeURIComponent(
      `Dear Supplier,\n\n` +
      `We kindly request the following order:\n\n` +
      `- Ingredient: ${row.ingredient}\n` +
      `- Quantity: ${row.quantity}\n` +
      `- Delivery Point: ${row.store}\n\n` +
      `Please confirm the expected delivery date and let us know if you need further details.\n\n` +
      `Thank you very much!\nBest regards,\nHoly Pepperoni Procurement Team`
     );
    window.location.href = `mailto:order@supplierofholypepperoni.com?subject=${subject}&body=${body}`;
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 4, mt: 4 }}>
      <Table>
        <TableHead sx={{ background: "#fff7f0" }}>
          <TableRow>
            <TableCell align="center">#</TableCell>
            <TableCell>Ingredient</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Delivery Point</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row.id}>
              <TableCell align="center">{row.id}</TableCell>
              <TableCell>{row.ingredient}</TableCell>
              <TableCell>
                {/* Input for quantity */}
                <TextField
                  size="small"
                  type="number"
                  value={row.quantity}
                  onChange={e => handleChange(idx, 'quantity', e.target.value)}
                  placeholder="Enter quantity"
                  inputProps={{ min: 1 }}
                />
              </TableCell>
              <TableCell>
                {/* Dropdown to select store */}
                <Select
                  size="small"
                  value={row.store}
                  onChange={e => handleChange(idx, 'store', e.target.value)}
                  displayEmpty
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">Select store</MenuItem>
                  {stores.map(store => (
                    <MenuItem key={store.storeid} value={store.name}>{store.name}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell align="center">
                {/* Button to send order email */}
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!row.quantity || !row.store}
                  onClick={() => handleSendOrder(row)}
                  sx={{ borderRadius: 3, textTransform: 'none' }}
                >
                  Send Order
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IngredientsOrderTable;