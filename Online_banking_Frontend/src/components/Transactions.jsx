import React from "react";
import { Link } from "react-router-dom";

function Transactions() {
  const transactions = [
    {
      date: "25 Aug 2026",
      description: "Salary Credit",
      type: "Credit",
      amount: "+₹30,000",
      status: "Completed",
    },
    {
      date: "24 Aug 2026",
      description: "Amazon Payment",
      type: "Debit",
      amount: "-₹2,500",
      status: "Completed",
    },
    {
      date: "22 Aug 2026",
      description: "ATM Withdrawal",
      type: "Debit",
      amount: "-₹5,000",
      status: "Completed",
    },
    {
      date: "20 Aug 2026",
      description: "Electricity Bill",
      type: "Debit",
      amount: "-₹1,200",
      status: "Completed",
    },
    {
      date: "18 Aug 2026",
      description: "Money Received",
      type: "Credit",
      amount: "+₹8,000",
      status: "Completed",
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

        {/* Page Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Transactions
          </h2>

          <p className="text-gray-500 mt-2">
            View your recent account transactions.
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

          <p className="text-gray-500">
            Available Balance
          </p>

          <h2 className="text-3xl font-bold text-blue-700 mt-2">
            ₹50,000
          </h2>

        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-800">
              Recent Transactions
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
                    Description
                  </th>

                  <th className="text-left px-6 py-4 text-gray-600">
                    Type
                  </th>

                  <th className="text-left px-6 py-4 text-gray-600">
                    Amount
                  </th>

                  <th className="text-left px-6 py-4 text-gray-600">
                    Status
                  </th>
                </tr>

              </thead>

              <tbody>

                {transactions.map((transaction, index) => (

                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition"
                  >

                    <td className="px-6 py-4 text-gray-600">
                      {transaction.date}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {transaction.description}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={
                          transaction.type === "Credit"
                            ? "px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                            : "px-3 py-1 rounded-full text-sm bg-red-100 text-red-700"
                        }
                      >
                        {transaction.type}
                      </span>

                    </td>

                    <td
                      className={
                        transaction.type === "Credit"
                          ? "px-6 py-4 font-semibold text-green-600"
                          : "px-6 py-4 font-semibold text-red-600"
                      }
                    >
                      {transaction.amount}
                    </td>

                    <td className="px-6 py-4">

                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                        {transaction.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Transactions;