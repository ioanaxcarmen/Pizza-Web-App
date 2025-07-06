import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import IngredientMenuPage from "./components/IngredientMenuPage";
import CustomerMenuPage from "./components/CustomerMenuPage";
import ChartPage from "./components/ChartPage";
import ProductMenuPage from "./components/ProductMenuPage"; 
import GeographicalReportMenuPage from "./components/GeographicalReportMenuPage";
import StoreMenupage from "./components/StoreMenupage";
//import CustomerHistoryPage from "./components/CustomerHistoryPage";
import ProductDistributionPieCharts from "./kpi-widgets/ProductDistributionPieCharts";
import IngredientsDashboard from "./kpi-widgets/IngredientsDashboard";
import ProductsDashboard from "./kpi-widgets/ProductsDashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />  
        <Route path="/store" element={<StoreMenupage />} />
        <Route path="/store/:kpiId" element={<ChartPage />} />
        {/* This path now shows the menu of customer KPIs */}
        <Route path="/customer" element={<CustomerMenuPage />} />
        {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/customer/:kpiId" element={<ChartPage />} />
        <Route path="/ingredients" element={<IngredientMenuPage />} />
        {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/ingredients/:kpiId" element={<ChartPage />} />
        {/* This path now shows the menu of customer KPIs */}
        <Route path="/product" element={<ProtectedRoute><ProductMenuPage /></ProtectedRoute>} />
        {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/product/:kpiId" element={<ProtectedRoute><ChartPage /></ProtectedRoute>} />
        <Route path="/product/distributionchart" element={<ProductDistributionPieCharts />} />
        <Route path="/ingredients/dashboard" element={<IngredientsDashboard />} />
        <Route path="/product/dashboard" element={<ProductsDashboard />} />
         {/* --- NEW GEOGRAPHICAL ROUTES --- */}
        <Route path="/geo-reports" element={<GeographicalReportMenuPage />} />
        <Route path="/geo/:kpiId" element={<ChartPage />} /> {/* Dynamic KPI charts for geographical reports */}
        {/* --- END NEW GEOGRAPHICAL ROUTES --- */}
      </Routes>
    </Router>
  );
}

export default App;