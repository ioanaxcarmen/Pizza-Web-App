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
        fontFamily: 'Inter, sans-serif',
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
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        margin: "0 auto 32px auto",
        maxWidth: "90%",
        justifyContent: "center",
        padding: "0 20px",
        boxSizing: "border-box",
    },
    button: {
        background: "#f7d9afff",
        color: "#000000ff",
        border: "none",
        borderRadius: "15px",
        padding: "18px 0",
        minWidth: "180px",
        fontSize: "1.1rem",
        fontWeight: "bold",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        textAlign: "center",
        margin: "0 auto",
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
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
        marginTop: "32px",
        marginBottom: "20px",
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
    },
};

const GeographicalReportsMenuPage = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.header}>Geographical Reports Menu</div>
            <div style={styles.subheading}>Explore location-based insights.</div>
            <div style={styles.buttonGrid}>
                {/* Link to Distance Between Top Stores map */}
                <Link to="/geo/store-distance-map" style={styles.button}>Distance Between Top Stores</Link>
                {/* Link to Top Customer Stores (Map) */}
                <Link to="/geo/top-customer-store-geo" style={styles.button}>Top Customer Stores (Map)</Link>
                {/* Add more geographical report links here as needed */}
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

export default GeographicalReportsMenuPage;