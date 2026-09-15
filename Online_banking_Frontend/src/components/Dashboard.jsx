import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [securityStatus, setSecurityStatus] = useState("Secure");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // LOAD ACCOUNT + TRANSACTIONS
  // =====================================================

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
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

      // -------------------------------------------------
      // Get account and transactions
      // -------------------------------------------------

      const response = await fetch(
        `http://localhost:8000/api/transactions/account/${accountId}/`
      );

      const data = await response.json();

      console.log(
        "Dashboard account response:",
        data
      );

      if (!response.ok) {
        setError(
          data.error ||
            data.detail ||
            "Unable to load account information."
        );

        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // Save account information
      // -------------------------------------------------

      if (data.account) {
        setAccount(data.account);

        // Real balance from Django
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

        // Save account locally
        localStorage.setItem(
          "account",
          JSON.stringify(data.account)
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

      // -------------------------------------------------
      // Save transactions
      // -------------------------------------------------

      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }

      // -------------------------------------------------
      // Get fraud/security status
      // -------------------------------------------------

      try {
        const fraudResponse = await fetch(
          `http://localhost:8000/api/fraud/account/${accountId}/`
        );

        const fraudData = await fraudResponse.json();

        console.log(
          "Dashboard fraud response:",
          fraudData
        );

        if (fraudResponse.ok && fraudData.summary) {
          setSecurityStatus(
            fraudData.summary.account_status || "Secure"
          );
        }
      } catch (fraudError) {
        console.error(
          "Fraud status error:",
          fraudError
        );

        // Keep default Secure if fraud API fails
        setSecurityStatus("Secure");
      }

    } catch (error) {
      console.error(
        "Dashboard error:",
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
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("account");
    localStorage.removeItem("accountId");
    localStorage.removeItem("accountName");
    localStorage.removeItem("accountEmail");
    localStorage.removeItem("balance");

    navigate("/login");
  };

  // =====================================================
  // SECURITY STATUS STYLE
  // =====================================================

  const getSecurityStyle = () => {
    if (securityStatus === "Blocked") {
      return {
        container:
          "bg-red-50 border-red-200",
        icon:
          "bg-red-100 text-red-700",
        title:
          "text-red-800",
        text:
          "text-red-700",
        iconText: "🚫",
      };
    }

    if (securityStatus === "At Risk") {
      return {
        container:
          "bg-yellow-50 border-yellow-200",
        icon:
          "bg-yellow-100 text-yellow-700",
        title:
          "text-yellow-800",
        text:
          "text-yellow-700",
        iconText: "⚠️",
      };
    }

    return {
      container:
        "bg-green-50 border-green-200",
      icon:
        "bg-green-100 text-green-700",
      title:
        "text-green-800",
      text:
        "text-green-700",
      iconText: "🔒",
    };
  };

  const securityStyle = getSecurityStyle();

  // =====================================================
  // FORMAT TRANSACTION DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const transactionDate = new Date(date);

    if (isNaN(transactionDate.getTime())) {
      return date;
    }

    return transactionDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // TRANSACTION AMOUNT STYLE
  // =====================================================

  const getTransactionAmount = (transaction) => {
    const amount = Number(
      transaction.amount || 0
    );

    if (
      transaction.transaction_type === "CREDIT"
    ) {
      return `+₹${amount.toLocaleString("en-IN")}`;
    }

    return `-₹${amount.toLocaleString("en-IN")}`;
  };

  const getTransactionAmountClass = (
    transaction
  ) => {
    if (
      transaction.transaction_type === "CREDIT"
    ) {
      return "text-green-600";
    }

    return "text-red-600";
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

          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Logout
          </button>

        </div>

      </nav>

      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* =================================================
            WELCOME
            ================================================= */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-800">

            {account?.name
              ? `Welcome, ${account.name}!`
              : "Welcome to your Dashboard"}

          </h2>

          <p className="text-gray-500 mt-2">
            Manage your account, transactions and
            fraud alerts securely.
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
            ACCOUNT INFORMATION
            ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Balance Card */}

          <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-7 text-white">

            <div className="flex justify-between items-start">

              <div>

                <p className="text-blue-200 text-sm">
                  Available Balance
                </p>

                {loading ? (
                  <h2 className="text-4xl font-bold mt-3">
                    Loading...
                  </h2>
                ) : (
                  <h2 className="text-4xl font-bold mt-3">
                    ₹
                    {balance.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </h2>
                )}

                <p className="text-blue-200 mt-4">
                  Savings Account
                </p>

              </div>

              <div className="text-4xl">
                🏦
              </div>

            </div>

          </div>

          {/* Security Card */}

          <div
            className={`rounded-2xl border p-6 ${securityStyle.container}`}
          >

            <div className="flex items-center gap-4">

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${securityStyle.icon}`}
              >
                {securityStyle.iconText}
              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Security Status
                </p>

                <h3
                  className={`text-xl font-bold ${securityStyle.title}`}
                >
                  {securityStatus}
                </h3>

              </div>

            </div>

            <p
              className={`text-sm mt-4 ${securityStyle.text}`}
            >
              {securityStatus === "Blocked"
                ? "Your account is currently blocked due to a fraud alert."
                : securityStatus === "At Risk"
                ? "Suspicious activity has been detected on your account."
                : "Fraud monitoring is active on your account."}
            </p>

          </div>

        </div>

        {/* =================================================
            ACCOUNT DETAILS
            ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Account Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500">
                Account Holder
              </p>

              <p className="text-lg font-semibold text-gray-800 mt-1">
                {account?.name || "Loading..."}
              </p>

            </div>

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500">
                Account Number
              </p>

              <p className="text-lg font-semibold text-gray-800 mt-1 tracking-wide">
                {account?.account_number || "Loading..."}
              </p>

            </div>

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500">
                IFSC Code
              </p>

              <p className="text-lg font-semibold text-gray-800 mt-1">
                {account?.ifsc_code || "Loading..."}
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            QUICK ACTIONS
            ================================================= */}

        <div className="mb-8">

          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Transactions */}

            <Link
              to="/transactions"
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-2xl mb-4">
                📋
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

            {/* Credit Money */}

            <Link
              to="/credit-money"
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center text-2xl mb-4">
                💰
              </div>

              <h4 className="text-lg font-bold text-gray-800">
                Credit Money
              </h4>

              <p className="text-gray-500 mt-2">
                Add money to your bank account.
              </p>

              <span className="text-green-600 font-semibold mt-4 inline-block">
                Add Money →
              </span>

            </Link>

            {/* Transfer Money */}

            <Link
              to="/transfer"
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-2xl mb-4">
                💸
              </div>

              <h4 className="text-lg font-bold text-gray-800">
                Transfer Money
              </h4>

              <p className="text-gray-500 mt-2">
                Send money securely to another account.
              </p>

              <span className="text-purple-600 font-semibold mt-4 inline-block">
                Make Transfer →
              </span>

            </Link>

            {/* Debit Money */}

            <Link
              to="/debit-money"
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition"
            >

              <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center text-2xl mb-4">
                🏧
              </div>

              <h4 className="text-lg font-bold text-gray-800">
                Debit Money
              </h4>

              <p className="text-gray-500 mt-2">
                Withdraw money from your bank account.
              </p>

              <span className="text-orange-600 font-semibold mt-4 inline-block">
                Withdraw Money →
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

        {/* =================================================
            RECENT TRANSACTIONS
            ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

          <div className="flex justify-between items-center mb-5">

            <h3 className="text-xl font-semibold text-gray-800">
              Recent Transactions
            </h3>

            <Link
              to="/transactions"
              className="text-blue-600 font-semibold hover:underline"
            >
              View All →
            </Link>

          </div>

          {loading ? (

            <div className="text-center py-8 text-gray-500">
              Loading transactions...
            </div>

          ) : transactions.length === 0 ? (

            <div className="text-center py-8 text-gray-500">
              No transactions found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="py-3 text-sm text-gray-500 font-semibold">
                      Date
                    </th>

                    <th className="py-3 text-sm text-gray-500 font-semibold">
                      Description
                    </th>

                    <th className="py-3 text-sm text-gray-500 font-semibold">
                      Type
                    </th>

                    <th className="py-3 text-sm text-gray-500 font-semibold text-right">
                      Amount
                    </th>

                    <th className="py-3 text-sm text-gray-500 font-semibold text-right">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {transactions
                    .slice(0, 5)
                    .map((transaction) => (

                      <tr
                        key={transaction.id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >

                        <td className="py-4 text-sm text-gray-600">
                          {formatDate(
                            transaction.created_at
                          )}
                        </td>

                        <td className="py-4 text-sm font-medium text-gray-800">
                          {transaction.description}
                        </td>

                        <td className="py-4">

                          <span
                            className={
                              transaction.transaction_type ===
                              "CREDIT"
                                ? "px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"
                                : "px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"
                            }
                          >
                            {transaction.transaction_type}
                          </span>

                        </td>

                        <td
                          className={`py-4 text-sm font-bold text-right ${getTransactionAmountClass(
                            transaction
                          )}`}
                        >
                          {getTransactionAmount(
                            transaction
                          )}
                        </td>

                        <td className="py-4 text-right">

                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            {transaction.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* =================================================
            SECURITY INFORMATION
            ================================================= */}

        <div
          className={`border rounded-2xl p-6 ${securityStyle.container}`}
        >

          <div className="flex items-center gap-4">

            <div className="text-3xl">
              {securityStyle.iconText}
            </div>

            <div>

              <h3
                className={`font-bold ${securityStyle.title}`}
              >
                {securityStatus === "Secure"
                  ? "Your account is secure"
                  : `Account Status: ${securityStatus}`}
              </h3>

              <p
                className={`text-sm mt-1 ${securityStyle.text}`}
              >
                Our fraud detection system monitors
                login activity and transactions for
                suspicious behavior.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;