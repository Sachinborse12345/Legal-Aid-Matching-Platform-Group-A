import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getProfile } from "./api/auth.js";

// Layout & Auth Components
import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";
import ForgotPassword from "./components/Auth/ForgotPassword.jsx";
import VerifyOTP from "./components/Auth/VerifyOTP.jsx";
import ResetPassword from "./components/Auth/ResetPassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Dashboard Components
import CitizenDashboard from "./components/Dashboard/CitizenDashboard.jsx";
import LawyerDashboard from "./components/lawyerDashboard/LawyerDashboard.jsx";
import NGODashboard from "./components/Dashboard/NGODashboard.jsx";
import AdminDashboard from "./components/adminDashbaord/AdminDashboard.jsx";

// Page Components
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Services from "./Services.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import MapComponent from "./pages/MapComponent.jsx";

// ⭐ Task 1, 2, & 3 Page Imports
import MyCases from "./pages/MyCases.jsx"; 
import CaseDetails from "./pages/CaseDetails.jsx";
import LegalDirectory from "./pages/LegalDirectory.jsx"; 

export default function App() {
  const [user, setUser] = useState({
    name: "Sachin",
    role: "CITIZEN", // Defaulting to CITIZEN for testing Tasks 1-3
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
        if (res && res.data) {
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
    // Redirect based on role after login
    if (userData.role === "CITIZEN") navigate("/citizen/dashboard");
    else if (userData.role === "LAWYER") navigate("/lawyer/dashboard");
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/register" element={<Register onRegister={onLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* --- Static Pages --- */}
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/map" element={<MapComponent />} />

        {/* --- Protected Shared Routes --- */}
        <Route path="/profile" element={<Profile />} />

        {/* --- CITIZEN SPECIFIC ROUTES (Tasks 1, 2, & 3) --- */}
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        
        {/* Task 1: List of all cases */}
        <Route path="/citizen/my-cases" element={<MyCases />} /> 
        
        {/* Task 2: Detailed case view with ID parameter */}
        <Route path="/citizen/case-details/:id" element={<CaseDetails />} />
        
        {/* Task 3: Lawyer & NGO Directory */}
        <Route path="/citizen/find-help" element={<LegalDirectory />} /> 

        {/* --- OTHER ROLE DASHBOARDS --- */}
        <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
        <Route path="/ngo/dashboard" element={<NGODashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        {/* --- Fallback Redirect --- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}