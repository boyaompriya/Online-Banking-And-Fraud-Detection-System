import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function DebitMoney() {
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [balance, setBalance] = useState(0);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD ACCOUNT INFORMATION
  // =====================================================

  useEffect(() => {
    const savedBalance = localStorage.getItem("balance");
    const savedAccount = localStorage.getItem("account");

    if (savedBalance !== null) {
      setBalance(Number(savedBalance));
    }

    if (savedAccount) {
      try {
        const account = JSON.parse(savedAccount);

        if (account?.account_number) {
          setAccountNumber(account.account_number);
        }

        if (account?.ifsc_code) {
          setIfscCode(account.ifsc_code);
        }

      } catch (error) {
        console.error(
          "Unable to read saved account information:",
          error
        );
      }
    }
  }, []);

  // =====================================================
  // CLEAR MESSAGE
  // =====================================================

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // HANDLE DEBIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearMessage();

    const cleanAccountNumber =
      accountNumber.trim();

    const cleanIfscCode =
      ifscCode.trim().toUpperCase();

    const cleanAmount =
      amount.trim();

    const cleanDescription =
      description.trim() ||
      "Money Withdrawal";

    // =================================================
    // ACCOUNT NUMBER VALIDATION
    // =================================================

    if (!/^\d{10,18}$/.test(cleanAccountNumber)) {
      setMessage(
        "Please enter a valid account number (10-18 digits)."
      );

      setMessageType("error");
      return;
    }

    // =================================================
    // IFSC VALIDATION
    // =================================================

    if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
        cleanIfscCode
      )
    ) {
      setMessage(
        "Please enter a valid IFSC code, for example SBIN0001234."
      );

      setMessageType("error");
      return;
    }

    // =================================================
    // AMOUNT VALIDATION
    // =================================================

    const debitAmount =
      Number(cleanAmount);

    if (
      !cleanAmount ||
      isNaN(debitAmount) ||
      debitAmount <= 0
    ) {
      setMessage(
        "Please enter a valid amount."
      );

      setMessageType("error");
      return;
    }

    // =================================================
    // BALANCE VALIDATION
    // =================================================

    if (debitAmount > balance) {
      setMessage(
        "Insufficient balance for this debit transaction."
      );

      setMessageType("error");
      return;
    }

    // =================================================
    // START REQUEST
    // =================================================

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/transactions/debit/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            account_number:
              cleanAccountNumber,

            ifsc_code:
              cleanIfscCode,

            amount:
              cleanAmount,

            description:
              cleanDescription,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Debit response:",
        data
      );

      // =================================================
      // ERROR RESPONSE
      // =================================================

      if (!response.ok) {
        setMessage(
          data.error ||
            data.detail ||
            "Unable to debit money."
        );

        setMessageType("error");
        return;
      }

      // =================================================
      // UPDATE REAL BALANCE
      // =================================================

      if (
        data.account?.balance !==
        undefined
      ) {
        const newBalance =
          Number(data.account.balance);

        setBalance(newBalance);

        localStorage.setItem(
          "balance",
          String(data.account.balance)
        );
      } else {
        // Fallback if backend doesn't return balance
        const newBalance =
          balance - debitAmount;

        setBalance(newBalance);

        localStorage.setItem(
          "balance",
          String(newBalance)
        );
      }

      // =================================================
      // UPDATE ACCOUNT INFORMATION
      // =================================================

      if (data.account) {
        localStorage.setItem(
          "account",
          JSON.stringify(data.account)
        );

        if (data.account.id) {
          localStorage.setItem(
            "accountId",
            String(data.account.id)
          );
        }

        localStorage.setItem(
          "accountName",
          data.account.name || ""
        );

        localStorage.setItem(
          "accountEmail",
          data.account.email || ""
        );
      }

      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      setMessage(
        `₹${debitAmount.toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} debited successfully!`
      );

      setMessageType("success");

      // Clear amount and description
      setAmount("");
      setDescription("");

    } catch (error) {
      console.error(
        "Debit error:",
        error
      );

      setMessage(
        "Unable to connect to the Django server. Please make sure Django is running."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =================================================
          NAVBAR
          ================================================= */}

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

      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* =================================================
            HEADING
            ================================================= */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">
            Debit Money
          </h2>

          <p className="text-gray-500 mt-2">
            Withdraw money from your bank account securely.
          </p>

        </div>

        {/* =================================================
            BALANCE CARD
            ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Available Balance
              </p>

              <h3 className="text-3xl font-bold text-blue-700 mt-2">
                ₹
                {balance.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </h3>

            </div>

            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl">
              🏧
            </div>

          </div>

        </div>

        {/* =================================================
            DEBIT FORM
            ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-8">

          <form onSubmit={handleSubmit}>

            {/* ACCOUNT NUMBER */}

            <div className="mb-5">

              <label className="block text-gray-700 font-semibold mb-2">
                Account Number
              </label>

              <input
                type="text"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  );
                  clearMessage();
                }}
                placeholder="Enter account number"
                maxLength={18}
                inputMode="numeric"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <p className="text-xs text-gray-400 mt-1">
                Enter 10-18 digit account number.
              </p>

            </div>

            {/* IFSC */}

            <div className="mb-5">

              <label className="block text-gray-700 font-semibold mb-2">
                IFSC Code
              </label>

              <input
                type="text"
                value={ifscCode}
                onChange={(e) => {
                  setIfscCode(
                    e.target.value.toUpperCase()
                  );
                  clearMessage();
                }}
                placeholder="Example: SBIN0001234"
                maxLength={11}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <p className="text-xs text-gray-400 mt-1">
                Example: SBIN0001234
              </p>

            </div>

            {/* AMOUNT */}

            <div className="mb-5">

              <label className="block text-gray-700 font-semibold mb-2">
                Amount
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  ₹
                </span>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(
                      e.target.value
                    );
                    clearMessage();
                  }}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />

              </div>

              <p className="text-xs text-gray-400 mt-1">
                Available balance: ₹
                {balance.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </p>

            </div>

            {/* DESCRIPTION */}

            <div className="mb-6">

              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(
                    e.target.value
                  );
                  clearMessage();
                }}
                placeholder="Example: Money Withdrawal"
                rows={3}
                maxLength={255}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <p className="text-xs text-gray-400 mt-1">
                Optional
              </p>

            </div>

            {/* =================================================
                FRAUD DETECTION INFORMATION
                ================================================= */}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">

              <div className="flex items-start gap-3">

                <div className="text-2xl">
                  🛡️
                </div>

                <div>

                  <h4 className="font-bold text-blue-800">
                    Secure Debit
                  </h4>

                  <p className="text-sm text-blue-700 mt-1">
                    This transaction is monitored by
                    the fraud detection system for
                    suspicious activity.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                SUBMIT BUTTON
                ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing Debit..."
                : "Debit Money"}
            </button>

          </form>

          {/* =================================================
              MESSAGE
              ================================================= */}

          {message && (

            <div
              className={`mt-6 px-4 py-4 rounded-lg border ${
                messageType === "success"
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-red-100 border-red-300 text-red-700"
              }`}
            >

              <div className="flex items-start gap-3">

                <span className="text-xl">
                  {messageType === "success"
                    ? "✅"
                    : "⚠️"}
                </span>

                <p className="font-medium">
                  {message}
                </p>

              </div>

            </div>

          )}

        </div>

        {/* =================================================
            SECURITY MESSAGE
            ================================================= */}

        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">

          <div className="flex items-start gap-4">

            <div className="text-3xl">
              🔒
            </div>

            <div>

              <h3 className="font-bold text-green-800">
                Secure Banking
              </h3>

              <p className="text-green-700 text-sm mt-1">
                Your debit transaction is checked
                against your available balance and
                monitored by the fraud detection system.
              </p>

            </div>

          </div>

        </div>

        {/* BACK TO DASHBOARD */}

        <div className="mt-8 text-center">

          <Link
            to="/dashboard"
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to Dashboard
          </Link>

        </div>

      </main>

    </div>
  );
}

export default DebitMoney;