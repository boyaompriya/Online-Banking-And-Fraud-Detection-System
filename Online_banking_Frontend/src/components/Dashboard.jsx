import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [balance, setBalance] = useState(50000);

  // Load balance from localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem("balance");

    if (savedBalance !== null) {
      setBalance(Number(savedBalance));
    } else {
      localStorage.setItem("balance", "50000");
      setBalance(50000);
    }

    // Update balance if it changes in another tab/page
    const handleStorageChange = () => {
      const updatedBalance = localStorage.getItem("balance");

      if (updatedBalance !== null) {
        setBalance(Number(updatedBalance));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Online Banking
            </h1>

            <p className="text-blue-200 text-sm">
              Fraud Detection System
            </p>
          </div>

          <Link
            to="/login"
            className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Logout
          </Link>

        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">
            Welcome to your Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            Manage your account, transactions and fraud alerts securely.
          </p>

        </div>

        {/* Account Overview */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Account Overview
          </h3>

          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">

            <p className="text-blue-200 text-sm">
              Available Balance
            </p>

            {/* Dynamic Balance */}
            <h2 className="text-4xl font-bold mt-2">
              ₹{balance.toLocaleString("en-IN")}
            </h2>

            <p className="text-blue-200 mt-3">
              Savings Account
            </p>

          </div>
        </div>

        {/* Quick Actions */}
        <div>

          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Transactions */}
            <Link
              to="/transactions"
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-2xl mb-4">
                💳
              </div>

              <h4 className="text-lg font-bold text-gray-800">
                Transactions
              </h4>

              <p className="text-gray-500 mt-2">
                View your recent banking transactions.
              </p>

              <span className="text-blue-600 font-semibold mt-4 inline-block">
                View Transactions →
              </span>

            </Link>

            {/* Transfer */}
            <Link
              to="/transfer"
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center text-2xl mb-4">
                💸
              </div>

              <h4 className="text-lg font-bold text-gray-800">
                Transfer Money
              </h4>

              <p className="text-gray-500 mt-2">
                Send money securely to another account.
              </p>

              <span className="text-green-600 font-semibold mt-4 inline-block">
                Make Transfer →
              </span>

            </Link>

            {/* Fraud Alerts */}
            <Link
              to="/fraud-alerts"
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-red-100 text-red-700 rounded-xl flex items-center justify-center text-2xl mb-4">
                🛡️
              </div>

              <h4 className="text-lg font-bold text-gray-800">
                Fraud Alerts
              </h4>

              <p className="text-gray-500 mt-2">
                Monitor suspicious transactions and security alerts.
              </p>

              <span className="text-red-600 font-semibold mt-4 inline-block">
                View Alerts →
              </span>

            </Link>

          </div>
        </div>

        {/* Security Section */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">

          <div className="flex items-center gap-4">

            <div className="text-3xl">
              🔒
            </div>

            <div>

              <h3 className="font-bold text-green-800">
                Your account is secure
              </h3>

              <p className="text-green-700 text-sm mt-1">
                Our fraud detection system continuously monitors
                your transactions for suspicious activity.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;