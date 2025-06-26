import React from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  header: {
    width: "100vw",
    background: "#faa28a",
    color: "#000000ff",
    padding: "24px 0",
    borderTopLeftRadius: "0px",
    borderTopRightRadius: "0px",
    borderBottomLeftRadius: "0px",
    borderBottomRightRadius: "0px",
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
  goodDay: {
    textAlign: "center",
    fontSize: "1.4rem",
    fontWeight: "bold",
    marginTop: "24px",
    marginBottom: "48px", // increased margin below greeting
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    margin: "0 auto 32px auto",
    maxWidth: "440px",
  },
  button: {
    background: "#f7d9afff",
    color: "#000000ff",
    border: "none",
    borderRadius: "50px", // fully round
    padding: "18px 0",
    width: "180px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "block",
  },
  button5Wrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",      // increased space above Button 5
    marginBottom: "48px",   // space below Button 5
  },
  logoutButton: {
    background: "#faa28a",
    color: "#000000ff",
    border: "none",
    borderRadius: "50px", // fully round
    padding: "12px 0",
    width: "200px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    margin: "0 auto",
    display: "block",
  },
};

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div>
      <div style={styles.header} className="login-header">
        Main Menu
      </div>
      <div style={styles.goodDay}>
        Good Day, Admin!
      </div>
      <div style={styles.buttonGrid}>
        <button style={styles.button} onClick={() => navigate("/product")}>Product</button>
        <button style={styles.button} onClick={() => navigate("/store")}>Store</button>
        <button style={styles.button} onClick={() => navigate("/customer")}>Customer</button>
        <button style={styles.button} onClick={() => navigate("/ingredients")}>Ingredients</button>

      </div>
      <div style={styles.button5Wrapper}>
        <button style={styles.button}>Button 5</button>
      </div>
      <button style={styles.logoutButton} onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

export default Dashboard;