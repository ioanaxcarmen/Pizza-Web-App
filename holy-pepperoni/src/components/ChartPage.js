import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopCustomersChart from '../kpi-widgets/TopCustomersChart';
import StoreCustomerShareChart from '../kpi-widgets/StoreCustomerShareChart';
import IngredientsConsumeOverTimeChart from '../kpi-widgets/IngredientsConsumeOverTimeChart';
import TopIngredientsChart from '../kpi-widgets/TopIngredientsChart';
import StoreKPIRadarChart from '../kpi-widgets/StoreKPIRadarChart';
import ProductCohortSalesLineChart from '../kpi-widgets/ProductCohortSalesLineChart';
import CustomerOrderFrequencyChart from '../kpi-widgets/CustomerOrderFrequencyChart';
import AverageSpendLineChart from '../kpi-widgets/AverageSpendLineChart';
import TopSellingProductsChart from '../kpi-widgets/TopSellingProductsChart';
import ProductDistributionPieCharts from '../kpi-widgets/ProductDistributionPieCharts';
import StoreComparisonGroupedBarChart from '../kpi-widgets/StoreComparisonGroupedBarChart';
import StorePerformanceRankingChart from '../kpi-widgets/StorePerformanceRankingChart';
import AverageOrderValuePerStoreChart from '../kpi-widgets/AverageOrderValuePerStoreChart';
import StoreDistanceMap from '../kpi-widgets/StoreDistanceMap';
import TopCustomervsStoreGeoChart from '../kpi-widgets/TopCustomervsStoreGeoChart';
import ChurnRiskTable from '../kpi-widgets/ChurnRiskTable'; 


// Placeholder for other KPIs
const PlaceholderChart = ({ kpiName }) => (
    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '12px', background: '#fff' }}>
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

    let chartComponent = null;
    let pageTitle = "";
    let backPath = "/dashboard"; // default

    // Determine which chart, title, and back path to use
    if (window.location.pathname.startsWith("/customer")) {
        backPath = "/customer";
        switch (kpiId) {
            case 'top-10':
                chartComponent = <TopCustomersChart />;
                pageTitle = "Top 10 Customers by Lifetime Spend";
                break;
            case 'store-share':
                chartComponent = <StoreCustomerShareChart />;
                pageTitle = "Customer Share by Store";
                break;
            case 'order-frequency':
                chartComponent = <CustomerOrderFrequencyChart />;
                pageTitle = "Customer Order Frequency";
                break;
            case 'avg-spend':
                chartComponent = <AverageSpendLineChart />;
                pageTitle = "Average Spend Over Time";
                break;
            case 'churn-risk': 
                chartComponent = <ChurnRiskTable />;
                pageTitle = "Customers at Risk of Churn";
                break;
            default:
                chartComponent = <div>KPI not found. Please go back.</div>;
                pageTitle = "KPI Not Found";
        }
    }
    else if (window.location.pathname.startsWith("/ingredients")) {
        backPath = "/ingredients";
        switch (kpiId) {
            case 'consumed-over-time':
                chartComponent = <IngredientsConsumeOverTimeChart />;
                pageTitle = "Ingredients Consumed Over Time";
                break;
            case 'top-ingredients':
                chartComponent = <TopIngredientsChart kpiName="Top Ingredients" />;
                pageTitle = "Top Ingredients";
                break;
            case 'cost-trends':
                chartComponent = <PlaceholderChart kpiName="Ingredient Cost Trends" />;
                pageTitle = "Ingredient Cost Trends";
                break;
            default:
                chartComponent = <div>KPI not found. Please go back.</div>;
                pageTitle = "KPI Not Found";
        }
    } else if (window.location.pathname.startsWith("/product")) {
        backPath = "/product";
        switch (kpiId) {
            case 'top-products':
                chartComponent = <TopSellingProductsChart />;
                pageTitle = "Top Selling Products";
                break;
            case 'cohortchart':
                chartComponent = <ProductCohortSalesLineChart />;
                pageTitle = "Product Cohort Sales Over Time";
                break;
            case 'distributionchart':
                chartComponent = <ProductDistributionPieCharts />;
                pageTitle = "Product Sales Distribution";
                break;
            default:
                chartComponent = <div>KPI not found. Please go back.</div>;
                pageTitle = "KPI Not Found";
        }
    } else if (window.location.pathname.startsWith("/store")) {
        backPath = "/store"; // Set back path to your Store Menu Page
        switch (kpiId) {
            case 'kpi-radar':
                chartComponent = <StoreKPIRadarChart />;
                pageTitle = "Store KPIs Radar";
                break;
            case 'comparison-bar':
                chartComponent = <StoreComparisonGroupedBarChart />;
                pageTitle = "Store Comparison Grouped Bar";
                break;
            // ADD THIS NEW CASE FOR STORE PERFORMANCE RANKING
            case 'performance-ranking':
                chartComponent = <StorePerformanceRankingChart />;
                pageTitle = "Store Performance Ranking";
                break;
            case 'avg-order-value-by-store':
                chartComponent = <AverageOrderValuePerStoreChart />;
                pageTitle = "Average Order Value by Store";
                break;
            case 'store-share':
                chartComponent = <StoreCustomerShareChart />;
                pageTitle = "Store Customer Share";
           /* case 'store-distance-map':
                chartComponent = <StoreDistanceMap />;
                pageTitle = "Distance Between Top Customer Stores";
                break;



            default:
                chartComponent = <div>KPI not found. Please go back.</div>;
                pageTitle = "KPI Not Found"; 
        }*/
        }

    } else if (window.location.pathname.startsWith("/geo")) {
        backPath = "/geo-reports"; // Back button goes to the new geographical menu
        switch (kpiId) {
            case 'store-distance-map':
                chartComponent = <StoreDistanceMap />;
                pageTitle = "Distance Between Top Customer Stores";
                break;
            case 'top-customer-store-geo':
                chartComponent = <TopCustomervsStoreGeoChart />;
                pageTitle = "Top Customer Stores (Geographical)";
                break;
            // Add more geographical charts here
            default:
                chartComponent = <div>KPI not found. Please go back.</div>;
                pageTitle = "KPI Not Found";
            }
        }
        return (
            <div style={styles.container}>
                <div style={styles.header}>{pageTitle}</div>
                <div style={styles.chartArea}>
                    <div style={{ width: "100%", padding: '20px', boxSizing: 'border-box' }}>
                        {chartComponent}
                    </div>
                    <div style={{ height: 40 }} />
                    <button
                        style={styles.backButton}
                        onClick={() => navigate(backPath)}
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    }

    export default ChartPage;
/*else if (window.location.pathname.startsWith("/store")) {
       backPath = "/store";
       switch (kpiId) {
           case 'kpi-radar':
               chartComponent = <StoreKPIRadarChart />;
               pageTitle = "Store KPIs Radar";
               break;
           case 'comparison-bar':
               chartComponent = <StoreComparisonGroupedBarChart />;
               pageTitle = "Store Comparison Grouped Bar";
               break;
           default:
               chartComponent = <div>KPI not found. Please go back.</div>;
               pageTitle = "KPI Not Found";
       } 
     

   return (
       <div style={styles.container}>
           <div style={styles.header}>{pageTitle}</div>
           <div style={styles.chartArea}>
               <div style={{ width: "100%", padding: '20px', boxSizing: 'border-box' }}>
                   {chartComponent}
               </div>
               <div style={{ height: 40 }} />
               <button
                   style={styles.backButton}
                   onClick={() => navigate(backPath)}
               >
                   Back
               </button>
           </div>
       </div>
   );
};

export default ChartPage; */
