import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Product from "./components/Products";
import Store from "./components/Store";
// import Customer from "./components/Customer"; // We are replacing this
import Ingredients from "./components/Ingredients";

// --- Import your new page components ---
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
        
        {/* === UPDATED CUSTOMER ROUTES START HERE === */}

        {/* This path now shows the menu of customer KPIs */}
        <Route path="/customer" element={<CustomerMenuPage />} />

        {/* This new dynamic path shows the specific chart the user selects */}
        <Route path="/customer/:kpiId" element={<ChartPage />} />
        
        {/* === UPDATED CUSTOMER ROUTES END HERE === */}

        <Route path="/ingredients" element={<Ingredients />} />
      </Routes>
    </Router>
  );
}

export default App;