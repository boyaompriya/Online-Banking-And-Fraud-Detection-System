import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Transactions() {
  // Initial balance
  const initialBalance = 50000;

  // Existing transactions
  const defaultTransactions = [
    {
      date: "25 Aug 2026",
      description: "Salary Credit",
      type: "Credit",
      amount: 30000,
      status: "Completed",
    },
    {
      date: "24 Aug 2026",
      description: "Amazon Payment",
      type: "Debit",
      amount: 2500,
      status: "Completed",
    },
    {
      date: "22 Aug 2026",
      description: "ATM Withdrawal",
      type: "Debit",
      amount: 5000,
      status: "Completed",
    },
    {
      date: "20 Aug 2026",
      description: "Electricity Bill",
      type: "Debit",
      amount: 1200,
      status: "Completed",
    },
    {
      date: "18 Aug 2026",
      description: "Money Received",
      type: "Credit",
      amount: 8000,
      status: "Completed",
    },
  ];

  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState(defaultTransactions);

  // Load balance and transactions from localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem("balance");

    if (savedBalance !== null) {
      setBalance(Number(savedBalance));
    } else {
      localStorage.setItem("balance", initialBalance.toString());
      setBalance(initialBalance);
    }

    const savedTransactions = localStorage.getItem("transactions");

    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        setTransactions(parsedTransactions);
      } catch (error) {
        console.error("Error reading transactions:", error);
        setTransactions(defaultTransactions);
      }
    } else {
      localStorage.setItem(
        "transactions",
        JSON.stringify(defaultTransactions)
      );

      setTransactions(defaultTransactions);
    }
  }, []);

  // Format amount
  const formatAmount = (amount, type) => {
    const formattedAmount = Number(amount).toLocaleString("en-IN");

    if (type === "Credit") {
      return `+₹${formattedAmount}`;
    }

    return `-₹${formattedAmount}`;
  };

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
            ₹{balance.toLocaleString("en-IN")}
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

              {/* Table Header */}
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

              {/* Table Body */}
              <tbody>

                {transactions.length > 0 ? (

                  transactions.map((transaction, index) => (

                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50 transition"
                    >

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-600">
                        {transaction.date}
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {transaction.description}
                      </td>

                      {/* Type */}
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

                      {/* Amount */}
                      <td
                        className={
                          transaction.type === "Credit"
                            ? "px-6 py-4 font-semibold text-green-600"
                            : "px-6 py-4 font-semibold text-red-600"
                        }
                      >
                        {formatAmount(
                          transaction.amount,
                          transaction.type
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">

                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                          {transaction.status}
                        </span>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center py-8 text-gray-500"
                    >
                      No transactions found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Transactions;
