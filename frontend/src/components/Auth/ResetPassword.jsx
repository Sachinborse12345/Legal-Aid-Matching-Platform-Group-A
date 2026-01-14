import React, { useState } from "react";
import { resetPassword } from "../../api/auth";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);

  const { state } = useLocation();
  const email = state?.email;
  const role = state?.role;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword({ email, role, newPassword: password });
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-sm text-gray-500 mt-1">Set your new password</p>

        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 p-2 my-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
            Reset Password
          </button>
        </form>
      </div>
    </section>
  );
}
