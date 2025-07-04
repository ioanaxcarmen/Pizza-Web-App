import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const styles = {
  header: {
    width: "100vw",
    background: "#faa28a",
    color: "#000000ff",
    padding: "24px 0",
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "32px",
    marginTop: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
    position: "relative",
    left: "50%",
    transform: "translateX(-50%)",
    maxWidth: "100vw",
  },
  container: {
    background: "#fff",
    minHeight: "100vh",
    padding: "0",
  },
  subheading: {
    textAlign: "center",
    fontSize: "1.4rem",
    fontWeight: "bold",
    marginTop: "24px",
    marginBottom: "48px",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", // Two columns for buttons
    gap: "20px",
    margin: "0 auto 32px auto",
    maxWidth: "440px", // Adjust grid width as needed
    justifyContent: "center",
  },
  button: {
    background: "#f7d9afff",
    color: "#000000ff",
    border: "none",
    borderRadius: "50px",
    padding: "18px 0",
    width: "180px", // Fixed width for buttons
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    textAlign: "center",
    margin: "0 auto", // Center buttons within their grid cell
  },
  backButton: {
    background: "#faa28a",
    color: "#000000ff",
    border: "none",
    borderRadius: "50px",
    padding: "18px 0",
    width: "180px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    textAlign: "center",
    margin: "0 auto",
    marginTop: "16px",
  }
};

const StoreMenuPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>Store Analytics</div>
      <div style={styles.subheading}>Explore key performance indicators for your stores.</div>
      <div style={styles.buttonGrid}>
        {/* Store Performance Ranking */}
        <Link to="/store/performance-ranking" style={styles.button}>Performance Ranking</Link>

        {/* Average Order Value */}
        <Link to="/store/avg-order-value-by-store" style={styles.button}>Average Order Value</Link>

        {/* Active Customers by Store */}
        <Link to="/store/active-customers" style={styles.button}>Active Customers</Link>

        {/* Customer Share by Store (already in backend, but will be filtered by store now) */}
        {/* NOTE: Your existing /api/kpi/customer-share-by-store endpoint already calculates this,
                  but for a store-centric view, you might want a page specifically for it. */}
        <Link to="/store/customer-share" style={styles.button}>Customer Share</Link>

        {/* Revenue per Active Customer */}
        <Link to="/store/revenue-per-customer" style={styles.button}>Revenue per Customer</Link>





        {/* Ingredients Consumed (already exists, but might want to be filtered by store) */}
        <Link to="/store/ingredients-consumed" style={styles.button}>Ingredient Consumption</Link>
      </div>
      <button
        style={styles.backButton}
        onClick={() => navigate("/dashboard")}
      >
        Back to Main Menu
      </button>
    </div>
  );
};

export default StoreMenuPage;