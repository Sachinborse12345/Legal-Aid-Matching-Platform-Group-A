import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Services from "./Services.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CitizenDashboard from "./components/Dashboard/CitizenDashboard.jsx";
import LawyerDashboard from "./components/lawyerDashboard/LawyerDashboard.jsx";
import NGODashboard from "./components/Dashboard/NGODashboard.jsx";
import AdminDashboard from "./components/adminDashbaord/AdminDashboard.jsx";
import { getProfile } from "./api/auth.js";
import MapComponent from "./pages/MapComponent.jsx";
import ForgotPassword from "./components/Auth/ForgotPassword.jsx"; //New added
import VerifyOTP from "./components/Auth/VerifyOTP.jsx";
import ResetPassword from "./components/Auth/ResetPassword.jsx";

//New added

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      // Only try to fetch profile if there's a token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const role = localStorage.getItem("role");
        if (role === "CITIZEN" || role === "ADMIN") {
          const res = await getProfile();
          if (res && res.data) {
            setUser(res.data);
          }
        } else {
          // For Lawyer/NGO, just set basic user info from localStorage if needed
          setUser({
            email: localStorage.getItem("email"),
            role: role,
            userId: localStorage.getItem("userId")
          });
        }
      } catch (error) {
        // Silently fail - user is not logged in
        // Clear any invalid token
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

  // const onLogin = (userData) => {
  //   setUser(userData);
  //   console.log(userData.role);
  //   if (userData.role === "CITIZEN") navigate("/dashboard/citizen");
  //   else if (userData.role === "LAWYER") navigate("/dashboard/lawyer");
  //   else if (userData.role === "NGO") navigate("/dashboard/ngo");
  //   else if (userData.role === "ADMIN") navigate("/dashboard/admin");
  //   else navigate("/");
  // };

  const onLogin = (userData) => {
    setUser(userData);
    const role = userData.role?.toUpperCase();
    if (role === "CITIZEN") navigate("/citizen/dashboard");
    else if (role === "LAWYER") navigate("/lawyer/dashboard");
    else if (role === "NGO") navigate("/ngo/dashboard");
    else if (role === "ADMIN") navigate("/dashboard/admin");
    else navigate("/");
  };

  return (
    <div className="min-h-screen">
      <Routes>
        //new added
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        //new added
        <Route path="/map" element={<MapComponent />} />
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register onRegister={onLogin} />} />
        {/* ⭐ Newly added pages */}
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        {/* Protected Routes */}
        {/* <Route element={<ProtectedRoute user={user} />}> */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
        <Route path="/ngo/dashboard" element={<NGODashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />{" "}
        {/* </Route> */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </div>
  );
}
