import React, { useState } from "react";
import { Link } from "react-router-dom";

function CreditMoney() {
  const [formData, setFormData] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    amount: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    let value = e.target.value;

    if (e.target.name === "ifsc") {
      value = value.toUpperCase();
    }

    setFormData({
      ...formData,
      [e.target.name]: value,
    });

    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    const accountNumber = formData.accountNumber.trim();

    const confirmAccountNumber =
      formData.confirmAccountNumber.trim();

    const ifsc = formData.ifsc.trim().toUpperCase();

    const amount = formData.amount.trim();

    // Standard description for all credit transactions
    const description = "Money Deposit";

    // Account number confirmation
    if (accountNumber !== confirmAccountNumber) {
      setMessage("Account numbers do not match.");
      setMessageType("error");
      return;
    }

    // Account number validation
    if (!/^\d{10,18}$/.test(accountNumber)) {
      setMessage(
        "Please enter a valid account number (10-18 digits)."
      );
      setMessageType("error");
      return;
    }

    // IFSC validation
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      setMessage(
        "Please enter a valid IFSC code, for example SBIN0001234."
      );
      setMessageType("error");
      return;
    }

    // Amount validation
    const creditAmount = Number(amount);

    if (
      !amount ||
      isNaN(creditAmount) ||
      creditAmount <= 0
    ) {
      setMessage("Please enter a valid amount.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/transactions/credit/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account_number: accountNumber,
            ifsc_code: ifsc,
            amount: amount,
            description: description,
          }),
        }
      );

      const data = await response.json();

      console.log("Credit response:", data);

      if (!response.ok) {
        setMessage(
          data.error ||
            data.detail ||
            "Unable to credit money."
        );

        setMessageType("error");
        return;
      }

      // Update balance
      if (data.account?.balance !== undefined) {
        localStorage.setItem(
          "balance",
          String(data.account.balance)
        );
      }

      // Update account information
      if (data.account) {
        localStorage.setItem(
          "account",
          JSON.stringify(data.account)
        );

        localStorage.setItem(
          "accountId",
          String(data.account.id)
        );

        localStorage.setItem(
          "accountName",
          data.account.name || ""
        );

        localStorage.setItem(
          "accountEmail",
          data.account.email || ""
        );
      }

      // Success message
      setMessage(
        `₹${creditAmount.toLocaleString(
          "en-IN"
        )} credited successfully!`
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

    } catch (error) {
      console.error("Credit error:", error);

      setMessage(
        "Unable to connect to the Django server. Please make sure Django is running."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
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
      <main className="max-w-3xl mx-auto px-6 py-10">

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">
            Credit Money
          </h2>

          <p className="text-gray-500 mt-2">
            Add money securely to your bank account.
          </p>

        </div>

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
                maxLength={18}
                inputMode="numeric"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Confirm Account Number */}
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
                maxLength={18}
                inputMode="numeric"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* IFSC Code */}
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
                maxLength={11}
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
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Description */}
            <div className="mb-6">

              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>

              <input
                type="text"
                value="Money Deposit"
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />

              <p className="text-sm text-gray-500 mt-2">
                Credit transactions are recorded as Money Deposit.
              </p>

            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading
                ? "Processing Credit..."
                : "Credit Money"}
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

export default CreditMoney;