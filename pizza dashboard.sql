-- ===============================
-- PIZZA SALES KPIs DASHBOARD PROJECT - MASTER SQL SCRIPT
-- Created by Thi Song Thu Pham - 1413382
-- ===============================

-- ========================================= TABLES =========================================

-- Customers Table
CREATE TABLE customers (
  id        VARCHAR2(7) PRIMARY KEY,
  latitude  NUMBER(9,6),
  longitude NUMBER(9,6)
);

-- Stores Table
CREATE TABLE stores (
  storeID      VARCHAR2(7) PRIMARY KEY,
  zipcode      VARCHAR2(5),
  state_abbr   CHAR(2),
  latitude     NUMBER(9,6),
  longitude    NUMBER(9,6),
  city         VARCHAR2(100),
  state        VARCHAR2(100),
  distance     NUMBER(10,2)
);

-- Categories Table
CREATE TABLE categories (
  id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(50) UNIQUE NOT NULL
);

-- Product Sizes Table
CREATE TABLE productSizes (
  id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(20) UNIQUE NOT NULL
);

-- Ingredients Table
CREATE TABLE ingredients (
  id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(100) UNIQUE NOT NULL
);

-- Products Table
CREATE TABLE products (
  SKU          VARCHAR2(5) PRIMARY KEY,
  name         VARCHAR2(100),
  price        NUMBER(10,2),
  category_id  NUMBER,
  size_id      NUMBER,
  launch       DATE,
  CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_prod_size     FOREIGN KEY (size_id)     REFERENCES productSizes(id)
);

-- Product_Ingredients Junction Table
CREATE TABLE product_ingredients (
  SKU           VARCHAR2(5),
  ingredient_id NUMBER,
  PRIMARY KEY (SKU, ingredient_id),
  CONSTRAINT fk_pi_prod FOREIGN KEY (SKU)           REFERENCES products(SKU),
  CONSTRAINT fk_pi_ingr FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- Orders Table
CREATE TABLE orders (
  id         NUMBER PRIMARY KEY,
  customerId VARCHAR2(7),
  storeId    VARCHAR2(7),
  orderDate  TIMESTAMP,
  nItems     NUMBER,
  total      NUMBER(10,2),
  CONSTRAINT fk_orders_cust  FOREIGN KEY (customerId) REFERENCES customers(id),
  CONSTRAINT fk_orders_store FOREIGN KEY (storeId)    REFERENCES stores(storeID)
);

-- Order_Items Table (with quantity)
CREATE TABLE order_items (
  orderID   NUMBER,
  SKU       VARCHAR2(5),
  quantity  NUMBER(5) DEFAULT 1 NOT NULL,
  PRIMARY KEY (orderID, SKU),
  CONSTRAINT fk_items_order FOREIGN KEY (orderID) REFERENCES orders(id),
  CONSTRAINT fk_items_prod  FOREIGN KEY (SKU)     REFERENCES products(SKU)
);

-- Orders_By_Day Table (for day-category aggregate)
CREATE TABLE orders_by_day (
  order_date  DATE,
  category    VARCHAR2(50),
  day_of_week VARCHAR2(15),
  price       NUMBER(10,2),
  orders      NUMBER,
  CONSTRAINT pk_orders_by_day PRIMARY KEY (order_date, category)
);

-- ================================= INDEXES (For Query Optimization) =================================

CREATE INDEX idx_orders_customerid        ON orders(customerid);
CREATE INDEX idx_orders_storeid           ON orders(storeid);
CREATE INDEX idx_orders_orderdate         ON orders(orderdate);
CREATE INDEX idx_order_items_orderid      ON order_items(orderid);
CREATE INDEX idx_order_items_sku          ON order_items(sku);
CREATE INDEX idx_products_category_id     ON products(category_id);
CREATE INDEX idx_products_size_id         ON products(size_id);
CREATE INDEX idx_product_ingredients_ingredient_id ON product_ingredients(ingredient_id);
CREATE INDEX idx_customers_lat_long       ON customers(latitude, longitude);
CREATE INDEX idx_stores_city              ON stores(city);
CREATE INDEX idx_stores_state             ON stores(state);

-- =========================================== VIEWS ==================================================


-- ============= Store Summary and Ranking =============

-- 1. Store Summary View
-- Aggregates store-level metrics: total orders, revenue, average order value, unique customers (active customers), customer share.

CREATE OR REPLACE VIEW v_store_summary AS
SELECT 
    s.storeid,
    s.city,
    s.state,
    COUNT(o.id) AS total_orders,
    SUM(o.total) AS total_revenue,
    AVG(o.total) AS avg_order_value,
    COUNT(DISTINCT o.customerid) AS active_customers,
    ROUND(
        (COUNT(DISTINCT o.customerid) * 100.0) / 
        (SELECT COUNT(DISTINCT customerid) FROM orders), 2
    ) AS customer_share_pct
FROM orders o
JOIN stores s ON o.storeid = s.storeid
GROUP BY s.storeid, s.city, s.state
ORDER BY total_revenue DESC;

-- 2. Store Performance Multi-Rank
-- Ranks stores by revenue, average order value, active customers, and customer share, using multiple KPIs (use in the project for a Radar Chart and a Bar Chart).
-- Why Separate: Ranking logic is often expensive and best pre-computed for fast dashboarding.

CREATE OR REPLACE VIEW v_store_performance_rank AS
SELECT 
    storeid,
    city,
    state,
    total_orders,
    total_revenue,
    avg_order_value,
    active_customers,
    customer_share_pct,
    RANK() OVER (ORDER BY total_revenue DESC)        AS revenue_rank,
    RANK() OVER (ORDER BY avg_order_value DESC)      AS avg_value_rank,
    RANK() OVER (ORDER BY total_orders DESC)         AS order_count_rank,
    RANK() OVER (ORDER BY active_customers DESC)     AS active_cust_rank,
    RANK() OVER (ORDER BY customer_share_pct DESC)   AS customer_share_rank
FROM v_store_summary;

-- ============= PRODUCT, CATEGORY AND SALES TREND =============

-- 3. Sales Product Time View
-- Provides sales stats (order count, quantity, revenue) for each product and category by month, quarter, year. An all-rounder view for good filtering. 
-- Business Case: Crucial for trend analysis, seasonality, forecasting, and product life cycle management.

CREATE MATERIALIZED VIEW mv_sales_product_time AS
SELECT
    TO_CHAR(o.orderdate, 'YYYY-MM') AS month,
    TO_CHAR(o.orderdate, 'YYYY-"Q"Q') AS quarter,
    TO_CHAR(o.orderdate, 'YYYY') AS year,
    p.name AS product_name,
    c.name AS category,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(oi.quantity) AS total_quantity,
    SUM(oi.quantity * p.price) AS total_revenue
FROM orders o
JOIN order_items oi ON o.id = oi.orderid
JOIN products p ON oi.sku = p.sku
JOIN categories c ON p.category_id = c.id
GROUP BY 
    TO_CHAR(o.orderdate, 'YYYY-MM'),
    TO_CHAR(o.orderdate, 'YYYY-"Q"Q'),
    TO_CHAR(o.orderdate, 'YYYY'),
    p.name, c.name
ORDER BY year, quarter, month, total_revenue DESC;

-- 4. Orders Distribution by Weekday, Category, and Size
-- Aggregates order counts and revenue by weekday, product category, and size. This is used on Orders Dashboard, Stacked Bar Chart and Area Chart. 

CREATE MATERIALIZED VIEW mv_orders_distribution_weekday_category_size_en AS
SELECT
    TO_CHAR(o.orderdate, 'D') AS weekday,
    RTRIM(TO_CHAR(o.orderdate, 'Day', 'NLS_DATE_LANGUAGE = ''ENGLISH''')) AS weekday_name,
    c.name AS category,
    s.name AS "size",
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(oi.quantity * p.price) AS total_revenue
FROM orders o
JOIN order_items oi ON o.id = oi.orderid
JOIN products p ON oi.sku = p.sku
JOIN categories c ON p.category_id = c.id
JOIN productsizes s ON p.size_id = s.id
GROUP BY
    TO_CHAR(o.orderdate, 'D'),
    RTRIM(TO_CHAR(o.orderdate, 'Day', 'NLS_DATE_LANGUAGE = ''ENGLISH''')),
    c.name,
    s.name
ORDER BY
    TO_CHAR(o.orderdate, 'D'),
    c.name,
    s.name;

-- 4. Order Per Product By Size View
-- Shows order counts and revenue for each product and its size variant. A specific view for aggrgates that helps with performance. 

CREATE OR REPLACE VIEW v_order_per_product_by_size AS
  SELECT 
    p.name AS product_name,
    s.name AS "size",       
    COUNT(oi.orderid) AS total_orders,
    SUM(oi.quantity * p.price) AS total_revenue
FROM order_items oi
JOIN products p ON oi.sku = p.sku
JOIN productsizes s ON p.size_id = s.id
GROUP BY p.name, s.name
ORDER BY total_revenue DESC;

-- 5. Orders Per Category View
-- Aggregates order count and revenue by product category. The same as the Orders Per Product by Size view, but for categories.

CREATE OR REPLACE VIEW v_orders_per_category AS
SELECT 
    c.name AS category,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(oi.quantity * p.price) AS total_revenue
FROM orders o
JOIN order_items oi ON o.id = oi.orderid
JOIN products p ON oi.sku = p.sku
JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY total_revenue DESC;

-- 6. Product Launch 3-Month Performance Leaderboard
-- Ranks new products by total quantity and revenue in first 3 months after launch.
-- Business Case: Track launch success, optimize marketing spend for new products.
-- Power BI Usage: Product leaderboard visuals, cohort analysis for new launches.
-- Why Separate: Launch phase is a distinct, high-value analytics period.

CREATE OR REPLACE VIEW v_product_launch_leaderboard AS
SELECT
    p.sku,
    p.name AS product_name,
    p.launch,
    SUM(oi.quantity) AS quantity_3months,
    SUM(oi.quantity * p.price) AS revenue_3months
FROM products p
JOIN order_items oi ON oi.sku = p.sku
JOIN orders o ON oi.orderid = o.id
WHERE o.orderdate BETWEEN p.launch AND ADD_MONTHS(p.launch, 3)
GROUP BY p.sku, p.name, p.launch
ORDER BY revenue_3months DESC;

-- 7. Product Sales by Month Since Launch
-- Shows monthly sales cohort for each product starting from its launch. This view is used for cohort analysis and product growth tracking on Products Dashboard.

CREATE OR REPLACE VIEW v_product_monthly_sales_since_launch AS
SELECT
    p.sku,
    p.name AS product_name,
    p.launch,
    FLOOR(MONTHS_BETWEEN(o.orderdate, p.launch)) + 1 AS month_since_launch,
    SUM(oi.quantity) AS total_quantity,
    SUM(oi.quantity * p.price) AS total_revenue
FROM products p
JOIN order_items oi ON oi.sku = p.sku
JOIN orders o ON oi.orderid = o.id
WHERE o.orderdate >= p.launch
GROUP BY
    p.sku,
    p.name,
    p.launch,
    FLOOR(MONTHS_BETWEEN(o.orderdate, p.launch)) + 1
ORDER BY
    p.sku,
    month_since_launch;

-- 8. Product Pair Sales Analysis View
-- Identifies pairs of products that are frequently purchased together (market basket analysis). This view is used for a table in Products dashboard. 

CREATE OR REPLACE VIEW V_PRODUCT_PAIR_SALES AS
SELECT
    oi1.sku AS product_a,
    oi2.sku AS product_b,
    COUNT(DISTINCT oi1.orderid) AS orders_together
FROM order_items oi1
JOIN 
    order_items oi2 ON oi1.orderid = oi2.orderid 
    AND oi1.sku < oi2.sku
GROUP BY oi1.sku, oi2.sku
HAVING 
    COUNT(DISTINCT oi1.orderid) > 1;

-- ============= TIME, WEEKDAY & DAY-LEVEL SALES ANALYSIS =============

-- 9. Sales By Time View (Daily Granularity)
-- Provides detailed daily sales metrics by product and category, including quantity, total orders, total revenue, day of the week, and weekday number.

CREATE OR REPLACE VIEW v_sales_time_category_product AS
SELECT
    TRUNC(o.orderdate) AS order_date,
    TO_CHAR(o.orderdate, 'YYYY-MM') AS month,
    TO_NUMBER(TO_CHAR(o.orderdate, 'D')) AS weekday_num,
    TO_CHAR(o.orderdate, 'Day', 'NLS_DATE_LANGUAGE = English') AS day_of_week,
    c.name AS category,
    p.name AS product_name,
    SUM(oi.quantity) AS total_quantity,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(oi.quantity * p.price) AS total_revenue
FROM orders o
JOIN order_items oi ON o.id = oi.orderid
JOIN products p ON oi.sku = p.sku
JOIN categories c ON p.category_id = c.id
GROUP BY 
    TRUNC(o.orderdate),
    TO_CHAR(o.orderdate, 'YYYY-MM'),
    TO_NUMBER(TO_CHAR(o.orderdate, 'D')),
    TO_CHAR(o.orderdate, 'Day', 'NLS_DATE_LANGUAGE = English'),
    c.name,
    p.name
ORDER BY order_date, product_name;

-- ============= INGREDIENTS =============

-- 10. Most Used Ingredients Time View
-- Tracks total quantity of each ingredient used by week, month, quarter, year.

CREATE OR REPLACE VIEW v_most_used_ingredients_time AS
SELECT
    TO_CHAR(o.orderdate, 'IYYY-IW') AS week,
    TO_CHAR(o.orderdate, 'YYYY-MM') AS month,
    TO_CHAR(o.orderdate, 'YYYY-"Q"Q') AS quarter,
    TO_CHAR(o.orderdate, 'YYYY') AS year,
    i.name AS ingredient_name,
    SUM(oi.quantity) AS total_quantity_used
FROM orders o
JOIN order_items oi ON o.id = oi.orderid
JOIN products p ON oi.sku = p.sku
JOIN product_ingredients pi ON p.sku = pi.sku
JOIN ingredients i ON pi.ingredient_id = i.id
GROUP BY 
    TO_CHAR(o.orderdate, 'IYYY-IW'),
    TO_CHAR(o.orderdate, 'YYYY-MM'),
    TO_CHAR(o.orderdate, 'YYYY-"Q"Q'),
    TO_CHAR(o.orderdate, 'YYYY'),
    i.name
ORDER BY year, quarter, month, week, total_quantity_used DESC;

--11. Top Ingredients by Store View
-- Shows total quantity of each ingredient used by store, month, quarter, week, year. This separate view is used in the pie chart in Ingredients Dashboard.

CREATE OR REPLACE VIEW "PIZZA"."V_TOP_INGREDIENTS_BY_STORE" (
    "STOREID", 
    "STORE_NAME", 
    "CITY", 
    "STATE", 
    "MONTH", 
    "QUARTER", 
    "WEEK", 
    "YEAR", 
    "INGREDIENT_NAME", 
    "TOTAL_QUANTITY_USED"
) AS 
SELECT
    o.storeid,
    (s.city || ', ' || s.state_abbr) AS store_name,
    s.city,
    s.state_abbr AS state,
    TO_CHAR(o.orderdate, 'MM') AS month,         
    TO_CHAR(o.orderdate, 'Q') AS quarter,       
    TO_CHAR(o.orderdate, 'IW') AS week,          
    TO_CHAR(o.orderdate, 'YYYY') AS year,
    i.name AS ingredient_name,
    SUM(oi.quantity) AS total_quantity_used
FROM orders o
JOIN stores s          ON o.storeid = s.storeid
JOIN order_items oi    ON o.id = oi.orderid
JOIN products p        ON oi.sku = p.sku
JOIN product_ingredients pi ON p.sku = pi.sku
JOIN ingredients i     ON pi.ingredient_id = i.id
GROUP BY
    o.storeid,
    s.city,
    s.state_abbr,
    TO_CHAR(o.orderdate, 'MM'),
    TO_CHAR(o.orderdate, 'Q'),
    TO_CHAR(o.orderdate, 'IW'),
    TO_CHAR(o.orderdate, 'YYYY'),
    i.name
ORDER BY storeid, year DESC, month DESC, total_quantity_used DESC;

-- ============= CUSTOMER BEHAVIOR AND SEGMENTATION =============

-- 12. Avg Spend Per Customer Time View
-- Tracks each customer’s order frequency, spend, and average order value by month, quarter, year.

CREATE OR REPLACE VIEW v_avg_spend_customer_time AS
SELECT
    TO_CHAR(o.orderdate, 'YYYY-MM') AS month,
    TO_CHAR(o.orderdate, 'YYYY-"Q"Q') AS quarter,
    TO_CHAR(o.orderdate, 'YYYY') AS year,
    o.customerid,
    COUNT(o.id) AS total_orders,
    SUM(o.total) AS total_revenue,
    AVG(o.total) AS avg_spend_per_order
FROM orders o
GROUP BY 
    TO_CHAR(o.orderdate, 'YYYY-MM'), 
    TO_CHAR(o.orderdate, 'YYYY-"Q"Q'), 
    TO_CHAR(o.orderdate, 'YYYY'), 
    o.customerid
ORDER BY year, quarter, month, total_revenue DESC;

-- 13. Customer Segmentation
-- Segments customers by order count and spend, with assigned loyalty group. This view is used in a pie chart in Customers Dashboard.

CREATE OR REPLACE VIEW v_customer_segment AS
SELECT 
    c.id AS customer_id,
    COUNT(o.id) AS total_orders,
    NVL(SUM(o.total), 0) AS total_spend,
    MAX(o.orderdate) AS last_order_date,
    CASE
        WHEN COUNT(o.id) = 0                        THEN 'Never Purchased'
        WHEN COUNT(o.id) = 1                        THEN 'New'
        WHEN COUNT(o.id) BETWEEN 2 AND 3            THEN 'Explorer'
        WHEN COUNT(o.id) BETWEEN 4 AND 7            THEN 'Casual'
        WHEN COUNT(o.id) BETWEEN 8 AND 15           THEN 'Engaged'
        WHEN COUNT(o.id) BETWEEN 16 AND 29          THEN 'Regular'
        WHEN COUNT(o.id) BETWEEN 30 AND 49          THEN 'Loyal'
        WHEN COUNT(o.id) BETWEEN 50 AND 99          THEN 'Power Buyer'
        WHEN COUNT(o.id) BETWEEN 100 AND 499        THEN 'Super Power Buyer'
        WHEN COUNT(o.id) BETWEEN 500 AND 999        THEN 'Elite'
        WHEN COUNT(o.id) >= 1000                    THEN 'Ultra Elite'
    END AS segment
FROM customers c
LEFT JOIN orders o ON o.customerid = c.id
GROUP BY c.id;

-- 14. Monthly New Customer Acquisition
-- Shows number of new customers acquired each month based on first purchase.

CREATE OR REPLACE VIEW v_new_customers_monthly AS
SELECT
    TO_CHAR(first_order, 'YYYY-MM') AS month,
    COUNT(customer_id) AS new_customers
FROM (
    SELECT 
        c.id AS customer_id,
        MIN(o.orderdate) AS first_order
    FROM customers c
    JOIN orders o ON o.customerid = c.id
    GROUP BY c.id
)
GROUP BY TO_CHAR(first_order, 'YYYY-MM')
ORDER BY month;

-- 15. Customer Churn Detection
-- Finds customers who have not placed any orders in the last 3 months.
-- Business Case: Early warning for retention campaigns and customer re-engagement.

CREATE OR REPLACE VIEW v_customer_churn AS
SELECT 
    c.id AS customer_id,
    MAX(o.orderdate) AS last_order_date
FROM customers c
LEFT JOIN orders o ON o.customerid = c.id
GROUP BY c.id
HAVING MAX(o.orderdate) < ADD_MONTHS(TRUNC(SYSDATE), -3)
   OR MAX(o.orderdate) IS NULL;

-- 16. Customer Lifetime Value (LTV) View
-- Shows total value generated by each customer over their entire lifetime (all-time revenue, total orders, and average order value).

CREATE OR REPLACE VIEW v_customer_lifetime_value AS
SELECT
    c.id AS customer_id,
    NVL(COUNT(o.id), 0) AS total_orders,
    NVL(SUM(o.total), 0) AS lifetime_value,
    NVL(AVG(o.total), 0) AS avg_order_value,
    MIN(o.orderdate) AS first_order_date,
    MAX(o.orderdate) AS last_order_date
FROM customers c
LEFT JOIN orders o ON o.customerid = c.id
GROUP BY c.id;

-- ============= GEOGRAPHIC ANALYSIS AND MARKET POTENTIAL=============
-- 17. Nearest Store by Customers
-- For each stores, show the number of nearby customers. The more the nearby customers is, the bigger is the circle for the store. 
-- Business Case: Optimize delivery, marketing, and store siting; enables geo-based sales analytics.

CREATE MATERIALIZED VIEW MV_CUSTOMER_NEAREST_STORE
BUILD IMMEDIATE
REFRESH ON DEMAND
AS
SELECT *
FROM (
    SELECT
        c.id AS customer_id,
        c.latitude AS cust_lat,
        c.longitude AS cust_long,
        s.storeid,
        s.city,
        s.state,
        s.latitude AS store_lat,
        s.longitude AS store_long,
        ROUND(
          6371 * 2 * ASIN(SQRT(
            POWER(SIN(((c.latitude - s.latitude) * 3.141592653589793 / 180) / 2), 2) +
            COS(s.latitude * 3.141592653589793 / 180) *
            COS(c.latitude * 3.141592653589793 / 180) *
            POWER(SIN(((c.longitude - s.longitude) * 3.141592653589793 / 180) / 2), 2)
          ))
        , 2) AS distance_km,
        ROW_NUMBER() OVER (
          PARTITION BY c.id
          ORDER BY
            6371 * 2 * ASIN(SQRT(
              POWER(SIN(((c.latitude - s.latitude) * 3.141592653589793 / 180) / 2), 2) +
              COS(s.latitude * 3.141592653589793 / 180) *
              COS(c.latitude * 3.141592653589793 / 180) *
              POWER(SIN(((c.longitude - s.longitude) * 3.141592653589793 / 180) / 2), 2)
            ))
        ) AS rn
    FROM customers c
    CROSS JOIN stores s
) ranked
WHERE rn = 1;

-- 17. Potential Customers and Market Penetration by Store (3km radius)
-- For each store, counts all customers within 3km for whom this is the nearest store, and computes % of local population served.

ALTER TABLE STORES ADD (POPULATION NUMBER);
UPDATE STORES SET POPULATION = 392     WHERE STOREID = 'S490972';    -- Tuscarora, Nevada
UPDATE STORES SET POPULATION = 931     WHERE STOREID = 'S476770';    -- Sunol, California
UPDATE STORES SET POPULATION = 3572    WHERE STOREID = 'S750231';    -- Esparto, California
UPDATE STORES SET POPULATION = 300     WHERE STOREID = 'S688745';    -- Cibola, Arizona
UPDATE STORES SET POPULATION = 320000  WHERE STOREID = 'S817950';    -- Stockton, California
UPDATE STORES SET POPULATION = 3000    WHERE STOREID = 'S948821';    -- Arbuckle, California
UPDATE STORES SET POPULATION = 282     WHERE STOREID = 'S872983';    -- Mount Hamilton, California
UPDATE STORES SET POPULATION = 1200    WHERE STOREID = 'S799887';    -- Jackpot, Nevada
UPDATE STORES SET POPULATION = 3635    WHERE STOREID = 'S086842';    -- Battle Mountain, Nevada
UPDATE STORES SET POPULATION = 44000   WHERE STOREID = 'S068548';    -- Lompoc, California
UPDATE STORES SET POPULATION = 47000   WHERE STOREID = 'S449313';    -- San Luis Obispo, California
UPDATE STORES SET POPULATION = 170     WHERE STOREID = 'S263879';    -- Austin, Nevada
UPDATE STORES SET POPULATION = 900     WHERE STOREID = 'S276746';    -- Loyalton, California
UPDATE STORES SET POPULATION = 445     WHERE STOREID = 'S606312';    -- San Simeon, California
UPDATE STORES SET POPULATION = 6800    WHERE STOREID = 'S062214';    -- Crescent City, California
UPDATE STORES SET POPULATION = 600     WHERE STOREID = 'S064089';    -- Eureka, Nevada
UPDATE STORES SET POPULATION = 250     WHERE STOREID = 'S058118';    -- Goldfield, Nevada
UPDATE STORES SET POPULATION = 1500    WHERE STOREID = 'S918734';    -- Montague, California
UPDATE STORES SET POPULATION = 44000   WHERE STOREID = 'S361257';    -- Lompoc, California 
UPDATE STORES SET POPULATION = 1300    WHERE STOREID = 'S351225';    -- Wells, Nevada
UPDATE STORES SET POPULATION = 2600    WHERE STOREID = 'S048150';    -- Landers, California
UPDATE STORES SET POPULATION = 650     WHERE STOREID = 'S080157';    -- Schurz, Nevada
UPDATE STORES SET POPULATION = 208     WHERE STOREID = 'S588444';    -- Paradise Valley, Nevada
UPDATE STORES SET POPULATION = 170     WHERE STOREID = 'S669665';    -- Imlay, Nevada
UPDATE STORES SET POPULATION = 450     WHERE STOREID = 'S216043';    -- Point Arena, California
UPDATE STORES SET POPULATION = 1531    WHERE STOREID = 'S396799';    -- Stewarts Point, California
UPDATE STORES SET POPULATION = 248     WHERE STOREID = 'S505400';    -- Duckwater, Nevada
UPDATE STORES SET POPULATION = 99      WHERE STOREID = 'S147185';    -- Lund, Nevada
UPDATE STORES SET POPULATION = 1800    WHERE STOREID = 'S122017';    -- Redwood Valley, California
UPDATE STORES SET POPULATION = 150     WHERE STOREID = 'S987243';    -- Ibapah, Utah
UPDATE STORES SET POPULATION = 1500    WHERE STOREID = 'S914827';    -- Montague, California
UPDATE STORES SET POPULATION = 150     WHERE STOREID = 'S302800';    -- Ibapah, Utah
UPDATE STORES SET POPULATION = 7272    WHERE STOREID = 'S370494';    -- Lakeshore, California
UPDATE STORES SET POPULATION = 1429    WHERE STOREID = 'S486166';    -- Jackpot, Nevada

CREATE MATERIALIZED VIEW mv_potential_customers_5km AS
WITH nearest_store AS (
  SELECT
    c.id AS customer_id,
    s.storeid,
    s.latitude,
    s.longitude,
    s.population,
    6371 * 2 * ASIN(SQRT(
        POWER(SIN(((c.latitude - s.latitude) * 3.141592653589793 / 180) / 2), 2) +
        COS(s.latitude * 3.141592653589793 / 180) *
        COS(c.latitude * 3.141592653589793 / 180) *
        POWER(SIN(((c.longitude - s.longitude) * 3.141592653589793 / 180) / 2), 2)
    )) AS distance_km,
    ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY 
        6371 * 2 * ASIN(SQRT(
            POWER(SIN(((c.latitude - s.latitude) * 3.141592653589793 / 180) / 2), 2) +
            COS(s.latitude * 3.141592653589793 / 180) *
            COS(c.latitude * 3.141592653589793 / 180) *
            POWER(SIN(((c.longitude - s.longitude) * 3.141592653589793 / 180) / 2), 2)
        )) ASC
    ) AS rn
  FROM customers c
  CROSS JOIN stores s
)
SELECT
  ns.storeid,
  ns.latitude AS store_lat,
  ns.longitude AS store_long,
  ns.population AS store_population,
  COUNT(ns.customer_id) AS potential_customers,
  ROUND(
    100 * COUNT(ns.customer_id) / NULLIF(ns.population, 0), 2
  ) AS market_penetration_pct
FROM nearest_store ns
WHERE ns.rn = 1
  AND ns.distance_km < 5
GROUP BY ns.storeid, ns.latitude, ns.longitude, ns.population;

-- 18. Store-Customer Density
-- For each store, counts customers within 3km. 

CREATE OR REPLACE VIEW V_STORE_CUSTOMER_DENSITY_MONTH AS
SELECT
    s.storeid,
    s.latitude AS store_lat,
    s.longitude AS store_long,
    TO_CHAR(c_dist.orderdate, 'YYYY') AS order_year,
    TO_CHAR(c_dist.orderdate, 'YYYY-Q') AS order_quarter,
    TO_CHAR(c_dist.orderdate, 'YYYY-MM') AS order_month,
    COUNT(DISTINCT c_dist.customer_id) AS customer_3km
FROM stores s
JOIN (
    SELECT
        c.id AS customer_id,
        c.latitude AS customer_lat,
        c.longitude AS customer_long,
        o.orderdate,
        s_inner.storeid,
        (
            6371 * 2 * ASIN(SQRT(
                POWER(SIN(((c.latitude - s_inner.latitude) * 3.141592653589793 / 180) / 2), 2) +
                COS(s_inner.latitude * 3.141592653589793 / 180) *
                COS(c.latitude * 3.141592653589793 / 180) *
                POWER(SIN(((c.longitude - s_inner.longitude) * 3.141592653589793 / 180) / 2), 2)
            ))
        ) AS dist
    FROM customers c
    JOIN orders o ON o.customerid = c.id
    JOIN stores s_inner ON 1=1
    WHERE
        c.latitude BETWEEN s_inner.latitude - (3/111.0) AND s_inner.latitude + (3/111.0)
        AND c.longitude BETWEEN s_inner.longitude - (3/(111.0 * COS(s_inner.latitude * 3.141592653589793 / 180))) AND s_inner.longitude + (3/(111.0 * COS(s_inner.latitude * 3.141592653589793 / 180)))
) c_dist ON s.storeid = c_dist.storeid
WHERE c_dist.dist < 3
GROUP BY
    s.storeid,
    s.latitude,
    s.longitude,
    TO_CHAR(c_dist.orderdate, 'YYYY'),
    TO_CHAR(c_dist.orderdate, 'YYYY-Q'),
    TO_CHAR(c_dist.orderdate,'YYYY-MM');



-- ========== EXPLAIN PLAN (Index Check Example) ==========
-- This example demonstrates index usage for query optimization
EXPLAIN PLAN FOR
SELECT * FROM orders WHERE customerid = 'C848032';

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- ========== END OF SCRIPT ==========
COMMIT;


