import React from 'react';
import { useNavigate } from 'react-router-dom';
import IframeViewer from '../components/iFrameViewer';

const styles = {
    header: {
        width: "100vw",
        background: "#faa28a",
        color: "#000000ff",
        padding: "24px 0",
        fontSize: "2.5rem",
        fontWeight: "bold",
        marginBottom: "12px",
        marginTop: "30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        textAlign: "center",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "100vw",
    },
    container: {
        background: "#faf7f0",
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
        margin: "8px auto 8 auto"
    
    }
};
// Renders a full-page Power BI report with header and navigation
const GeoPowerBIChart = ({ embedUrl, title }) => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.header}>{title}</div>
            <div style={styles.chartArea}>
                <div style={{ width: "100%", padding: '10px', boxSizing: 'border-box' }}>
                    {/* Embed Power BI report using IframeViewer component */}
                    <IframeViewer embedUrl={embedUrl} title={title} />
                </div>
                <button
                    style={styles.backButton}
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default GeoPowerBIChart;