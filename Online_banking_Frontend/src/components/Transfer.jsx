import React, { useState } from "react";
import { Link } from "react-router-dom";

function Transfer() {
  const [formData, setFormData] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    amount: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear previous message when user edits the form
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const transferAmount = Number(formData.amount);

    // Get current balance
    const currentBalance = Number(
      localStorage.getItem("balance") || 50000
    );

    // -----------------------------
    // Validation
    // -----------------------------

    // Account number match
    if (
      formData.accountNumber !==
      formData.confirmAccountNumber
    ) {
      setMessage("Account numbers do not match.");
      setMessageType("error");
      return;
    }

    // Account number validation
    if (!/^\d{10,18}$/.test(formData.accountNumber)) {
      setMessage(
        "Please enter a valid account number (10-18 digits)."
      );
      setMessageType("error");
      return;
    }

    // IFSC validation
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
      setMessage(
        "Please enter a valid IFSC code, for example SBIN0001234."
      );
      setMessageType("error");
      return;
    }

    // Amount validation
    if (!transferAmount || transferAmount <= 0) {
      setMessage("Please enter a valid amount.");
      setMessageType("error");
      return;
    }

    // Balance validation
    if (transferAmount > currentBalance) {
      setMessage(
        `Insufficient balance. Available balance is ₹${currentBalance.toLocaleString(
          "en-IN"
        )}.`
      );
      setMessageType("error");
      return;
    }

    // -----------------------------
    // Calculate new balance
    // -----------------------------

    const newBalance = currentBalance - transferAmount;

    // Save new balance
    localStorage.setItem(
      "balance",
      newBalance.toString()
    );

    // -----------------------------
    // Save transaction
    // -----------------------------

    const oldTransactions = JSON.parse(
      localStorage.getItem("transactions") || "[]"
    );

    const today = new Date();

    const formattedDate = today.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

    const newTransaction = {
      date: formattedDate,
      description:
        formData.description.trim() ||
        "Money Transfer",
      type: "Debit",
      amount: transferAmount,
      status: "Completed",
    };

    const updatedTransactions = [
      newTransaction,
      ...oldTransactions,
    ];

    localStorage.setItem(
      "transactions",
      JSON.stringify(updatedTransactions)
    );

    // -----------------------------
    // Success message
    // -----------------------------

    setMessage(
      `₹${transferAmount.toLocaleString(
        "en-IN"
      )} transferred successfully!`
    );

    setMessageType("success");

    // Clear form
    setFormData({
      accountNumber: "",
      confirmAccountNumber: "",
      ifsc: "",
      amount: "",
      description: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo / Title */}
          <div>
            <h1 className="text-2xl font-bold">
              Online Banking
            </h1>

            <p className="text-blue-200 text-sm">
              Fraud Detection System
            </p>
          </div>

          {/* Dashboard Button */}
          <Link
            to="/dashboard"
            className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Dashboard
          </Link>

        </div>

      </nav>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Page Heading */}
        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">
            Transfer Money
          </h2>

          <p className="text-gray-500 mt-2">
            Transfer money securely to another bank account.
          </p>

        </div>

        {/* Transfer Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">

          <form onSubmit={handleSubmit}>

            {/* Account Number */}
            <div className="mb-5">

              <label className="block text-gray-700 font-semibold mb-2">
                Account Number
              </label>

              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                required
                maxLength="18"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Confirm Account */}
            <div className="mb-5">

              <label className="block text-gray-700 font-semibold mb-2">
                Confirm Account Number
              </label>

              <input
                type="text"
                name="confirmAccountNumber"
                value={formData.confirmAccountNumber}
                onChange={handleChange}
                placeholder="Re-enter account number"
                required
                maxLength="18"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* IFSC */}
            <div className="mb-5">

              <label className="block text-gray-700 font-semibold mb-2">
                IFSC Code
              </label>

              <input
                type="text"
                name="ifsc"
                value={formData.ifsc}
                onChange={handleChange}
                placeholder="Example: SBIN0001234"
                required
                maxLength="11"
                onChangeCapture={(e) => {
                  e.target.value =
                    e.target.value.toUpperCase();
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Amount */}
            <div className="mb-5">

              <label className="block text-gray-700 font-semibold mb-2">
                Amount
              </label>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Description */}
            <div className="mb-6">

              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter transfer description"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Transfer Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Transfer Money
            </button>

          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 px-4 py-3 rounded-lg border ${
                messageType === "success"
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-red-100 border-red-300 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Transfer;