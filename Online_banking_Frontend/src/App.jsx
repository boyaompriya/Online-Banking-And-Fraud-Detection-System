import "./App.css";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Transactions from "./components/Transactions";
import Transfer from "./components/Transfer";
import FraudAlerts from "./components/FraudAlerts";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/fraud-alerts" element={<FraudAlerts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;