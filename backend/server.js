const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors()); // This allows React app to make requests to this server
const port = 3001; // The backend will run on this port

// OracleDB configuration
const dbConfig = {
    user: "PIZZA",
    password: "MyPizza123", // The password you created for the PIZZA user
    connectString: "localhost:1521/XE"
};

// A test API endpoint to see if the connection works
app.get('/api/test-connection', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        res.json({ status: 'success', message: 'Successfully connected to Oracle Database!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Failed to connect to database.', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

// The API endpoint to get data for the chart
app.get('/api/sales-by-product', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        // We are querying one of the views that was successfully imported
        const result = await connection.execute(
            `SELECT PRODUCT_NAME, TOTAL_REVENUE FROM V_ORDER_PER_PRODUCT_BY_SIZE ORDER BY TOTAL_REVENUE DESC FETCH FIRST 10 ROWS ONLY`
        );

        // Format data for Recharts: { name: '...', sales: ... }
        const chartData = result.rows.map(row => ({
            name: row[0],
            sales: row[1]
        }));

        res.json(chartData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Failed to query data.', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

// --- Add new KPI endpoint here ---
app.get('/api/kpi/avg-orders-per-customer', async (req, res) => {
    let connection;

    // --- Dynamic WHERE Clause Logic ---
    let whereClause = 'WHERE 1=1'; // Start with a condition that is always true
    const binds = {}; // Use a bind variable object

    // Check for each potential filter from the URL query (req.query)
    if (req.query.year && req.query.year !== 'all') {
        whereClause += ' AND EXTRACT(YEAR FROM o.ORDERDATE) = :year';
        binds.year = req.query.year;
    }
    if (req.query.state && req.query.state !== 'all') {
        whereClause += ' AND s.STATE_ABBR = :state';
        binds.state = req.query.state;
    }
    if (req.query.storeId && req.query.storeId !== 'all') {
        whereClause += ' AND s.STOREID = :storeId';
        binds.storeId = req.query.storeId;
    }
    //add more filters for quarter, etc. here

    try {
        connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT ROUND(AVG(ORDER_COUNT), 2) as AVG_ORDERS
            FROM (
                SELECT c.ID, COUNT(o.ID) as ORDER_COUNT
                FROM CUSTOMERS c
                JOIN ORDERS o ON c.ID = o.CUSTOMERID
                JOIN STORES s ON o.STOREID = s.STOREID
                ${whereClause} -- Inject the dynamic WHERE clause here
                GROUP BY c.ID
            )
        `;

        const result = await connection.execute(query, binds);

        res.json(result.rows[0] || { AVG_ORDERS: 0 }); // Send back the result

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch KPI data.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Top Customers by Lifetime Value chart
app.get('/api/kpi/top-customers', async (req, res) => {
    let connection;
    let whereClause = 'WHERE 1=1';
    const binds = {};

    if (req.query.year && req.query.year !== 'all') {
        whereClause += ' AND EXTRACT(YEAR FROM o.ORDERDATE) = :year';
        binds.year = req.query.year;
    }
    if (req.query.state && req.query.state !== 'all') {
        whereClause += ' AND s.STATE_ABBR = :state';
        binds.state = req.query.state;
    }
    if (req.query.quarter && req.query.quarter !== 'all') {
        whereClause += ' AND EXTRACT(QUARTER FROM o.ORDERDATE) = :quarter';
        binds.quarter = req.query.quarter;
    }
    if (req.query.month && req.query.month !== 'all') {
        whereClause += ' AND EXTRACT(MONTH FROM o.ORDERDATE) = :month';
        binds.month = req.query.month;
    }
    if (req.query.storeId && req.query.storeId !== 'all' && req.query.storeId !== '') {
        whereClause += ' AND s.STOREID = :storeId';
        binds.storeId = req.query.storeId;
    }

    try {
        connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT c.ID, SUM(o.TOTAL) as LIFETIME_VALUE
            FROM CUSTOMERS c
            JOIN ORDERS o ON c.ID = o.CUSTOMERID
            JOIN STORES s ON o.STOREID = s.STOREID
            ${whereClause}
            GROUP BY c.ID
            ORDER BY LIFETIME_VALUE DESC
            FETCH FIRST 10 ROWS ONLY
        `;

        const result = await connection.execute(query, binds);

        const chartData = result.rows.map(row => ({
            name: row[0],
            spend: row[1]
        }));

        res.json(chartData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch top customers.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Ingredients Consumed Over Time chart
app.get('/api/kpi/ingredients-consumed-over-time', async (req, res) => {
    let connection;
    const binds = {};
    let whereClause = 'WHERE 1=1';

    // Take granularity (week, month, quarter, year)
    const granularity = req.query.granularity || 'month';
    let timeCol;
    switch (granularity) {
        case 'week':
            timeCol = 'week';
            break;
        case 'quarter':
            timeCol = 'quarter';
            break;
        case 'year':
            timeCol = 'year';
            break;
        case 'month':
        default:
            timeCol = 'month';
    }

    // Ingredients filter
    if (req.query.ingredient && req.query.ingredient !== 'all') {
        const ingredientList = req.query.ingredient.split(',').map(i => i.trim());
        if (ingredientList.length === 1) {
            whereClause += ' AND ingredient_name = :ingredient';
            binds.ingredient = ingredientList[0];
        } else if (ingredientList.length > 1) {
            const inClause = ingredientList.map((_, idx) => `:ingredient${idx}`).join(',');
            whereClause += ` AND ingredient_name IN (${inClause})`;
            ingredientList.forEach((name, idx) => {
                binds[`ingredient${idx}`] = name;
            });
        }
    }

   

    try {
        connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT 
                ${timeCol} AS time,
                ingredient_name,
                total_quantity_used
            FROM v_most_used_ingredients_time
            ${whereClause}
            ORDER BY time, ingredient_name
        `;

        const result = await connection.execute(query, binds);

        // Format for frontend
        const chartData = result.rows.map(row => ({
            week: row[0],
            month: row[0],
            quarter: row[0],
            year: row[0],
            ingredient_name: row[1],
            total_consumed: row[2]
        }));

        res.json(chartData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch ingredients consumed over time.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

//Weitere SQL queries hier

//origianl localhost
// app.listen(port, () => {
//     console.log(`Backend server running at http://localhost:${port}`);
// });


// Start the server on the specified port local IP address
app.listen(port, '0.0.0.0', () => {
    console.log(`Backend server running at http://localhost:${port}`);
});

