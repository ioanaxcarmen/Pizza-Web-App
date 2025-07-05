import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link for navigation buttons

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
        fontFamily: 'Inter, sans-serif', // Added font family for consistency
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
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", // Changed to responsive grid
        gap: "20px",
        margin: "0 auto 32px auto",
        maxWidth: "90%", // Adjusted max-width for better responsiveness
        justifyContent: "center",
        padding: "0 20px", // Added padding
        boxSizing: "border-box", // Ensure padding is included in width
    },
    button: {
        background: "#f7d9afff",
        color: "#000000ff",
        border: "none",
        borderRadius: "15px", // Adjusted border-radius for consistency with kpiCard
        padding: "18px 0",
        minWidth: "180px", // Changed width to min-width for responsiveness
        fontSize: "1.1rem",
        fontWeight: "bold",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        textAlign: "center",
        margin: "0 auto",
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)', // Added box-shadow
        transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Added transition
    },
    buttonHover: { // Added hover style
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.12)',
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
        marginTop: "32px", // Increased margin-top for separation
        marginBottom: "20px", // Added margin-bottom
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Added box-shadow
        transition: 'background-color 0.3s ease, transform 0.2s ease', // Added transition
    },
    backButtonHover: { // Added hover style
        backgroundColor: '#f88c70',
        transform: 'translateY(-2px)',
    },
};

const StoreMenupage = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.header}>Store Analytics Menu</div>
            <div style={styles.subheading}>Please select a Key Performance Indicator to view.</div>
            <div style={styles.buttonGrid}>
                {/* Store Performance Ranking */}
                <Link to="/store/performance-ranking" style={styles.button}>Store Performance Ranking</Link>
                {/* Average Order Value Per Store */}
                <Link to="/store/avg-order-value-by-store" style={styles.button}>Average Order Value Per Store</Link>
                {/* Store Customer Share */}
                <Link to="/store/store-share" style={styles.button}>Store Customer Share</Link>
                {/* Store KPI Radar */}
                <Link to="/store/kpi-radar" style={styles.button}>Store KPI Radar</Link>
                {/* Add more links for other store-related KPIs here */}
            </div>
            <button
                style={styles.backButton}
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default StoreMenupage;