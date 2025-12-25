import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getProfile } from "./api/auth.js";

// Auth Components
import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";
import ForgotPassword from "./components/Auth/ForgotPassword.jsx";
import VerifyOTP from "./components/Auth/VerifyOTP.jsx";
import ResetPassword from "./components/Auth/ResetPassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Dashboards
import CitizenDashboard from "./components/Dashboard/CitizenDashboard.jsx";
import LawyerDashboard from "./components/lawyerDashboard/LawyerDashboard.jsx";
import NGODashboard from "./components/NGODashboard/NGODashboard.jsx";
import AdminDashboard from "./components/adminDashbaord/AdminDashboard.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Services from "./Services.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import MapComponent from "./pages/MapComponent.jsx";

// Citizen Task Pages
import MyCases from "./pages/MyCases.jsx";
import CaseDetails from "./pages/CaseDetails.jsx";
import LegalDirectory from "./pages/LegalDirectory.jsx";

export default function App() {
  const [user, setUser] = useState({
    name: "Sachin",
    role: "CITIZEN", // default for testing
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const res = await getProfile();
        if (res?.data) {
          setUser(res.data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        setUser(null);
      }
    };

    fetchProfile();
  }, []);

  const onLogin = (userData) => {
    setUser(userData);

    if (userData.role === "CITIZEN") navigate("/citizen/dashboard");
    else if (userData.role === "LAWYER") navigate("/lawyer/dashboard");
    else if (userData.role === "NGO") navigate("/ngo/dashboard");
    else if (userData.role === "ADMIN") navigate("/dashboard/admin");
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/register" element={<Register onRegister={onLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Static Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/map" element={<MapComponent />} />

        {/* Protected Common Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Citizen Routes */}
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/citizen/my-cases" element={<MyCases />} />
        <Route path="/citizen/case-details/:id" element={<CaseDetails />} />
        <Route path="/citizen/find-help" element={<LegalDirectory />} />

        {/* Other Dashboards */}
        <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
        <Route path="/ngo/dashboard" element={<NGODashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
