import React, { useEffect, useState } from "react";

function FraudAlerts() {
  const [account, setAccount] = useState(null);
  const [summary, setSummary] = useState({
    total_alerts: 0,
    high_risk: 0,
    account_status: "Secure",
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // =====================================================
  // FETCH FRAUD ALERTS
  // =====================================================

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const fetchFraudAlerts = async () => {
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

      const response = await fetch(
        `http://localhost:8000/api/fraud/account/${accountId}/`
      );

      const data = await response.json();

      console.log("Fraud alerts response:", data);

      if (!response.ok) {
        setError(
          data.error ||
            data.detail ||
            "Unable to load fraud alerts."
        );
        setLoading(false);
        return;
      }

      // Account information
      if (data.account) {
        setAccount(data.account);
      }

      // Summary
      if (data.summary) {
        setSummary(data.summary);
      }

      // Alerts
      if (Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }

    } catch (error) {
      console.error(
        "Fraud alerts error:",
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
  // UPDATE ALERT STATUS
  // =====================================================

  const updateAlertStatus = async (
    alertId,
    newStatus
  ) => {
    setUpdatingId(alertId);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/fraud/alert/${alertId}/`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Fraud alert update response:",
        data
      );

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to update fraud alert."
        );

        return;
      }

      // Reload the complete fraud information
      await fetchFraudAlerts();

    } catch (error) {
      console.error(
        "Update fraud alert error:",
        error
      );

      setError(
        "Unable to connect to the Django server."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // RISK STYLE
  // =====================================================

  const getRiskStyle = (risk) => {
    if (risk === "High") {
      return "bg-red-100 text-red-700";
    }

    if (risk === "Medium") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    if (status === "Blocked") {
      return "bg-red-100 text-red-700";
    }

    if (status === "Under Review") {
      return "bg-orange-100 text-orange-700";
    }

    if (status === "Monitoring") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "Resolved") {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  // =====================================================
  // ACCOUNT STATUS STYLE
  // =====================================================

  const getAccountStatusStyle = () => {
    if (summary.account_status === "Blocked") {
      return {
        container:
          "bg-red-50 border-red-200",
        icon:
          "bg-red-100 text-red-700",
        title:
          "text-red-800",
        text:
          "text-red-700",
        symbol: "🚫",
      };
    }

    if (summary.account_status === "At Risk") {
      return {
        container:
          "bg-yellow-50 border-yellow-200",
        icon:
          "bg-yellow-100 text-yellow-700",
        title:
          "text-yellow-800",
        text:
          "text-yellow-700",
        symbol: "⚠️",
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
      symbol: "🔒",
    };
  };

  const accountStatusStyle =
    getAccountStatusStyle();

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
            onClick={() =>
              window.location.href = "/dashboard"
            }
            className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Dashboard
          </button>

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
            Fraud Detection & Security
          </h2>

          <p className="text-gray-500 mt-2">
            Monitor suspicious login activity and
            banking transactions.
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

        {account && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <p className="text-sm text-gray-500">
                  Account Holder
                </p>

                <h3 className="text-xl font-bold text-gray-800">
                  {account.name}
                </h3>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Account Number
                </p>

                <p className="font-semibold text-gray-800">
                  {account.account_number}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  IFSC Code
                </p>

                <p className="font-semibold text-gray-800">
                  {account.ifsc_code}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
            ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total Alerts */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total Alerts
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {loading ? "..." : summary.total_alerts}
                </h3>

              </div>

              <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-2xl">
                🛡️
              </div>

            </div>

            <p className="text-sm text-gray-500 mt-4">
              All security alerts generated for your account.
            </p>

          </div>

          {/* High Risk */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  High Risk Alerts
                </p>

                <h3 className="text-3xl font-bold text-red-600 mt-2">
                  {loading ? "..." : summary.high_risk}
                </h3>

              </div>

              <div className="w-14 h-14 bg-red-100 text-red-700 rounded-xl flex items-center justify-center text-2xl">
                ⚠️
              </div>

            </div>

            <p className="text-sm text-gray-500 mt-4">
              Alerts classified as high risk.
            </p>

          </div>

          {/* Account Status */}

          <div
            className={`rounded-2xl border p-6 ${accountStatusStyle.container}`}
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Account Status
                </p>

                <h3
                  className={`text-2xl font-bold mt-2 ${accountStatusStyle.title}`}
                >
                  {summary.account_status}
                </h3>

              </div>

              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${accountStatusStyle.icon}`}
              >
                {accountStatusStyle.symbol}
              </div>

            </div>

            <p
              className={`text-sm mt-4 ${accountStatusStyle.text}`}
            >
              {summary.account_status === "Blocked"
                ? "Your account is blocked due to a security alert."
                : summary.account_status === "At Risk"
                ? "High-risk activity requires attention."
                : "Your account is currently secure."}
            </p>

          </div>

        </div>

        {/* =================================================
            SECURITY INFORMATION
            ================================================= */}

        <div
          className={`border rounded-2xl p-6 mb-8 ${accountStatusStyle.container}`}
        >

          <div className="flex items-start gap-4">

            <div className="text-3xl">
              {accountStatusStyle.symbol}
            </div>

            <div>

              <h3
                className={`font-bold text-lg ${accountStatusStyle.title}`}
              >
                Fraud Detection is Active
              </h3>

              <p
                className={`text-sm mt-1 ${accountStatusStyle.text}`}
              >
                The system monitors login attempts,
                transaction amounts and rapid transaction
                activity to identify suspicious behavior.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            ALERTS TABLE
            ================================================= */}

        <div className="bg-white rounded-2xl shadow-md p-6">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">

            <div>

              <h3 className="text-xl font-bold text-gray-800">
                Security Alerts
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Review suspicious activity detected by the system.
              </p>

            </div>

            <button
              onClick={fetchFraudAlerts}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading
                ? "Refreshing..."
                : "Refresh Alerts"}
            </button>

          </div>

          {loading ? (

            <div className="text-center py-12 text-gray-500">
              Loading security alerts...
            </div>

          ) : alerts.length === 0 ? (

            <div className="text-center py-12">

              <div className="text-5xl mb-4">
                🔒
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                No Fraud Alerts
              </h3>

              <p className="text-gray-500 mt-2">
                No suspicious activity has been detected.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-500">
                      Date
                    </th>

                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-500">
                      Activity
                    </th>

                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-500">
                      Amount
                    </th>

                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-500">
                      Risk Level
                    </th>

                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-500">
                      Status
                    </th>

                    <th className="text-left py-4 px-3 text-sm font-semibold text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {alerts.map((alert) => (

                    <React.Fragment key={alert.id}>

                      <tr className="border-b hover:bg-gray-50">

                        {/* Date */}

                        <td className="py-4 px-3 text-sm text-gray-600">
                          {alert.date}
                        </td>

                        {/* Activity */}

                        <td className="py-4 px-3">

                          <p className="font-semibold text-gray-800">
                            {alert.description}
                          </p>

                          {alert.description_detail && (
                            <p className="text-xs text-gray-500 mt-1 max-w-xs">
                              {alert.description_detail}
                            </p>
                          )}

                        </td>

                        {/* Amount */}

                        <td className="py-4 px-3 text-sm font-semibold text-gray-800">
                          {alert.amount === "-"
                            ? "-"
                            : `₹${Number(
                                alert.amount
                              ).toLocaleString("en-IN")}`}
                        </td>

                        {/* Risk */}

                        <td className="py-4 px-3">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskStyle(
                              alert.risk
                            )}`}
                          >
                            {alert.risk}
                          </span>

                        </td>

                        {/* Status */}

                        <td className="py-4 px-3">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(
                              alert.status
                            )}`}
                          >
                            {alert.status}
                          </span>

                        </td>

                        {/* Action */}

                        <td className="py-4 px-3">

                          <div className="flex flex-wrap gap-2">

                            {alert.status !== "Resolved" && (
                              <button
                                onClick={() =>
                                  updateAlertStatus(
                                    alert.id,
                                    "RESOLVED"
                                  )
                                }
                                disabled={
                                  updatingId === alert.id
                                }
                                className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                              >
                                {updatingId === alert.id
                                  ? "Updating..."
                                  : "Resolve"}
                              </button>
                            )}

                            {alert.status !== "Blocked" &&
                              alert.status !== "Resolved" && (
                                <button
                                  onClick={() =>
                                    updateAlertStatus(
                                      alert.id,
                                      "BLOCKED"
                                    )
                                  }
                                  disabled={
                                    updatingId === alert.id
                                  }
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
                                >
                                  Block
                                </button>
                              )}

                          </div>

                        </td>

                      </tr>

                    </React.Fragment>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* =================================================
            BACK TO DASHBOARD
            ================================================= */}

        <div className="mt-8 text-center">

          <button
            onClick={() =>
              window.location.href = "/dashboard"
            }
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to Dashboard
          </button>

        </div>

      </main>

    </div>
  );
}

export default FraudAlerts;