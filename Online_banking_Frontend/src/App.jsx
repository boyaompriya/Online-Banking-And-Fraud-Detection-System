import "./App.css";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Transactions from "./components/Transactions.jsx";
import Transfer from "./components/Transfer.jsx";
import CreditMoney from "./components/CreditMoney.jsx";
import DebitMoney from "./components/DebitMoney.jsx";
import FraudAlerts from "./components/FraudAlerts.jsx";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Transactions */}
        <Route
          path="/transactions"
          element={<Transactions />}
        />

        {/* Transfer Money */}
        <Route
          path="/transfer"
          element={<Transfer />}
        />

        {/* Credit Money */}
        <Route
          path="/credit-money"
          element={<CreditMoney />}
        />

        {/* Debit Money */}
        <Route
          path="/debit-money"
          element={<DebitMoney />}
        />

        {/* Fraud Alerts */}
        <Route
          path="/fraud-alerts"
          element={<FraudAlerts />}
        />

        {/* Invalid URL → Login */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;