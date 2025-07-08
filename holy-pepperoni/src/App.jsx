import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import IngredientMenuPage from "./components/IngredientMenuPage";
import ChartPage from "./components/ChartPage";
import ProductMenuPage from "./components/ProductMenuPage"; 
import GeographicalReportMenuPage from "./components/GeographicalReportMenuPage";
import StoreMenupage from "./components/StoreMenupage";
import CustomerHistoryPage from "./components/CustomerHistoryPage";
import ProductDistributionPieCharts from "./kpi-widgets/ProductDistributionPieCharts";
import IngredientsDashboard from "./kpi-widgets/IngredientsDashboard";
import ProductsDashboard from "./kpi-widgets/ProductsDashboard";
import OrdersDashboard from "./kpi-widgets/OrdersDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import SegmentDetailsPage from './components/SegmentDetailsPage'; 
import StoreDashboards from "./kpi-widgets/storeDashboards";
import GeoPowerBIChart from './kpi-widgets/GeoPowerBIChart';

/**
 * App component
 * Sets up all the main routes for the Pizza Web App using React Router.
 * Most dashboard and chart pages are protected and require authentication.
 * Dynamic routes are used for KPI charts and customer/segment details.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Login page (public) */}
        <Route path="/" element={<LoginPage />} />
        {/* Main dashboard (protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />  
        {/* Store menu and dashboards */}
        <Route path="/store" element={<StoreMenupage />} />
        <Route path="/store/:kpiId" element={<ChartPage />} />
        <Route path="/store/dashboard" element={<StoreDashboards />} />
        {/* Customer dashboard and dynamic KPI charts */}
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/:kpiId" element={<ChartPage />} />
        {/* Ingredients menu and dynamic KPI charts */}
        <Route path="/ingredients" element={<IngredientMenuPage />} />
        <Route path="/ingredients/:kpiId" element={<ChartPage />} />
        {/* Product dashboard and menu (protected) */}
        <Route path="/product" element={<ProtectedRoute><ProductMenuPage /></ProtectedRoute>} />
        <Route path="/product/:kpiId" element={<ProtectedRoute><ChartPage /></ProtectedRoute>} />
        <Route path="/product/top-products-since-launch" element={<ChartPage />} />
        {/* Product distribution chart */
        <Route path="/product/distributionchart" element={<ProductDistributionPieCharts />} />
        {/* Ingredients, products, and orders dashboards */
        <Route path="/ingredients/dashboard" element={<IngredientsDashboard />} />
        <Route path="/product/dashboard" element={<ProductsDashboard />} />
        <Route path="/orders/dashboard" element={<OrdersDashboard />} />
        {/* Geographical reports and dynamic KPI charts */}
        <Route path="/geo-reports" element={<GeographicalReportMenuPage />} />
        <Route path="/geo/:kpiId" element={<ChartPage />} /> {/* Dynamic KPI charts for geographical reports */}
        <Route path="/geo/powerbi-map2"
          element={
            <GeoPowerBIChart
              embedUrl="https://app.powerbi.com/reportEmbed?reportId=d2c9ef77-bd05-485f-aaa2-692e1dbf1bc6&autoAuth=true&ctid=66c5e13f-8c43-4359-b2e8-51775c6d298d"
              title="Geographical Power BI Report"
            />
          }
        />
        {/* Customer order history and segment details */
        <Route path="/customer/order-history/:customerId" element={<CustomerHistoryPage />} />
        <Route path="/customer/segment-details" element={<SegmentDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;