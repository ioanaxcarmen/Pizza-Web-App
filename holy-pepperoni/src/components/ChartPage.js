import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TopCustomersChart from '../kpi-widgets/TopCustomersChart';

// Placeholder for other KPIs
const PlaceholderChart = ({ kpiName }) => (
    <div style={{border: '1px solid #ddd', padding: '20px', borderRadius: '12px', background: '#fff'}}>
        <h2>Chart for "{kpiName}"</h2>
        <p>The real chart component will go here.</p>
    </div>
);

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
        position: "relative"
    },
    chartArea: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box"
    },
    backButton: {
        background: "#faa28a",
        color: "#000000ff",
        border: "none",
        borderRadius: "50px",
        padding: "12px 0",
        width: "160px",
        fontSize: "1rem",
        fontWeight: "bold",
        display: "block",
        cursor: "pointer",
        textDecoration: "none",
        textAlign: "center",
        margin: "64px auto 0 auto" 
    }
};

const ChartPage = () => {
    const { kpiId } = useParams();
    const navigate = useNavigate();

    const renderChart = () => {
        switch (kpiId) {
            case 'top-10':
                return <TopCustomersChart />;
            case 'frequency':
                return <PlaceholderChart kpiName="Customer Order Frequency" />;
            case 'avg-spend':
                return <PlaceholderChart kpiName="Average Spend Over Time" />;
            default:
                return <div>KPI not found. Please go back.</div>;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>Top 10 Customers by Lifetime Spend</div>
            <div style={styles.chartArea}>
                <div style={{ width: "100%", padding: '20px', boxSizing: 'border-box' }}>
                    {renderChart()}
                </div>
                <div style={{ height: 40 }} /> {/* Spacer to push button lower */}
                <button
                    style={styles.backButton}
                    onClick={() => navigate("/customer")}
                >
                    Back
                </button>
            </div>
        </div>
    );
};

export default ChartPage;