import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard"; // You'll create this
import ProtectedRoute from "./components/ProtectedRoute"; // Next step
import Product from "./components/Products";
import Store from "./components/Store";
import Customer from "./components/Customer";
import Ingredients from "./components/Ingredients";

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
        <Route path="/customer" element={<Customer />} />
        <Route path="/ingredients" element={<Ingredients />} />
      </Routes>
    </Router>
  );
}

export default App;