import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Product from "./components/ProductMenuPage";
import IngredientMenuPage from "./components/IngredientMenuPage";
import CustomerMenuPage from "./components/CustomerMenuPage";
import ChartPage from "./components/ChartPage";

import StoreMenuPage from "./components/StoreMenupage";


import CustomerHistoryPage from "./components/CustomerHistoryPage";
import ProductDistributionPieCharts from "./kpi-widgets/ProductDistributionPieCharts";
import IngredientsDashboard from "./kpi-widgets/IngredientsDashboard";


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
        <Route path="/product" element={<Product />} />
        <Route path="/store" element={<StoreMenuPage />} />
         {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/store/:kpiId" element={<ChartPage />} />
      

        {/* This path now shows the menu of customer KPIs */}
        <Route path="/customer" element={<CustomerMenuPage />} />

        {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/customer/:kpiId" element={<ChartPage />} />
        

        <Route path="/ingredients" element={<IngredientMenuPage />} />

         {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/ingredients/:kpiId" element={<ChartPage />} />


        {/* This path now shows the menu of customer KPIs */}
        <Route path="/product" element={<ProductMenuPage />} />

        {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/product/:kpiId" element={<ChartPage />} />

        <Route path="/product/distributionchart" element={<ProductDistributionPieCharts />} />
        <Route path="/ingredients/dashboard" element={<IngredientsDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;