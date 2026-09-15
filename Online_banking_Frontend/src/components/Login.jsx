import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");

  const [verificationRequired, setVerificationRequired] =
    useState(false);

  const [verificationCode, setVerificationCode] =
    useState("");

  const [demoCode, setDemoCode] = useState("");

  // =====================================================
  // SAVE ACCOUNT AND GO TO DASHBOARD
  // =====================================================

  const loginSuccess = (data) => {
    console.log("Login success data:", data);

    // Get account information
    const account = data.account || data.user;

    console.log("Account received:", account);

    if (!account || !account.id) {
      setError(
        "Login successful, but account information was not received."
      );
      return;
    }

    // ---------------------------------------------------
    // Clear old account information
    // ---------------------------------------------------

    localStorage.removeItem("account");
    localStorage.removeItem("accountId");
    localStorage.removeItem("accountName");
    localStorage.removeItem("accountEmail");

    // ---------------------------------------------------
    // Save complete account
    // ---------------------------------------------------

    localStorage.setItem(
      "account",
      JSON.stringify(account)
    );

    // ---------------------------------------------------
    // IMPORTANT: Save account ID
    // ---------------------------------------------------

    localStorage.setItem(
      "accountId",
      String(account.id)
    );

    localStorage.setItem(
      "accountName",
      account.name || ""
    );

    localStorage.setItem(
      "accountEmail",
      account.email || ""
    );

    // ---------------------------------------------------
    // Save balance
    // ---------------------------------------------------

    if (account.balance !== undefined) {
      localStorage.setItem(
        "balance",
        String(account.balance)
      );
    }

    console.log(
      "Saved accountId:",
      localStorage.getItem("accountId")
    );

    alert("Login successful!");

    navigate("/dashboard");
  };

  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSecurityMessage("");
    setVerificationRequired(false);
    setDemoCode("");
    setVerificationCode("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/accounts/login/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Django login response:",
        data
      );

      // =================================================
      // LOGIN FAILED
      // =================================================

      if (!response.ok) {
        const security = data.login_security;

        // -----------------------------------------------
        // HIGH RISK
        // -----------------------------------------------

        if (
          security?.risk_level === "HIGH"
        ) {
          setError(
            data.error ||
              "Login blocked due to suspicious activity."
          );

          setSecurityMessage(
            `Risk level: HIGH | Risk score: ${security.risk_score}`
          );

          return;
        }

        // -----------------------------------------------
        // MEDIUM RISK
        // -----------------------------------------------

        if (
          security?.risk_level === "MEDIUM"
        ) {
          setError(
            data.error ||
              "Additional verification required."
          );

          setSecurityMessage(
            `Risk level: MEDIUM | Risk score: ${security.risk_score} | Failed attempts: ${security.failed_attempts}`
          );

          setVerificationRequired(true);

          // Demo verification code
          if (data.demo_verification_code) {
            setDemoCode(
              String(data.demo_verification_code)
            );
          }

          return;
        }

        // -----------------------------------------------
        // LOW RISK
        // -----------------------------------------------

        setError(
          data.error ||
            data.detail ||
            data.message ||
            "Invalid email or password."
        );

        return;
      }

      // =================================================
      // SUCCESSFUL LOGIN
      // =================================================

      loginSuccess(data);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure Django is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // MEDIUM-RISK VERIFICATION
  // =====================================================

  const handleVerification = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/accounts/verify-login/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            verification_code:
              verificationCode,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Django verification response:",
        data
      );

      if (!response.ok) {
        setError(
          data.error ||
            "Verification failed."
        );

        return;
      }

      // =================================================
      // VERIFICATION SUCCESSFUL
      // =================================================

      loginSuccess(data);

    } catch (error) {
      console.error(
        "Verification error:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure Django is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        {/* TITLE */}

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Login
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Welcome back! Please login to your account.
        </p>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* SECURITY MESSAGE */}

        {securityMessage && (
          <div className="mb-5 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
            {securityMessage}
          </div>
        )}

        {/* =================================================
            MEDIUM RISK VERIFICATION
            ================================================= */}

        {verificationRequired ? (

          <div>

            <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">

              <h2 className="font-semibold text-blue-800 mb-2">
                Additional Verification
              </h2>

              <p className="text-sm text-blue-700">
                Suspicious login activity was detected.
                Please enter the verification code.
              </p>

            </div>

            {/* DEMO CODE */}

            {demoCode && (
              <div className="mb-5 p-4 bg-green-100 border border-green-300 rounded-lg">

                <p className="text-sm text-green-800 font-medium">
                  Demo verification code:
                </p>

                <p className="text-2xl font-bold text-green-900 tracking-widest text-center mt-2">
                  {demoCode}
                </p>

                <p className="text-xs text-green-700 mt-2">
                  Demo only. In a real system this code
                  would be sent by email or SMS.
                </p>

              </div>
            )}

            {/* VERIFICATION FORM */}

            <form
              onSubmit={handleVerification}
              className="space-y-5"
            >

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  verificationCode.length !== 6
                }
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading
                  ? "Verifying..."
                  : "Verify & Login"}
              </button>

            </form>

          </div>

        ) : (

          /* =================================================
             NORMAL LOGIN FORM
             ================================================= */

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>

            {/* REMEMBER / FORGOT */}

            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  className="w-4 h-4"
                />

                Remember me

              </label>

              <Link
                to="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

        )}

        {/* BOTTOM REGISTER LINK */}

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;