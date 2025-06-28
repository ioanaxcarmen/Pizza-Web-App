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
-- Business Case: Enables quick evaluation and ranking of store performance for managers; supports network optimization, benchmarking, and identification of high/low-performing stores.
-- Power BI Usage: Main source for store leaderboard, map, performance dashboards, and KPI cards.

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
-- Ranks stores by revenue, average order value, active customers, and customer share, using multiple KPIs.
-- Business Case: Enables instant leaderboard and store benchmarking; helps management prioritize support or intervention.
-- Power BI Usage: Useful for dynamic top/bottom store cards, ranking visuals, competitive benchmarking.
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
-- Provides sales stats (order count, quantity, revenue) for each product and category by month, quarter, year.
-- Business Case: Crucial for trend analysis, seasonality, forecasting, and product life cycle management.
-- Power BI Usage: Used for time-series charts, forecasting visuals, category/product comparison over time.
-- Why Separate: Time-based aggregation enables efficient trend and cohort analysis.

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

-- 4. Order Per Product By Size View
-- Shows order counts and revenue for each product and its size variant.
-- Business Case: Supports inventory, assortment, and supply chain decisions; helps optimize product portfolio.
-- Power BI Usage: Use for bar charts comparing product-size combinations; helps visualize product mix.
-- Why Separate: Provides a detailed product breakdown needed for operations and marketing.

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
-- Aggregates order count and revenue by product category.
-- Business Case: Category performance tracking, informs marketing focus and product development.
-- Power BI Usage: Pie/donut/category ranking visuals.
-- Why Separate: Categories are key management and reporting dimension.

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
-- Shows monthly sales cohort for each product starting from its launch.
-- Business Case: Enables cohort analysis, compares product growth trajectories, and detects "slow burn" products.
-- Power BI Usage: Cohort, waterfall, and time-to-peak analysis.
-- Why Separate: This analysis is only meaningful relative to launch date, not calendar time.

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
-- Identifies pairs of products that are frequently purchased together (market basket analysis).
-- Business Case: Supports cross-sell/upsell strategy, combo deal design, and menu optimization.
-- Power BI Usage: Visualize top product pairs, recommend combos, and optimize promotions.
-- Why Separate: Enables discovery of product affinity and customer buying patterns beyond single products.

CREATE OR REPLACE VIEW v_product_pair_sales AS
SELECT
    oi1.sku AS product_a,
    oi2.sku AS product_b,
    COUNT(DISTINCT oi1.orderid) AS orders_together
FROM order_items oi1
JOIN order_items oi2
    ON oi1.orderid = oi2.orderid AND oi1.sku < oi2.sku
GROUP BY oi1.sku, oi2.sku
HAVING COUNT(DISTINCT oi1.orderid) > 5
ORDER BY orders_together DESC;

-- ============= TIME, WEEKDAY & DAY-LEVEL SALES ANALYSIS =============

-- 8. Sales By Time View (Daily Granularity)
-- Provides detailed daily sales metrics by product and category, including quantity, total orders, total revenue, day of the week, and weekday number.
-- Business Case:
--   - Enables daily performance tracking, peak/off-peak analysis, and detection of sales anomalies.
--   - Supports operational decision-making (e.g., staffing, inventory adjustment, daily campaign monitoring).
--   - Useful for evaluating the impact of specific events, holidays, or promotions on sales.
-- Power BI Usage:
--   - Supports heatmaps, daily KPI dashboards, and weekday trend analysis.
--   - Allows deep-dive drilldown from high-level trends to daily operational detail.
-- Why Separate:
--   - Preserves high-resolution data for root cause analysis and short-term tactical planning.
--   - Complements the monthly/quarterly/yearly aggregates in `mv_sales_product_time` for a full-spectrum analytics solution.

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

-- 9. Most Used Ingredients Time View
-- Tracks total quantity of each ingredient used by week, month, quarter, year.
-- Business Case: Supports demand planning, cost control, and supply chain optimization.
-- Power BI Usage: Ingredient trends, supplier forecasts, cost analysis visuals.
-- Why Separate: Ingredients are a cross-product dimension, often analyzed independently.

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

-- ============= CUSTOMER BEHAVIOR AND SEGMENTATION =============

-- 10. Avg Spend Per Customer Time View
-- Tracks each customer’s order frequency, spend, and average order value by month, quarter, year.
-- Business Case: Supports lifetime value (LTV) modeling, detects changing spend patterns, and identifies loyalty trends.
-- Power BI Usage: Time-series cohort, LTV analysis, retention dashboards.
-- Why Separate: Needed for customer-level time trend analysis.

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

-- 11. Customer Segmentation
-- SSegments customers by order count and spend, with assigned loyalty group.
-- Business Case: Identify, target, and retain key customer groups; enables loyalty marketing and churn analysis.
-- Power BI Usage: Segmentation visuals, customer pyramid, RFM dashboards.
-- Why Separate: Segmentation logic is unique and needed for marketing/CRM campaigns.

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

-- 12. Monthly New Customer Acquisition
-- Shows number of new customers acquired each month based on first purchase.
-- Business Case: Assess marketing and growth effectiveness, spot changes in acquisition trends.
-- Power BI Usage: New customer funnel, monthly acquisition KPI, marketing ROI.
-- Why Separate: Acquisition is a key metric separate from retention or repeat sales.

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

-- 13. Customer Churn Detection
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

-- 14. Customer Lifetime Value (LTV) View
-- Shows total value generated by each customer over their entire lifetime (all-time revenue, total orders, and average order value).
-- Business Case: Supports segmentation, resource allocation, VIP program, and marketing ROI calculation.
-- Power BI Usage: LTV dashboards, customer pyramid, loyalty analysis, and cohort visuals.
-- Why Separate: Needed for all-time summary (not time series); used for strategic decisions.

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
-- 14. Nearest Store by Customers
-- For each customer, shows the closest store based on geographic distance.
-- Business Case: Optimize delivery, marketing, and store siting; enables geo-based sales analytics.
-- Power BI Usage: Used for store catchment maps, delivery zones, customer-store flow maps.
-- Why Separate: Geospatial calculations are compute-heavy and best precomputed.

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

-- 15. Potential Customers and Market Penetration by Store (5km radius)
-- For each store, counts all customers within 5km for whom this is the nearest store, and computes % of local population served.
-- Business Case: Find areas with growth potential, optimize marketing, and support location strategy.
-- Power BI Usage: Store coverage maps, penetration dashboards, and market expansion analysis.
-- Why Separate: Enables unique spatial penetration insights not possible in regular sales data.

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

-- 16. Store-Customer Density (for Heatmap)
-- For each store, counts customers within 3km, 5km, and 10km. For direct use as a heatmap layer in Power BI.
-- Business Case: Visualize service reach, potential demand, and support location/expansion decisions.

CREATE OR REPLACE VIEW v_store_customer_density AS
SELECT
    s.storeid,
    s.latitude AS store_lat,
    s.longitude AS store_long,
    COUNT(CASE WHEN dist < 3 THEN c.id END) AS customer_3km,
    COUNT(CASE WHEN dist < 5 THEN c.id END) AS customer_5km,
    COUNT(CASE WHEN dist < 10 THEN c.id END) AS customer_10km
FROM stores s
CROSS JOIN customers c
CROSS APPLY (
    SELECT 6371 * 2 * ASIN(SQRT(
        POWER(SIN(((c.latitude - s.latitude) * 3.141592653589793 / 180) / 2), 2) +
        COS(s.latitude * 3.141592653589793 / 180) *
        COS(c.latitude * 3.141592653589793 / 180) *
        POWER(SIN(((c.longitude - s.longitude) * 3.141592653589793 / 180) / 2), 2)
    )) AS dist FROM dual
)
GROUP BY s.storeid, s.latitude, s.longitude;



-- ========== EXPLAIN PLAN (Index Check Example) ==========
-- This example demonstrates index usage for query optimization
EXPLAIN PLAN FOR
SELECT * FROM orders WHERE customerid = 'C848032';

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- ========== END OF SCRIPT ==========
COMMIT;


