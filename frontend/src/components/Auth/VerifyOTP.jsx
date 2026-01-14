import React, { useState } from "react";
import { verifyOtp } from "../../api/auth";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);

  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email;
  const role = state?.role;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await verifyOtp({ email, otp });
      navigate("/reset-password", { state: { email, role } });
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold">Verify OTP</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter the OTP sent to your email
        </p>

        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 p-2 my-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OTP
            </label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
            Verify OTP
          </button>
        </form>
      </div>
    </section>
  );
}
