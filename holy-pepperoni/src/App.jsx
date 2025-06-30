import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Product from "./components/Products";
import Store from "./components/Store";
import IngredientMenuPage from "./components/IngredientMenuPage";
import CustomerMenuPage from "./components/CustomerMenuPage";
import ChartPage from "./components/ChartPage";

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
        <Route path="/store" element={<Store />} />
      

        {/* This path now shows the menu of customer KPIs */}
        <Route path="/customer" element={<CustomerMenuPage />} />

        {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/customer/:kpiId" element={<ChartPage />} />
        

        <Route path="/ingredients" element={<IngredientMenuPage />} />

         {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/ingredients/:kpiId" element={<ChartPage />} />
      </Routes>
    </Router>
  );
}

export default App;