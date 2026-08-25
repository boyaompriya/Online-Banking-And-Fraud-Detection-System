import React from "react";
import { Link } from "react-router-dom";

function FraudAlerts() {
  const alerts = [
    {
      date: "25 Aug 2026",
      description: "Large amount transaction detected",
      amount: "₹25,000",
      risk: "High",
      status: "Under Review",
    },
    {
      date: "24 Aug 2026",
      description: "Transaction from unknown location",
      amount: "₹8,500",
      risk: "Medium",
      status: "Monitoring",
    },
    {
      date: "22 Aug 2026",
      description: "Multiple transactions within short time",
      amount: "₹15,000",
      risk: "Medium",
      status: "Monitoring",
    },
    {
      date: "20 Aug 2026",
      description: "Suspicious login attempt detected",
      amount: "-",
      risk: "High",
      status: "Blocked",
    },
  ];

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
            to="/dashboard"
            className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Dashboard
          </Link>

        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Fraud Alerts
          </h2>

          <p className="text-gray-500 mt-2">
            Monitor suspicious activities detected in your account.
          </p>
        </div>

        {/* Security Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Total Alerts
            </p>

            <h3 className="text-3xl font-bold text-gray-800 mt-2">
              4
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              High Risk
            </p>

            <h3 className="text-3xl font-bold text-red-600 mt-2">
              2
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Account Status
            </p>

            <h3 className="text-3xl font-bold text-green-600 mt-2">
              Secure
            </h3>
          </div>

        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-800">
              Recent Fraud Alerts
            </h3>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>
                  <th className="text-left px-6 py-4 text-gray-600">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 text-gray-600">
                    Activity
                  </th>

                  <th className="text-left px-6 py-4 text-gray-600">
                    Amount
                  </th>

                  <th className="text-left px-6 py-4 text-gray-600">
                    Risk Level
                  </th>

                  <th className="text-left px-6 py-4 text-gray-600">
                    Status
                  </th>
                </tr>

              </thead>

              <tbody>

                {alerts.map((alert, index) => (

                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition"
                  >

                    <td className="px-6 py-4 text-gray-600">
                      {alert.date}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {alert.description}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {alert.amount}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={
                          alert.risk === "High"
                            ? "px-3 py-1 rounded-full text-sm bg-red-100 text-red-700"
                            : "px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700"
                        }
                      >
                        {alert.risk}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                        {alert.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* Security Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">

          <div className="flex items-center gap-4">

            <div className="text-3xl">
              🛡️
            </div>

            <div>
              <h3 className="font-bold text-green-800">
                Fraud Detection Active
              </h3>

              <p className="text-green-700 text-sm mt-1">
                Your transactions are continuously monitored
                for suspicious activity.
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default FraudAlerts;