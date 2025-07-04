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
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    margin: "0 auto 32px auto",
    maxWidth: "440px",
    justifyContent: "center",
  },
  button: {
    background: "#f7d9afff",
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
    margin: "0 auto"
  },
  backButton: {
    background: "#faa28a", // <-- your requested color
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
    marginTop: "16px"
  }
};

const CustomerMenuPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>Product Menu</div>
      <div style={styles.subheading}>Please select a Key Performance Indicator to view.</div>
      <div style={styles.buttonGrid}>
        <Link to="/product/top-products" style={styles.button}>Top Selling Products</Link>
        <Link to="/product/cohortchart" style={styles.button}>Product Cohort Sales</Link>
        <Link to="/product/dashboard" style={styles.button}>Product Dashboard</Link> {/* Thêm button này */}
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

export default CustomerMenuPage;