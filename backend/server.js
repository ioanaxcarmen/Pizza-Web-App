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
    //connectString: "localhost:1521/XEPDB1" //use this if you are using the default Oracle XE database
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

// Average Orders per Customer KPI
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
    if (req.query.quarter && req.query.quarter !== 'all') {
        whereClause += ` AND TO_CHAR(o.ORDERDATE, 'Q') = :quarter`;
        binds.quarter = req.query.quarter;
    }
    if (req.query.month && req.query.month !== 'all') {
        whereClause += ' AND EXTRACT(MONTH FROM o.ORDERDATE) = :month';
        binds.month = req.query.month;
    }
    if (req.query.state && req.query.state !== 'all') {
        whereClause += ' AND s.STATE_ABBR = :state';
        binds.state = req.query.state;
    }
    if (
        typeof req.query.storeId === 'string' &&
        req.query.storeId.trim() !== ''
    ) {
        whereClause += ' AND o.STOREID = :storeId';
        binds.storeId = req.query.storeId.trim();
    }

    try {
        connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT 
                o.CUSTOMERID, 
                SUM(o.TOTAL) as LIFETIME_VALUE
            FROM ORDERS o
            JOIN STORES s ON o.STOREID = s.STOREID 
            ${whereClause}
            GROUP BY o.CUSTOMERID
            ORDER BY LIFETIME_VALUE DESC
            FETCH FIRST 10 ROWS ONLY
        `;

        console.log("Executing Top Customers Query:", query, binds);

        const result = await connection.execute(query, binds);

        const chartData = result.rows.map(row => ({
            name: row[0],
            spend: row[1]
        }));

        res.json(chartData);

    } catch (err) {
        console.error("Error fetching top customers:", err);
        res.status(500).json({ error: 'Failed to fetch top customers.', details: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Ingredients Consumed Over Time char// --- Thay đổi trong endpoint Top Ingredients ---
app.get('/api/kpi/top-ingredients', async (req, res) => {
    let connection;
    const binds = {};
    let whereClause = 'WHERE 1=1';

    try {
        connection = await oracledb.getConnection(dbConfig);

        // Multi-store support: storeId có thể là mảng (storeId=1&storeId=2...) hoặc 1 giá trị
        let storeIds = req.query.storeId;
        if (storeIds && !Array.isArray(storeIds)) storeIds = [storeIds];

        // Filter logic
        if (req.query.week && req.query.week !== 'all') {
            whereClause += ' AND week = :week';
            binds.week = req.query.week;
        }
        if (req.query.month && req.query.month !== 'all') {
            whereClause += ' AND month = :month';
            binds.month = req.query.month;
        }
        if (req.query.quarter && req.query.quarter !== 'all') {
            whereClause += ' AND quarter = :quarter';
            binds.quarter = req.query.quarter;
        }
        if (req.query.year && req.query.year !== 'all') {
            whereClause += ' AND year = :year';
            binds.year = req.query.year;
        }
        if (req.query.state && req.query.state !== 'all') {
            whereClause += ' AND state = :state';
            binds.state = req.query.state;
        }

        // Nếu không truyền storeId, trả về top 5 toàn hệ thống
        if (!storeIds || storeIds.length === 0) {
            const query = `
                SELECT ingredient_name, SUM(total_quantity_used) AS total_quantity_used
                FROM v_top_ingredients_by_store
                ${whereClause}
                GROUP BY ingredient_name
                ORDER BY total_quantity_used DESC
                FETCH FIRST 5 ROWS ONLY
            `;
            const result = await connection.execute(query, binds);
            const chartData = result.rows.map(row => ({
                ingredient_name: row[0],
                total_quantity_used: row[1]
            }));
            return res.json(chartData);
        }

        // Nếu có nhiều storeId, trả về object {storeId: [ingredients...]}
        const resultObj = {};
        for (const storeId of storeIds) {
            const query = `
                SELECT ingredient_name, SUM(total_quantity_used) AS total_quantity_used
                FROM v_top_ingredients_by_store
                ${whereClause} AND storeid = :storeId
                GROUP BY ingredient_name
                ORDER BY total_quantity_used DESC
                FETCH FIRST 5 ROWS ONLY
            `;
            const result = await connection.execute(query, { ...binds, storeId });
            const total = result.rows.reduce((sum, row) => sum + row[1], 0);
            // Đảm bảo key là string
            resultObj[String(storeId)] = result.rows.map(row => ({
                ingredient: row[0],
                quantity: row[1],
                percent: total > 0 ? Math.round((row[1] / total) * 1000) / 10 : 0 // 1 decimal
            }));
        }
        res.json(resultObj);

    } catch (err) {
        console.error("Error fetching top ingredients:", err);
        res.status(500).json({ error: 'Failed to fetch top ingredients.', details: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});
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

// Customer Share by Store chart
app.get('/api/kpi/customer-share-by-store', async (req, res) => {
    let connection;
    try {
        const binds = {};
        // This WHERE clause will be used by our main query and the subquery
        let whereClause = 'WHERE 1=1';

        // --- FILTER LOGIC ---
        if (req.query.year && req.query.year !== 'all') {
            whereClause += ' AND EXTRACT(YEAR FROM o.ORDERDATE) = :year';
            binds.year = req.query.year;
        }
        if (req.query.quarter && req.query.quarter !== 'all') {
            whereClause += ` AND TO_CHAR(o.ORDERDATE, 'Q') = :quarter`;
            binds.quarter = req.query.quarter;
        }
        if (req.query.month && req.query.month !== 'all') {
            whereClause += ' AND EXTRACT(MONTH FROM o.ORDERDATE) = :month';
            binds.month = req.query.month;
        }
        if (req.query.state && req.query.state !== 'all') {
            // We need to add an alias 's' to the table in the WHERE clause
            whereClause += ' AND s.STATE_ABBR = :state';
            binds.state = req.query.state;
        }
        // You can continue to add more filters here...

        //WITH clause to create a temporary, filtered set of orders first.
        const query = `
            WITH FilteredOrders AS (
                SELECT o.CUSTOMERID, o.STOREID
                FROM ORDERS o
                JOIN STORES s ON o.STOREID = s.STOREID -- Join here to allow filtering by state
                ${whereClause}
            )
            SELECT
                s.CITY,
                s.STOREID,
                COUNT(DISTINCT fo.CUSTOMERID) as ACTIVE_CUSTOMERS,
                (SELECT COUNT(DISTINCT CUSTOMERID) FROM FilteredOrders) as TOTAL_FILTERED_CUSTOMERS
            FROM
                STORES s
            JOIN
                FilteredOrders fo ON s.STOREID = fo.STOREID
            GROUP BY
                s.CITY, s.STOREID
            ORDER BY
                ACTIVE_CUSTOMERS DESC
        `;

        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, binds);

        const chartData = result.rows.map(row => {
            const city = row[0];
            const storeId = row[1];
            const customerCount = row[2];
            // The denominator is now the correct, filtered
            const totalFilteredCustomers = row[3];

            const share = totalFilteredCustomers > 0 ? (customerCount / totalFilteredCustomers) * 100 : 0;

            return {
                storeName: city,
                storeId: storeId, // Sending storeId is good practice
                customerCount: customerCount,
                share: share.toFixed(2)
            };
        });

        res.json(chartData);
    } catch (err) {
        console.error("Error fetching customer share by store:", err);
        res.status(500).json({ error: 'Failed to fetch data.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Customer Order Frequency (Filterable by Segment, Date, etc.)
app.get('/api/kpi/order-frequency', async (req, res) => {
    let connection;
    try {
        const binds = {};
        let segmentCte = '';

        if (req.query.segment && req.query.segment !== 'all') {
            segmentCte = `
                WITH SegmentCustomers AS (
                    SELECT CUSTOMER_ID FROM V_CUSTOMER_SEGMENT WHERE SEGMENT = :segment
                )
            `;
            binds.segment = req.query.segment;
        }

        let whereClause = 'WHERE 1=1';
        if (req.query.year && req.query.year !== 'all') { /* ... add filter ... */ }
        // Add other filters as needed

        const query = `
            ${segmentCte}
            WITH CustomerOrderCounts AS (
                SELECT o.CUSTOMERID, COUNT(o.ID) as ORDER_COUNT
                FROM ORDERS o
                ${segmentCte ? 'JOIN SegmentCustomers sc ON o.CUSTOMERID = sc.CUSTOMER_ID' : ''}
                /* JOIN STORES s ON o.STOREID = s.STOREID if filtering by location */
                ${whereClause}
                GROUP BY o.CUSTOMERID
            )
            SELECT
                CASE WHEN ORDER_COUNT = 1 THEN 'One-Time Buyer' ELSE 'Repeat Buyer' END as CUSTOMER_TYPE,
                COUNT(CUSTOMERID) as COUNT_OF_CUSTOMERS
            FROM CustomerOrderCounts
            GROUP BY CASE WHEN ORDER_COUNT = 1 THEN 'One-Time Buyer' ELSE 'Repeat Buyer' END
        `;

        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const chartData = result.rows.map(row => ({ name: row.CUSTOMER_TYPE, value: row.COUNT_OF_CUSTOMERS }));
        res.json(chartData);

    } catch (err) {
        console.error("Error fetching order frequency:", err);
        res.status(500).json({ error: 'Failed to fetch data.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Customer Segmentation KPI
app.get('/api/kpi/customer-segments', async (req, res) => {
    let connection;
    try {
        const query = `
            SELECT 
                SEGMENT, 
                COUNT(CUSTOMER_ID) as CUSTOMER_COUNT
            FROM V_CUSTOMER_SEGMENT
            GROUP BY SEGMENT
            ORDER BY CUSTOMER_COUNT DESC
        `;

        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        // Format for Recharts Pie Chart
        const chartData = result.rows.map(row => ({
            name: row.SEGMENT,
            value: row.CUSTOMER_COUNT
        }));

        res.json(chartData);

    } catch (err) {
        console.error("Error fetching customer segments:", err);
        res.status(500).json({ error: 'Failed to fetch data.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Customer Segmentation Detailed View
app.get('/api/segment-details', async (req, res) => {
    let connection;
    try {
        const { segment } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 15; // Show 15 customers per page
        const offset = (page - 1) * limit;

        if (!segment || segment === 'all') {
            return res.status(400).json({ error: 'A valid segment is required.' });
        }

        const binds = { segment, offset, limit };

        // Query to get the paginated list of customers in the segment
        const dataQuery = `
            SELECT
                ltv.CUSTOMER_ID,
                ltv.TOTAL_ORDERS,
                ltv.LIFETIME_VALUE as TOTAL_REVENUE
            FROM V_CUSTOMER_LIFETIME_VALUE ltv
            JOIN V_CUSTOMER_SEGMENT seg ON ltv.CUSTOMER_ID = seg.CUSTOMER_ID
            WHERE seg.SEGMENT = :segment
            ORDER BY ltv.LIFETIME_VALUE DESC
            OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
        `;

        // Query to get the total count for pagination
        const countQuery = `
            SELECT COUNT(*) as TOTAL FROM V_CUSTOMER_SEGMENT WHERE SEGMENT = :segment
        `;

        connection = await oracledb.getConnection(dbConfig);
        const dataResult = await connection.execute(dataQuery, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const countResult = await connection.execute(countQuery, { segment }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const totalRows = countResult.rows[0].TOTAL;

        res.json({
            data: dataResult.rows,
            totalPages: Math.ceil(totalRows / limit)
        });

    } catch (err) {
        console.error("Error fetching segment details:", err);
        res.status(500).json({ error: 'Failed to fetch data.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// KPI Card: Total Unique Customers
app.get('/api/kpi/total-customers', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT COUNT(DISTINCT ID) as TOTAL FROM CUSTOMERS`);
        res.json(result.rows[0]);
    } catch (err) { /* ... error handling ... */ }
    finally { if (connection) { /* ... close connection ... */ } }
});

// KPI Card: Average Order Value
app.get('/api/kpi/avg-order-value', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT ROUND(AVG(TOTAL), 2) as AVG_VALUE FROM ORDERS`);
        res.json(result.rows[0]);
    } catch (err) { /* ... error handling ... */ }
    finally { if (connection) { /* ... close connection ... */ } }
});

// Average Spend Monthly KPI
app.get('/api/kpi/avg-spend-monthly', async (req, res) => {
    let connection;
    try {
        const binds = {};
        let whereClause = 'WHERE 1=1';

        // --- Filter Logic for the View's Text Columns ---
        if (req.query.year && req.query.year !== 'all') {
            whereClause += ' AND v.YEAR = :year';
            binds.year = req.query.year;
        }
        if (req.query.quarter && req.query.quarter !== 'all' && req.query.year && req.query.year !== 'all') {
            const quarterString = `${req.query.year}-Q${req.query.quarter}`;
            whereClause += ` AND v.QUARTER = :quarterString`;
            binds.quarterString = quarterString;
        }

        const query = `
            SELECT 
                v.MONTH,
                ROUND(AVG(v.AVG_SPEND_PER_ORDER), 2) as AVG_SPEND
            FROM V_AVG_SPEND_CUSTOMER_TIME v
            ${whereClause}
            GROUP BY v.MONTH
            ORDER BY v.MONTH ASC
        `;

        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, binds);

        const chartData = result.rows.map(row => ({
            month: row[0],
            avgSpend: row[1]
        }));

        res.json(chartData);
    } catch (err) {
        console.error("Error fetching average spend data:", err);
        res.status(500).json({ error: 'Failed to fetch average spend data.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Get the detailed order history for a single customer
app.get('/api/customer-history/:customerId', async (req, res) => {
    const { customerId } = req.params;
    let connection;

    try {
        const binds = { customerId: customerId };
        // We start the WHERE clause by filtering for the specific customer
        let whereClause = 'WHERE o.CUSTOMERID = :customerId';

        // --- Add the complete dynamic filter logic ---
        if (req.query.year && req.query.year !== 'all') {
            whereClause += ' AND EXTRACT(YEAR FROM o.ORDERDATE) = :year';
            binds.year = req.query.year;
        }
        if (req.query.quarter && req.query.quarter !== 'all') {
            whereClause += ` AND TO_CHAR(o.ORDERDATE, 'Q') = :quarter`;
            binds.quarter = req.query.quarter;
        }
        if (req.query.month && req.query.month !== 'all') {
            whereClause += ' AND EXTRACT(MONTH FROM o.ORDERDATE) = :month';
            binds.month = req.query.month;
        }
        if (req.query.state && req.query.state !== 'all') {
            whereClause += ' AND s.STATE_ABBR = :state';
            binds.state = req.query.state;
        }

        const query = `
            SELECT 
                p.NAME as PRODUCT_NAME,
                c.NAME as CATEGORY,
                ps.NAME as PRODUCT_SIZE,
                oi.QUANTITY,
                p.PRICE as PRODUCT_PRICE,
                o.ORDERDATE
            FROM ORDERS o
            JOIN ORDER_ITEMS oi ON o.ID = oi.ORDERID
            JOIN PRODUCTS p ON oi.SKU = p.SKU
            JOIN CATEGORIES c ON p.CATEGORY_ID = c.ID
            JOIN PRODUCTSIZES ps ON p.SIZE_ID = ps.ID
            JOIN STORES s ON o.STOREID = s.STOREID
            ${whereClause}
            ORDER BY o.ORDERDATE DESC
        `;

        // DEBUGGING 
        console.log("-----------------------------------------");
        console.log("EXECUTING CUSTOMER HISTORY QUERY:");
        console.log(query);
        console.log("WITH BIND VARIABLES:");
        console.log(binds);
        console.log("-----------------------------------------");

        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json(result.rows);

    } catch (err) {
        console.error(`Error fetching history for customer ${customerId}:`, err);
        res.status(500).json({ error: 'Failed to fetch customer history.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Store list endpoint
app.get('/api/kpi/store-list', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`
            SELECT storeid, city || ' - ' || state_abbr AS name
            FROM stores
            ORDER BY storeid
        `);
        const stores = result.rows.map(row => ({
            storeid: row[0],
            name: row[1]
        }));
        res.json(stores);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch store list.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Top Selling Products 
app.get('/api/kpi/top-products', async (req, res) => {
    let connection;
    let whereClause = 'WHERE 1=1';
    const binds = {};

    // This logic now correctly handles all filters coming from your component
    if (req.query.year && req.query.year !== 'all') {
        whereClause += ' AND EXTRACT(YEAR FROM o.ORDERDATE) = :year';
        binds.year = req.query.year;
    }
    if (req.query.quarter && req.query.quarter !== 'all') {
        whereClause += ` AND TO_CHAR(o.ORDERDATE, 'Q') = :quarter`;
        binds.quarter = req.query.quarter;
    }
    if (req.query.month && req.query.month !== 'all') {
        // This now correctly uses the simple month number (e.g., 5)
        whereClause += ' AND EXTRACT(MONTH FROM o.ORDERDATE) = :month';
        binds.month = req.query.month;
    }
    if (req.query.state && req.query.state !== 'all') {
        whereClause += ' AND s.STATE_ABBR = :state';
        binds.state = req.query.state;
    }
    if (req.query.storeId && req.query.storeId !== 'all') {
        whereClause += ' AND o.STOREID = :storeId';
        binds.storeId = req.query.storeId;
    }
    // Add other filters like storeId if needed

    try {
        connection = await oracledb.getConnection(dbConfig);

        let sortField = 'TOTAL_REVENUE';
        if (req.query.sort === 'quantity') {
            sortField = 'TOTAL_QUANTITY';
        }

        const query = `
             SELECT
                p.SKU,
                p.NAME AS PRODUCT_NAME,
                ps.NAME AS PRODUCT_SIZE,
                p.LAUNCH,
                SUM(oi.QUANTITY) AS TOTAL_QUANTITY,
                SUM(oi.QUANTITY * p.PRICE) AS TOTAL_REVENUE
            FROM ORDERS o
            JOIN ORDER_ITEMS oi ON o.ID = oi.ORDERID
            JOIN PRODUCTS p ON oi.SKU = p.SKU
            JOIN PRODUCTSIZES ps ON p.SIZE_ID = ps.ID
            JOIN STORES s ON o.STOREID = s.STOREID
            ${whereClause}
            GROUP BY p.SKU, p.NAME, ps.NAME, p.LAUNCH
            ORDER BY ${sortField} DESC
            FETCH FIRST 10 ROWS ONLY
            
        `;

        const result = await connection.execute(query, binds);

        const chartData = result.rows.map(row => ({
            sku: row[0],
            name: row[1],
            size: row[2],
            launch: row[3],
            quantity: row[4],
            revenue: row[5]
        }));

        res.json(chartData);

    } catch (err) {
        console.error("Error fetching top products:", err);
        res.status(500).json({ error: 'Failed to fetch top selling products.', details: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Churn Detection KPI using a pre-built Oracle View
app.get('/api/kpi/churn-risk', async (req, res) => {
    let connection;
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10; // Show 10 rows per page
        const offset = (page - 1) * limit;

        const dataQuery = `
            SELECT CUSTOMER_ID, LAST_ORDER_DATE 
            FROM V_CUSTOMER_CHURN 
            ORDER BY LAST_ORDER_DATE ASC
            OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
        `;

        const countQuery = `SELECT COUNT(*) as TOTAL FROM V_CUSTOMER_CHURN`;

        connection = await oracledb.getConnection(dbConfig);

        // Run both queries
        const dataResult = await connection.execute(dataQuery, { offset, limit }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const countResult = await connection.execute(countQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const totalRows = countResult.rows[0].TOTAL;

        // Send back both the data for the current page and the total number of pages
        res.json({
            data: dataResult.rows,
            totalPages: Math.ceil(totalRows / limit)
        });

    } catch (err) {
        console.error("Error fetching churn risk customers:", err);
        res.status(500).json({ error: 'Failed to fetch data.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Store Performance Ranking (NEW)
app.get('/api/kpi/store-performance-ranking', async (req, res) => {
    let connection;
    const binds = {};
    let whereClause = 'WHERE 1=1'; // Start with a condition that is always true

    const { rankingType = 'totalRevenue', year, quarter, month, state } = req.query;

    // --- Dynamic Filters based on request query parameters ---
    if (year && year !== 'all') {
        whereClause += ' AND EXTRACT(YEAR FROM o.ORDERDATE) = :year';
        binds.year = Number(year);
    }
    if (quarter && quarter !== 'all') {
        whereClause += ' AND TO_CHAR(o.ORDERDATE, \'Q\') = :quarter';
        binds.quarter = quarter;
    }
    if (month && month !== 'all') {
        whereClause += ' AND EXTRACT(MONTH FROM o.ORDERDATE) = :month';
        binds.month = Number(month);
    }
    if (state && state !== 'all') {
        whereClause += ' AND s.STATE_ABBR = :state'; // Assuming STORES table has STATE_ABBR
        binds.state = state;
    }

    // --- Determine the aggregation metric and sort order ---
    let selectAggregate;
    let orderByColumn;

    switch (rankingType) {
        case 'totalOrders':
            selectAggregate = 'COUNT(o.ID)';
            orderByColumn = 'TOTAL_ORDERS_AGG';
            break;
        case 'avgOrderValue':
            selectAggregate = 'ROUND(AVG(o.TOTAL), 2)';
            orderByColumn = 'AVG_ORDER_VALUE_AGG';
            break;
        case 'activeCustomers':
            selectAggregate = 'COUNT(DISTINCT o.CUSTOMERID)';
            orderByColumn = 'ACTIVE_CUSTOMERS_AGG';
            break;
        case 'totalRevenue':
        default: // Default to totalRevenue
            selectAggregate = 'SUM(o.TOTAL)';
            orderByColumn = 'TOTAL_REVENUE_AGG';
            break;
    }

    try {
        connection = await oracledb.getConnection(dbConfig);

        // --- The new SQL Query to aggregate directly from ORDERS and STORES ---
        const query = `
            SELECT
                s.STOREID,
                s.CITY || ', ' || s.STATE_ABBR AS STORE_NAME, -- Combine city and state for a descriptive name
                ${selectAggregate} AS RANK_VALUE_AGG,
                -- Include other aggregates if you might need them in the future for different ranking types
                SUM(o.TOTAL) AS TOTAL_REVENUE_AGG,
                COUNT(o.ID) AS TOTAL_ORDERS_AGG,
                ROUND(AVG(o.TOTAL), 2) AS AVG_ORDER_VALUE_AGG,
                COUNT(DISTINCT o.CUSTOMERID) AS ACTIVE_CUSTOMERS_AGG
            FROM
                ORDERS o
            JOIN
                STORES s ON o.STOREID = s.STOREID
            ${whereClause}
            GROUP BY
                s.STOREID, s.CITY, s.STATE_ABBR
            ORDER BY
                ${orderByColumn} DESC
            FETCH FIRST 10 ROWS ONLY
        `;

        console.log("Executing Store Performance Ranking Query (NEW):", query, binds); // For debugging
        const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_ARRAY }); // Use array format for easy mapping

        console.log("Query result rows (NEW):", result.rows);

        // Map the results to the format expected by your React chart
        // The column order in SELECT is crucial here for mapping
        const response = result.rows.map(row => ({
            storeId: row[0],         // s.STOREID
            storeName: row[1],       // s.CITY || ', ' || s.STATE_ABBR
            value: Number(row[2])    // The RANK_VALUE_AGG, cast to Number
            // You can also pass other aggregated values if needed in tooltip or elsewhere
            // totalRevenue: Number(row[3]),
            // totalOrders: Number(row[4]),
            // avgOrderValue: Number(row[5]),
            // activeCustomers: Number(row[6])
        }));

        res.json(response);

    } catch (err) {
        console.error("Error in /store-performance-ranking (NEW):", err);
        res.status(500).json({ error: 'Failed to fetch store performance ranking.', details: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error(e); }
        }
    }
});


app.get('/api/kpi/avg-order-value-by-store', async (req, res) => {
    let connection;
    const binds = {};
    let whereClause = 'WHERE 1=1';

    // Extract filters from query parameters
    const { year, quarter, month, state, storeId } = req.query;

    // Apply filters
    if (year && year !== 'all') {
        whereClause += ' AND EXTRACT(YEAR FROM o.ORDERDATE) = :year';
        binds.year = Number(year);
    }
    if (quarter && quarter !== 'all') {
        whereClause += ' AND TO_CHAR(o.ORDERDATE, \'Q\') = :quarter';
        binds.quarter = quarter;
    }
    if (month && month !== 'all') {
        whereClause += ' AND EXTRACT(MONTH FROM o.ORDERDATE) = :month';
        binds.month = Number(month);
    }
    if (state && state !== 'all') {
        whereClause += ' AND s.STATE_ABBR = :state';
        binds.state = state;
    }
    if (storeId && storeId !== 'all') {
        whereClause += ' AND s.STOREID = :storeId';
        binds.storeId = Number(storeId);
    }

    try {

        connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT
                s.STOREID,
                s.CITY || ', ' || s.STATE_ABBR AS STORE_NAME,
                ROUND(AVG(o.TOTAL), 2) AS AVG_ORDER_VALUE
            FROM
                ORDERS o
            JOIN
                STORES s ON o.STOREID = s.STOREID
            ${whereClause}
            GROUP BY
                s.STOREID, s.CITY, s.STATE_ABBR
            ORDER BY
                s.CITY, s.STATE_ABBR -- Order by store name for consistent display
        `;

        console.log("Executing Avg Order Value By Store Query:", query, binds);
        const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_ARRAY });

        const chartData = result.rows.map(row => ({
            storeId: row[0],
            storeName: row[1],
            avgOrderValue: Number(row[2]) // The aggregated average order value
        }));

        res.json(chartData);

    } catch (err) {
        console.error("Error in /avg-order-value-by-store:", err);
        res.status(500).json({ error: 'Failed to fetch average order value by store.', details: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error(e); }
        }
    }
});

// Top Stores by Products Sold KPI
app.get('/api/kpi/top-stores-by-products-sold', async (req, res) => {
    let connection;
    const binds = {};
    let whereClause = 'WHERE 1=1'; // Start with a true condition

    // Filters for year, quarter, month, state (from ORDERS table)
    const { year, quarter, month, state } = req.query;

    if (year && year !== 'all') {
        whereClause += ' AND EXTRACT(YEAR FROM o.ORDERDATE) = :year';
        binds.year = Number(year);
    }
    if (quarter && quarter !== 'all') {
        whereClause += ' AND TO_CHAR(o.ORDERDATE, \'Q\') = :quarter';
        binds.quarter = quarter;
    }
    if (month && month !== 'all') {
        whereClause += ' AND EXTRACT(MONTH FROM o.ORDERDATE) = :month';
        binds.month = Number(month);
    }
    if (state && state !== 'all') {
        whereClause += ' AND s.STATE_ABBR = :state';
        binds.state = state;
    }

    try {
        connection = await oracledb.getConnection(dbConfig);

        // SQL Query: Joins ORDERS, STORES, and ORDER_ITEMS to sum up product quantities per store
        const query = `
            SELECT
                s.STOREID,
                s.CITY || ', ' || s.STATE_ABBR AS STORE_NAME,
                SUM(oi.QUANTITY) AS TOTAL_PRODUCTS_SOLD
            FROM
                ORDERS o
            JOIN
                STORES s ON o.STOREID = s.STOREID
            JOIN
                ORDER_ITEMS oi ON o.ID = oi.ORDERID -- Join to get individual product quantities
            ${whereClause}
            GROUP BY
                s.STOREID, s.CITY, s.STATE_ABBR
            ORDER BY
                TOTAL_PRODUCTS_SOLD DESC
            FETCH FIRST 10 ROWS ONLY
        `;

        console.log("Executing Top Stores By Products Sold Query:", query, binds);
        const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_ARRAY });
        console.log("Top Stores By Products Sold Query result rows:", result.rows);

        const responseData = result.rows.map(row => ({
            storeId: row[0],
            storeName: row[1],
            productsSold: Number(row[2]) // The total quantity of products sold by the store
        }));

        res.json(responseData);

    } catch (err) {
        console.error("Error in /top-stores-by-products-sold:", err);
        res.status(500).json({ error: 'Failed to fetch top stores by products sold.', details: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error(e); }
        }
    }
});

// Total Stores Count KPI
app.get('/api/kpi/total-stores-count', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const query = `
            SELECT COUNT(DISTINCT STOREID) AS TOTAL_STORES
            FROM STORES
        `;

        console.log("Executing Total Stores Count Query:", query);
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_ARRAY });
        console.log("Total Stores Count Query result rows:", result.rows);

        // The result will be a single row with one column: [ [count] ]
        const totalStores = result.rows.length > 0 ? Number(result.rows[0][0]) : 0;

        res.json({ totalStores: totalStores });

    } catch (err) {
        console.error("Error in /total-stores-count:", err);
        res.status(500).json({ error: 'Failed to fetch total stores count.', details: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error(e); }
        }
    }
});

// Product Monthly Sales Since Launch
app.get('/api/kpi/product-monthly-sales-since-launch', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Bạn có thể thêm filter nếu muốn, ví dụ theo category, sku, v.v.
        // Ở đây lấy toàn bộ dữ liệu từ view
        const query = `
            SELECT
                sku,
                product_name,
                launch,
                month_since_launch,
                total_quantity,
                total_revenue
            FROM v_product_monthly_sales_since_launch
            ORDER BY product_name, month_since_launch
        `;

        const result = await connection.execute(query);

        // Format lại cho frontend
        const chartData = result.rows.map(row => ({
            sku: row[0],
            product_name: row[1],
            launch: row[2],
            month_since_launch: Number(row[3]),
            total_quantity: Number(row[4]),
            total_revenue: Number(row[5])
        }));

        res.json(chartData);
    } catch (err) {
        console.error("Error fetching product cohort sales data:", err);
        res.status(500).json({ error: 'Failed to fetch product cohort sales data.', details: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Product Sales Distribution KPI
app.get('/api/kpi/product-sales-distribution', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Lấy filter từ query string
        const metric = req.query.metric || 'revenue'; // 'revenue' hoặc 'orders'
        const compareBy = req.query.compareBy || 'category'; // 'category' hoặc 'size'
        const timeResolution = req.query.timeResolution || 'month'; // 'month', 'quarter', 'year'
        const timeValue = req.query.timeValue && req.query.timeValue !== 'all' ? req.query.timeValue : null;

        // Xác định cột thời gian
        let timeCol = 'month';
        if (timeResolution === 'quarter') timeCol = 'quarter';
        if (timeResolution === 'year') timeCol = 'year';

        // Xác định cột group
        let groupCol = compareBy === 'size' ? 'size' : 'category';

        // Xác định cột metric
        let metricCol = metric === 'orders' ? 'total_orders' : 'total_revenue';

        // Query từ view/mv phù hợp
        let query = `
            SELECT
                ${groupCol},
                product_name,
                SUM(${metricCol}) AS value
            FROM mv_sales_product_time
            WHERE 1=1
        `;

        const binds = {};

        // Thêm filter thời gian nếu có
        if (timeValue) {
            query += ` AND ${timeCol} = :timeValue`;
            binds.timeValue = timeValue;
        }

        query += `
            GROUP BY ${groupCol}, product_name
            ORDER BY ${groupCol}, value DESC
        `;

        const result = await connection.execute(query, binds);

        // Format cho frontend: { group, product, value }
        const chartData = result.rows.map(row => ({
            group: row[0],
            product: row[1],
            value: Number(row[2])
        }));

        res.json(chartData);
    } catch (err) {
        console.error("Error fetching product sales distribution:", err);
        res.status(500).json({ error: 'Failed to fetch product sales distribution.', details: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Example: Endpoint trả về tổng số ingredients, min/max ingredients per product
app.get('/api/kpi/ingredients-dashboard-stats', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Tổng số ingredients
        const totalIngredientsResult = await connection.execute(`SELECT COUNT(*) FROM ingredients`);
        const totalIngredients = totalIngredientsResult.rows[0][0];

        // Min/max ingredients per product
        const minMaxResult = await connection.execute(`
            SELECT MIN(cnt), MAX(cnt)
            FROM (
                SELECT COUNT(*) AS cnt
                FROM product_ingredients
                GROUP BY sku
            )
        `);
        const minIngredients = minMaxResult.rows[0][0];
        const maxIngredients = minMaxResult.rows[0][1];

        res.json({
            totalIngredients,
            minIngredients,
            maxIngredients
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch ingredients dashboard stats.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Product Size Distribution KPI
app.get('/api/kpi/product-size-distribution', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const metric = req.query.metric === 'orders' ? 'total_orders' : 'total_revenue';
        // Lấy dữ liệu từ view, chuẩn hóa tên size về chuẩn "Small", "Medium", "Large", "Extra Large"
        const query = `
            SELECT INITCAP(LOWER("size")) AS size, product_name, SUM(${metric}) AS value
            FROM v_order_per_product_by_size
            GROUP BY INITCAP(LOWER("size")), product_name
            ORDER BY size, value DESC
        `;
        const result = await connection.execute(query);
        const chartData = result.rows.map(row => ({
            size: row[0],      // "Small", "Medium", "Large", "Extra Large"
            product: row[1],
            value: Number(row[2])
        }));
        res.json(chartData);
    } catch (err) {
        console.error("Error fetching product size distribution:", err);
        res.status(500).json({ error: 'Failed to fetch product size distribution.', details: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Orders distribution by weekday
app.get('/api/kpi/orders-distribution-weekday', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const groupBy = req.query.groupBy === 'size' ? 'size' : 'category';

        let query, field;
        if (groupBy === 'size') {
            query = `
                SELECT
                    weekday,
                    weekday_name,
                    "size",
                    SUM(total_orders) AS total_orders
                FROM mv_orders_distribution_weekday_category_size_en
                GROUP BY weekday, weekday_name, "size"
                ORDER BY weekday, "size"
            `;
            field = 'size';
        } else {
            query = `
                SELECT
                    weekday,
                    weekday_name,
                    category,
                    SUM(total_orders) AS total_orders
                FROM mv_orders_distribution_weekday_category_size_en
                GROUP BY weekday, weekday_name, category
                ORDER BY weekday, category
            `;
            field = 'category';
        }

        const result = await connection.execute(query);
        const data = result.rows.map(row => ({
            weekday: row[0],
            weekday_name: row[1].trim(),
            [field]: row[2],
            total_orders: Number(row[3])
        }));
        res.json(data);
    } catch (err) {
        console.error("Error fetching orders distribution by weekday:", err);
        res.status(500).json({ error: 'Failed to fetch data.', details: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { } }
    }
});

// Product revenue by size
app.get('/api/kpi/product-revenue-by-size', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`
      SELECT product_name, "size", total_revenue
      FROM v_order_per_product_by_size
    `);
        const data = result.rows.map(row => ({
            product_name: row[0],
            size: row[1],
            total_revenue: Number(row[2])
        }));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch data.' });
    } finally {
        if (connection) try { await connection.close(); } catch (e) { }
    }
});

// Store summary endpoint
app.get('/api/kpi/store-summary', async (req, res) => {
    let connection;
    const binds = {};
    let whereClause = 'WHERE 1=1'; // Start with a true condition

    // Filters: year, quarter, month, state, storeId
    const { year, quarter, month, state, storeId } = req.query;

    // Apply filters to the query
    if (year && year !== 'all') {
        whereClause += ' AND YEAR = :year'; // Assuming V_STORE_PERFORMANCE_RANK has YEAR
        binds.year = Number(year);
    }
    if (quarter && quarter !== 'all') {
        whereClause += ' AND QUARTER = :quarter'; // Assuming V_STORE_PERFORMANCE_RANK has QUARTER
        binds.quarter = quarter;
    }
    if (month && month !== 'all') {
        whereClause += ' AND MONTH = :month'; // Assuming V_STORE_PERFORMANCE_RANK has MONTH
        binds.month = Number(month);
    }
    if (state && state !== 'all') {
        whereClause += ' AND STATE = :state'; // Assuming V_STORE_PERFORMANCE_RANK has STATE
        binds.state = state;
    }
    if (storeId && storeId !== 'all') {
        whereClause += ' AND STOREID = :storeId'; // Filter for specific store
        binds.storeId = Number(storeId);
    }

    try {
        connection = await oracledb.getConnection(dbConfig);

        // Subquery to get ranked data and calculate max ranks for normalization
        const query = `
            WITH RankedStoreData AS (
                SELECT
                    STOREID,
                    CITY,
                    STATE,
                    TOTAL_ORDERS,
                    TOTAL_REVENUE,
                    AVG_ORDER_VALUE,
                    ACTIVE_CUSTOMERS,
                    CUSTOMER_SHARE_PCT,
                    REVENUE_RANK,
                    AVG_VALUE_RANK,
                    ORDER_COUNT_RANK,
                    ACTIVE_CUST_RANK,
                    CUSTOMER_SHARE_RANK
                FROM V_STORE_PERFORMANCE_RANK
                ${whereClause} -- Apply filters here
            ),
            MaxRanks AS (
                SELECT
                    MAX(REVENUE_RANK) AS MAX_REVENUE_RANK,
                    MAX(AVG_VALUE_RANK) AS MAX_AVG_VALUE_RANK,
                    MAX(ORDER_COUNT_RANK) AS MAX_ORDER_COUNT_RANK,
                    MAX(ACTIVE_CUST_RANK) AS MAX_ACTIVE_CUST_RANK,
                    MAX(CUSTOMER_SHARE_RANK) AS MAX_CUSTOMER_SHARE_RANK
                FROM RankedStoreData
            )
            SELECT
                rsd.STOREID,
                rsd.CITY,
                rsd.STATE,
                rsd.TOTAL_ORDERS,
                rsd.TOTAL_REVENUE,
                rsd.AVG_ORDER_VALUE,
                rsd.ACTIVE_CUSTOMERS,
                rsd.CUSTOMER_SHARE_PCT,
                -- Calculate KPI points (0-100 scale), higher is better
                -- (Max Rank - Current Rank + 1) / Max Rank * 100
                CASE WHEN mr.MAX_REVENUE_RANK > 0 THEN ROUND(((mr.MAX_REVENUE_RANK - rsd.REVENUE_RANK + 1) / mr.MAX_REVENUE_RANK) * 100, 2) ELSE 0 END AS REVENUE_POINT,
                CASE WHEN mr.MAX_AVG_VALUE_RANK > 0 THEN ROUND(((mr.MAX_AVG_VALUE_RANK - rsd.AVG_VALUE_RANK + 1) / mr.MAX_AVG_VALUE_RANK) * 100, 2) ELSE 0 END AS AVG_VALUE_POINT,
                CASE WHEN mr.MAX_ORDER_COUNT_RANK > 0 THEN ROUND(((mr.MAX_ORDER_COUNT_RANK - rsd.ORDER_COUNT_RANK + 1) / mr.MAX_ORDER_COUNT_RANK) * 100, 2) ELSE 0 END AS ORDER_COUNT_POINT,
                CASE WHEN mr.MAX_ACTIVE_CUST_RANK > 0 THEN ROUND(((mr.MAX_ACTIVE_CUST_RANK - rsd.ACTIVE_CUST_RANK + 1) / mr.MAX_ACTIVE_CUST_RANK) * 100, 2) ELSE 0 END AS ACTIVE_CUST_POINT,
                CASE WHEN mr.MAX_CUSTOMER_SHARE_RANK > 0 THEN ROUND(((mr.MAX_CUSTOMER_SHARE_RANK - rsd.CUSTOMER_SHARE_RANK + 1) / mr.MAX_CUSTOMER_SHARE_RANK) * 100, 2) ELSE 0 END AS CUSTOMER_SHARE_POINT
            FROM
                RankedStoreData rsd
            CROSS JOIN MaxRanks mr -- Cross join to get max ranks for normalization
            ORDER BY rsd.STOREID
        `;

        console.log("Executing Store Summary Query (Radar Chart):", query, binds);
        const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT }); // Use OBJECT format for easier key access
        console.log("Store Summary Query Result Rows (Radar Chart):", result.rows);

        res.json(result.rows); // Send the data as is

    } catch (err) {
        console.error("Error fetching store summary for radar chart:", err);
        res.status(500).json({ error: 'Failed to fetch store summary data for radar chart.', details: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error(e); }
        }
    }
});
/* let connection;
try {
    connection = await oracledb.getConnection(dbConfig);
    const binds = {
        state: req.query.state && req.query.state !== 'all' ? req.query.state : 'all'
    };

    const query = `
        SELECT 
            storeid,
            city,
            state,
            (33 - revenue_rank)        AS revenue_point,
            (33 - avg_value_rank)      AS avg_value_point,
            (33 - order_count_rank)    AS order_count_point,
            (33 - active_cust_rank)    AS active_cust_point,
            (33 - customer_share_rank) AS customer_share_point
        FROM v_store_performance_rank
        WHERE (:state = 'all' OR state = :state)
        ORDER BY revenue_point DESC
    `;

    const result = await connection.execute(query, binds);

    const data = result.rows.map(row => ({
        storeid: row[0],
        city: row[1],
        state: row[2],
        revenue_point: row[3],
        avg_value_point: row[4],
        order_count_point: row[5],
        active_cust_point: row[6],
        customer_share_point: row[7],
    })); */

/*res.json(data);
} catch (err) {
console.error("Error fetching store summary:", err);
res.status(500).json({ error: 'Failed to fetch store summary.' });
} finally {
if (connection) { try { await connection.close(); } catch (e) { } }
}
}); */

// New endpoint: Items by Category and Hour
app.get('/api/kpi/items-by-category-hour', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Lấy tổng số items theo category và giờ đặt hàng
        const query = `
            SELECT
                EXTRACT(HOUR FROM o.ORDERDATE) AS order_hour,
                c.NAME AS category,
                SUM(oi.QUANTITY) AS total_items
            FROM
                ORDERS o
            JOIN
                ORDER_ITEMS oi ON o.ID = oi.ORDERID
            JOIN
                PRODUCTS p ON oi.SKU = p.SKU
            JOIN
                CATEGORIES c ON p.CATEGORY_ID = c.ID
            GROUP BY
                EXTRACT(HOUR FROM o.ORDERDATE), c.NAME
            ORDER BY
                order_hour, category
        `;

        const result = await connection.execute(query);

        // Format lại dữ liệu cho frontend: [{ order_hour, category, total_items }]
        const data = result.rows.map(row => ({
            order_hour: Number(row[0]),
            category: row[1],
            total_items: Number(row[2])
        }));

        res.json(data);
    } catch (err) {
        console.error("Error fetching items by category and hour:", err);
        res.status(500).json({ error: 'Failed to fetch items by category and hour.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { } }
    }
});

// New endpoint: Items by Size and Hour
app.get('/api/kpi/items-by-size-hour', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Lấy tổng số items theo size và giờ đặt hàng
        const query = `
            SELECT
                EXTRACT(HOUR FROM o.ORDERDATE) AS order_hour,
                ps.NAME AS "size",
                SUM(oi.QUANTITY) AS total_items
            FROM
                ORDERS o
            JOIN
                ORDER_ITEMS oi ON o.ID = oi.ORDERID
            JOIN
                PRODUCTS p ON oi.SKU = p.SKU
            JOIN
                PRODUCTSIZES ps ON p.SIZE_ID = ps.ID
            GROUP BY
                EXTRACT(HOUR FROM o.ORDERDATE), ps.NAME
            ORDER BY
                order_hour, "size"
        `;

        const result = await connection.execute(query);

        // Format lại dữ liệu cho frontend: [{ order_hour, size, total_items }]
        const data = result.rows.map(row => ({
            order_hour: Number(row[0]),
            size: row[1],
            total_items: Number(row[2])
        }));

        res.json(data);
    } catch (err) {
        console.error("Error fetching items by size and hour:", err);
        res.status(500).json({ error: 'Failed to fetch items by size and hour.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { } }
    }
});

// Order Distribution by Hour of the Day
app.get('/api/kpi/orders-by-hour', async (req, res) => {
    let connection;
    try {
        const binds = {};
        let whereClause = 'WHERE 1=1';

        // Add standard filters
        if (req.query.year && req.query.year !== 'all') {
            whereClause += ' AND EXTRACT(YEAR FROM o.ORDERDATE) = :year';
            binds.year = req.query.year;
        }
        if (req.query.state && req.query.state !== 'all') {
            whereClause += ' AND s.STATE_ABBR = :state';
            binds.state = req.query.state;
        }

        const query = `
            SELECT 
                TO_CHAR(o.ORDERDATE, 'HH24') as HOUR_OF_DAY,
                COUNT(o.ID) as ORDER_COUNT
            FROM ORDERS o
            JOIN STORES s ON o.STOREID = s.STOREID
            ${whereClause}
            GROUP BY TO_CHAR(o.ORDERDATE, 'HH24')
            ORDER BY HOUR_OF_DAY ASC
        `;

        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        // Create a map for easy lookup
        const resultsMap = new Map(result.rows.map(row => [row.HOUR_OF_DAY, row.ORDER_COUNT]));

        // Ensure all 24 hours are present in the final data
        const chartData = Array.from({ length: 24 }, (_, i) => {
            const hour = String(i).padStart(2, '0'); // Format as "00", "01", etc.
            return {
                hour: `${hour}:00`,
                orderCount: resultsMap.get(hour) || 0
            };
        });

        res.json(chartData);

    } catch (err) {
        console.error("Error fetching orders by hour:", err);
        res.status(500).json({ error: 'Failed to fetch data.' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// Top Product Combinations (Corrected to prevent duplicates)
app.get('/api/kpi/product-pairs', async (req, res) => {
    let connection;
    try {
        const query = `
            SELECT
                p1.NAME as PRODUCT_A,
                p2.NAME as PRODUCT_B,
                COUNT(DISTINCT oi1.ORDERID) as ORDERS_TOGETHER
            FROM ORDER_ITEMS oi1
            JOIN ORDER_ITEMS oi2 ON oi1.ORDERID = oi2.ORDERID AND oi1.SKU < oi2.SKU
            JOIN PRODUCTS p1 ON oi1.SKU = p1.SKU
            JOIN PRODUCTS p2 ON oi2.SKU = p2.SKU
            GROUP BY p1.NAME, p2.NAME
            HAVING COUNT(DISTINCT oi1.ORDERID) > 1 -- Optional: only show pairs that appear more than once
            ORDER BY ORDERS_TOGETHER DESC
            FETCH FIRST 20 ROWS ONLY
        `;

        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.json(result.rows);

    } catch (err) {
        console.error("Error fetching product pairs:", err);
        res.status(500).json({ error: 'Failed to fetch data' });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

// --- API KPI mới ---

app.get('/api/kpi/top-ingredients-by-store', async (req, res) => {
    let connection;
    const binds = {};
    let whereClause = 'WHERE 1=1';

    try {
        connection = await oracledb.getConnection(dbConfig);

        // Lấy danh sách storeId (có thể là mảng hoặc 1 giá trị)
        let storeIds = req.query.storeId;
        if (!storeIds) {
            return res.status(400).json({ error: 'Missing storeId parameter.' });
        }
        if (!Array.isArray(storeIds)) storeIds = [storeIds];

        // Filter logic (nếu muốn thêm filter khác)
        if (req.query.week && req.query.week !== 'all') {
            whereClause += ' AND week = :week';
            binds.week = req.query.week;
        }
        if (req.query.month && req.query.month !== 'all') {
            whereClause += ' AND month = :month';
            binds.month = req.query.month;
        }
        if (req.query.quarter && req.query.quarter !== 'all') {
            whereClause += ' AND quarter = :quarter';
            binds.quarter = req.query.quarter;
        }
        if (req.query.year && req.query.year !== 'all') {
            whereClause += ' AND year = :year';
            binds.year = req.query.year;
        }
        if (req.query.state && req.query.state !== 'all') {
            whereClause += ' AND state = :state';
            binds.state = req.query.state;
        }

        // Trả về object {storeId: [ingredients...]}
        const resultObj = {};
        for (const storeId of storeIds) {
            const query = `
                SELECT ingredient_name, SUM(total_quantity_used) AS total_quantity_used
                FROM v_top_ingredients_by_store
                ${whereClause} AND storeid = :storeId
                GROUP BY ingredient_name
                ORDER BY total_quantity_used DESC
                FETCH FIRST 5 ROWS ONLY
            `;
            const result = await connection.execute(query, { ...binds, storeId });
            const total = result.rows.reduce((sum, row) => sum + row[1], 0);
            resultObj[String(storeId)] = result.rows.map(row => ({
                ingredient: row[0],
                quantity: row[1],
                percent: total > 0 ? Math.round((row[1] / total) * 1000) / 10 : 0 // 1 decimal
            }));
        }
        res.json(resultObj);

    } catch (err) {
        console.error("Error fetching top ingredients by store:", err);
        res.status(500).json({ error: 'Failed to fetch top ingredients by store.', details: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});