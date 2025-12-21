import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfile } from "../../Redux/authSlice.js";
import LawyerSidebar from "./LawyerSidebar.jsx";
import LawyerProfile from "./LawyerProfile.jsx";
import LawyerSettings from "./LawyerSettings.jsx";
import RequestedCases from "./RequestedCases.jsx";
import AcceptedCases from "./AcceptedCases.jsx";
import PendingCases from "./PendingCases.jsx";
import CompletedCases from "./CompletedCases.jsx";

export default function LawyerDashboard() {
  const dispatch = useDispatch();
  const { profile: reduxProfile, isAuthenticated, isLoading: isFetchingProfile } = useSelector((state) => state.auth);
  
  const [activePage, setActivePage] = useState("profile"); // profile | settings | requested | accepted | pending | completed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track if we've already attempted to fetch to prevent duplicate requests
  const hasFetchedRef = useRef(false);

  // Fetch profile data only once on mount if not already loaded
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const hasProfileData = reduxProfile && (reduxProfile.email || reduxProfile.fullName);
    
    // Only fetch if we have a token, don't have profile data, not already fetching, and haven't fetched yet
    if (token && !hasProfileData && !isFetchingProfile && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchUserProfile()).catch((error) => {
        console.error("Error fetching profile in LawyerDashboard:", error);
        hasFetchedRef.current = false; // Reset on error so we can retry
      });
    }
  }, [dispatch]); // Only run once on mount - don't depend on reduxProfile or isFetchingProfile to avoid loops

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
    shortName: reduxProfile?.shortName || reduxProfile?.fullName || "",
    fullName: reduxProfile?.fullName || "",
    role: reduxProfile?.role || "LAWYER",
    email: reduxProfile?.email || "",
    mobile: reduxProfile?.mobile || "",
    dob: reduxProfile?.dob || "",
    state: reduxProfile?.state || "",
    district: reduxProfile?.district || "",
    city: reduxProfile?.city || "",
    address: reduxProfile?.address || "",
    password: "",
    photo: null,
    photoUrl: reduxProfile?.photoUrl || null,
    // Lawyer-specific fields
    aadhaar: reduxProfile?.aadhaar || "",
    barCouncilId: reduxProfile?.barCouncilId || "",
    barState: reduxProfile?.barState || "",
    specialization: reduxProfile?.specialization || "",
    experienceYears: reduxProfile?.experienceYears || "",
    aadharProofUrl: reduxProfile?.aadharProofUrl || null,
    barCertificateUrl: reduxProfile?.barCertificateUrl || null,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Update profile from Redux when it changes
  useEffect(() => {
    if (reduxProfile && (reduxProfile.email || reduxProfile.fullName)) {
      setProfile((prev) => ({
        ...prev,
        shortName: reduxProfile.shortName || reduxProfile.fullName || prev.shortName,
        fullName: reduxProfile.fullName || prev.fullName,
        role: reduxProfile.role || prev.role,
        email: reduxProfile.email || prev.email,
        mobile: reduxProfile.mobile || prev.mobile,
        dob: reduxProfile.dob || prev.dob,
        state: reduxProfile.state || prev.state,
        district: reduxProfile.district || prev.district,
        city: reduxProfile.city || prev.city,
        address: reduxProfile.address || prev.address,
        photoUrl: reduxProfile.photoUrl || prev.photoUrl,
        // Lawyer-specific fields
        aadhaar: reduxProfile.aadhaar || prev.aadhaar || "",
        barCouncilId: reduxProfile.barCouncilId || prev.barCouncilId || "",
        barState: reduxProfile.barState || prev.barState || "",
        specialization: reduxProfile.specialization || prev.specialization || "",
        experienceYears: reduxProfile.experienceYears || prev.experienceYears || "",
        aadharProofUrl: reduxProfile.aadharProofUrl || prev.aadharProofUrl || null,
        barCertificateUrl: reduxProfile.barCertificateUrl || prev.barCertificateUrl || null,
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
      <LawyerSidebar
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
            <div className="text-sm opacity-80 hidden sm:block">{profile.shortName || profile.fullName || "Lawyer"}</div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.shortName || profile.fullName || "Lawyer"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {!profile.photoUrl && (
                <span className="text-gray-600 font-semibold">
                  {profile.shortName?.charAt(0) || profile.fullName?.charAt(0) || "L"}
                </span>
              )}
            </div>
          </div>
        </div>

        <section className="space-y-6">
          {activePage === "profile" && (
            <LawyerProfile
              profile={profile}
              setProfile={setProfile}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
            />
          )}
          {activePage === "settings" && (
            <LawyerSettings settings={settings} setSettings={setSettings} />
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
