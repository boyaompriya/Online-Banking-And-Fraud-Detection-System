import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Store generated account details
  const [accountDetails, setAccountDetails] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Check passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/accounts/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      console.log("Django registration response:", data);

      // Successful registration
      if (response.ok) {

        // Get account information from Django
        const account = data.account;

        // Save account details for displaying
        setAccountDetails(account);

        // Clear form
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });

      } else {

        // Display Django validation errors
        if (data.email) {
          setError(`Email: ${data.email[0]}`);
        } else if (data.phone) {
          setError(`Phone: ${data.phone[0]}`);
        } else if (data.name) {
          setError(`Name: ${data.name[0]}`);
        } else if (data.password) {
          setError(`Password: ${data.password[0]}`);
        } else {
          setError(
            "Registration failed. Please check your details."
          );
        }
      }

    } catch (error) {

      console.error("Registration error:", error);

      setError(
        "Unable to connect to the server. Please make sure Django is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // If registration was successful
  if (accountDetails) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-center text-green-600 mb-2">
            Registration Successful!
          </h1>

          <p className="text-center text-gray-500 mb-6">
            Your banking account has been created.
          </p>

          {/* Account Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                Account Holder
              </p>

              <p className="font-semibold text-gray-800">
                {accountDetails.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Account Number
              </p>

              <p className="text-xl font-bold text-blue-600">
                {accountDetails.account_number}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                IFSC Code
              </p>

              <p className="font-semibold text-gray-800">
                {accountDetails.ifsc_code}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Initial Balance
              </p>

              <p className="text-xl font-bold text-green-600">
                ₹{accountDetails.balance}
              </p>
            </div>

          </div>

          {/* Important message */}
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg p-3 mt-5 text-sm">
            <strong>Important:</strong> Please save your Account
            Number and IFSC Code for future transactions.
          </div>

          {/* Login Button */}
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-6"
          >
            Go to Login
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Online Banking
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Create your account
        </p>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-5">
          Already have an account?{" "}

          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;