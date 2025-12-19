import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfile } from "../../Redux/authSlice.js";
import NGOSidebar from "./NGOSidebar.jsx";
import NGOProfile from "./NGOProfile.jsx";
import NGOSettings from "./NGOSettings.jsx";
import RequestedCases from "./RequestedCases.jsx";
import AcceptedCases from "./AcceptedCases.jsx";
import PendingCases from "./PendingCases.jsx";
import CompletedCases from "./CompletedCases.jsx";

export default function NGODashboard() {
  const dispatch = useDispatch();
  const { profile: reduxProfile, isAuthenticated } = useSelector((state) => state.auth);
  
  const [activePage, setActivePage] = useState("profile"); // profile | settings | requested | accepted | pending | completed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch profile data on mount/refresh
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Always fetch profile on mount to ensure data is loaded after refresh
      dispatch(fetchUserProfile()).catch((error) => {
        console.error("Error fetching profile in NGODashboard:", error);
      });
    }
  }, [dispatch]);
  
  // Also fetch when profile is empty but we have a token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && (!reduxProfile.email && !reduxProfile.ngoName)) {
      dispatch(fetchUserProfile()).catch((error) => {
        console.error("Error fetching profile in NGODashboard:", error);
      });
    }
  }, [dispatch, reduxProfile.email, reduxProfile.ngoName]);

  // Check if device width is 500px or less
  useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 700);
      // On mobile, close sidebar by default
      if (width <= 500) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Check on mount
    checkWidth();

    // Listen for resize events
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Profile state (editable)
  const [profile, setProfile] = useState({
    ngoName: reduxProfile?.ngoName || "",
    ngoType: reduxProfile?.ngoType || "",
    role: reduxProfile?.role || "NGO",
    email: reduxProfile?.email || "",
    contact: reduxProfile?.contact || "",
    state: reduxProfile?.state || "",
    district: reduxProfile?.district || "",
    city: reduxProfile?.city || "",
    address: reduxProfile?.address || "",
    pincode: reduxProfile?.pincode || "",
    password: "",
    photoUrl: reduxProfile?.photoUrl || null,
    // NGO-specific fields
    registrationNumber: reduxProfile?.registrationNumber || "",
    registrationCertificateUrl: reduxProfile?.registrationCertificateUrl || null,
    latitude: reduxProfile?.latitude || null,
    longitude: reduxProfile?.longitude || null,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Update profile from Redux when it changes
  useEffect(() => {
    if (reduxProfile && (reduxProfile.email || reduxProfile.ngoName)) {
      setProfile((prev) => ({
        ...prev,
        ngoName: reduxProfile.ngoName || prev.ngoName,
        ngoType: reduxProfile.ngoType || prev.ngoType,
        role: reduxProfile.role || prev.role,
        email: reduxProfile.email || prev.email,
        contact: reduxProfile.contact || prev.contact,
        state: reduxProfile.state || prev.state,
        district: reduxProfile.district || prev.district,
        city: reduxProfile.city || prev.city,
        address: reduxProfile.address || prev.address,
        pincode: reduxProfile.pincode || prev.pincode,
        photoUrl: reduxProfile.photoUrl || prev.photoUrl,
        // NGO-specific fields
        registrationNumber: reduxProfile.registrationNumber || prev.registrationNumber || "",
        registrationCertificateUrl: reduxProfile.registrationCertificateUrl || prev.registrationCertificateUrl || null,
        latitude: reduxProfile.latitude || prev.latitude || null,
        longitude: reduxProfile.longitude || prev.longitude || null,
      }));
    }
  }, [reduxProfile]);

  // Settings
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoAccept: false,
  });

  return (
    <div
      className={`flex min-h-screen relative ${
        settings.darkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <NGOSidebar
        profile={profile}
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isMobile={isMobile}
      />

      <main className="flex-1 p-4 md:p-8">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 mr-2 cursor-pointer"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          <h1 className="text-xl md:text-2xl font-semibold flex-1">
            {activePage === "profile"
              ? "My Profile"
              : activePage === "settings"
              ? "Settings"
              : activePage === "requested"
              ? "Requested Cases"
              : activePage === "accepted"
              ? "Accepted Cases"
              : activePage === "pending"
              ? "Pending Cases"
              : "Completed Cases"}
          </h1>

          <div className="flex items-center gap-3">
            <div className="text-sm opacity-80 hidden sm:block">{profile.ngoName || "NGO"}</div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.ngoName || "NGO"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-semibold">
                  {profile.ngoName?.charAt(0) || "N"}
                </span>
              )}
            </div>
          </div>
        </div>

        <section className="space-y-6">
          {activePage === "profile" && (
            <NGOProfile
              profile={profile}
              setProfile={setProfile}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
            />
          )}
          {activePage === "settings" && (
            <NGOSettings settings={settings} setSettings={setSettings} />
          )}
          {activePage === "requested" && <RequestedCases />}
          {activePage === "accepted" && <AcceptedCases />}
          {activePage === "pending" && <PendingCases />}
          {activePage === "completed" && <CompletedCases />}
        </section>
      </main>
    </div>
  );
}
