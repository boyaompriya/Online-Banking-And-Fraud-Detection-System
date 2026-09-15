import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Transactions() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  // =====================================================
  // FETCH TRANSACTIONS FROM DJANGO
  // =====================================================

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const accountId = localStorage.getItem("accountId");

      if (!accountId) {
        setError(
          "Account information not found. Please login again."
        );
        setLoading(false);
        return;
      }

      console.log(
        "Fetching transactions for account:",
        accountId
      );

      const response = await fetch(
        `http://localhost:8000/api/transactions/account/${accountId}/`
      );

      const data = await response.json();

      console.log(
        "Django transactions response:",
        data
      );

      if (!response.ok) {
        setError(
          data.error ||
            data.detail ||
            "Unable to load transactions."
        );

        setLoading(false);
        return;
      }

      // =================================================
      // ACCOUNT INFORMATION
      // =================================================

      if (data.account) {
        setAccount(data.account);

        if (data.account.balance !== undefined) {
          const currentBalance = Number(
            data.account.balance
          );

          setBalance(currentBalance);

          localStorage.setItem(
            "balance",
            String(data.account.balance)
          );
        }

        localStorage.setItem(
          "account",
          JSON.stringify(data.account)
        );
      }

      // =================================================
      // TRANSACTIONS
      // =================================================

      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }

    } catch (error) {
      console.error(
        "Transaction loading error:",
        error
      );

      setError(
        "Unable to connect to the Django server. Please make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // TRANSACTION TYPE
  // =====================================================

  const getTransactionType = (type) => {
    if (type === "CREDIT") {
      return "Credit";
    }

    if (type === "DEBIT") {
      return "Debit";
    }

    return type || "-";
  };

  // =====================================================
  // TRANSACTION TYPE STYLE
  // =====================================================

  const getTypeStyle = (type) => {
    if (type === "CREDIT") {
      return "bg-green-100 text-green-700";
    }

    return "bg-red-100 text-red-700";
  };

  // =====================================================
  // AMOUNT
  // =====================================================

  const formatAmount = (amount, type) => {
    const numericAmount = Number(amount || 0);

    const formattedAmount =
      numericAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    if (type === "CREDIT") {
      return `+₹${formattedAmount}`;
    }

    return `-₹${formattedAmount}`;
  };

  // =====================================================
  // AMOUNT STYLE
  // =====================================================

  const getAmountStyle = (type) => {
    if (type === "CREDIT") {
      return "text-green-600";
    }

    return "text-red-600";
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    if (status === "COMPLETED") {
      return "bg-green-100 text-green-700";
    }

    if (status === "PENDING") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "FAILED") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  // =====================================================
  // TOTAL CREDITS
  // =====================================================

  const totalCredits = transactions
    .filter(
      (transaction) =>
        transaction.transaction_type === "CREDIT"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  // =====================================================
  // TOTAL DEBITS
  // =====================================================

  const totalDebits = transactions
    .filter(
      (transaction) =>
        transaction.transaction_type === "DEBIT"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

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

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* =================================================
            PAGE HEADER
            ================================================= */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">
            Transactions
          </h2>

          <p className="text-gray-500 mt-2">
            View your complete banking transaction history.
          </p>

        </div>

        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-lg">
            {error}
          </div>
        )}

        {/* =================================================
            ACCOUNT SUMMARY
            ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Available Balance */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Available Balance
                </p>

                {loading ? (
                  <h3 className="text-3xl font-bold text-gray-400 mt-2">
                    Loading...
                  </h3>
                ) : (
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
                )}

              </div>

              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-2xl">
                💳
              </div>

            </div>

          </div>

          {/* Total Credits */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total Credits
                </p>

                <h3 className="text-3xl font-bold text-green-600 mt-2">
                  +₹
                  {totalCredits.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </h3>

              </div>

              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center text-2xl">
                ↑
              </div>

            </div>

          </div>

          {/* Total Debits */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total Debits
                </p>

                <h3 className="text-3xl font-bold text-red-600 mt-2">
                  -₹
                  {totalDebits.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </h3>

              </div>

              <div className="w-12 h-12 bg-red-100 text-red-700 rounded-xl flex items-center justify-center text-2xl">
                ↓
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            ACCOUNT INFORMATION
            ================================================= */}

        {account && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-sm text-gray-500">
                  Account Holder
                </p>

                <p className="font-bold text-gray-800 mt-1">
                  {account.name}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Account Number
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {account.account_number}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  IFSC Code
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {account.ifsc_code}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Transactions
                </p>

                <p className="font-bold text-blue-700 mt-1">
                  {transactions.length}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            TRANSACTION TABLE
            ================================================= */}

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          {/* Table Header */}

          <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h3 className="text-xl font-bold text-gray-800">
                Transaction History
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                All transactions recorded by the banking system.
              </p>

            </div>

            <button
              onClick={fetchTransactions}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading
                ? "Refreshing..."
                : "Refresh Transactions"}
            </button>

          </div>

          {/* =================================================
              LOADING
              ================================================= */}

          {loading ? (

            <div className="text-center py-14">

              <div className="text-4xl mb-4">
                ⏳
              </div>

              <p className="text-gray-500">
                Loading transactions...
              </p>

            </div>

          ) : transactions.length === 0 ? (

            /* =================================================
               NO TRANSACTIONS
               ================================================= */

            <div className="text-center py-14">

              <div className="text-5xl mb-4">
                📋
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                No Transactions Found
              </h3>

              <p className="text-gray-500 mt-2">
                Your transaction history is currently empty.
              </p>

            </div>

          ) : (

            /* =================================================
               TRANSACTION TABLE
               ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Date
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Description
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Type
                    </th>

                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                      Amount
                    </th>

                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {transactions.map(
                    (transaction) => (

                      <tr
                        key={transaction.id}
                        className="border-t hover:bg-gray-50 transition"
                      >

                        {/* DATE */}

                        <td className="px-6 py-4">

                          <p className="text-sm font-medium text-gray-800">
                            {formatDate(
                              transaction.created_at
                            )}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(
                              transaction.created_at
                            )}
                          </p>

                        </td>

                        {/* DESCRIPTION */}

                        <td className="px-6 py-4">

                          <p className="font-semibold text-gray-800">
                            {transaction.description}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            Transaction ID: #
                            {transaction.id}
                          </p>

                        </td>

                        {/* TYPE */}

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeStyle(
                              transaction.transaction_type
                            )}`}
                          >
                            {getTransactionType(
                              transaction.transaction_type
                            )}
                          </span>

                        </td>

                        {/* AMOUNT */}

                        <td
                          className={`px-6 py-4 text-right font-bold ${getAmountStyle(
                            transaction.transaction_type
                          )}`}
                        >
                          {formatAmount(
                            transaction.amount,
                            transaction.transaction_type
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4 text-center">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* =================================================
            FRAUD DETECTION MESSAGE
            ================================================= */}

        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">

          <div className="flex items-start gap-4">

            <div className="text-3xl">
              🛡️
            </div>

            <div>

              <h3 className="font-bold text-green-800 text-lg">
                Fraud Detection is Active
              </h3>

              <p className="text-green-700 text-sm mt-1">
                Your transactions are monitored for
                suspicious activity, including large
                transactions and multiple transactions
                within a short period.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Transactions;