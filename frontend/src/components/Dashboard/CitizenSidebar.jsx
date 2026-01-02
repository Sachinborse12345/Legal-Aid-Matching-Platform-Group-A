import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, fetchUserProfile } from "../../Redux/authSlice.js";
import appLogo from "../../assets/LOGO.png"; // adjust path if needed

export default function CitizenSidebar({
  profile: propProfile,
  activePage,
  setActivePage,
  isOpen,
  onClose,
  isMobile,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get profile data from Redux store
  const { profile: reduxProfile, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Fetch profile from backend on mount/refresh if not already loaded
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (
      token &&
      isAuthenticated &&
      !reduxProfile.email &&
      !reduxProfile.fullName
    ) {
      // Only fetch if we have a token but no profile data
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, reduxProfile.email, reduxProfile.fullName]);

  // Use Redux profile if available, otherwise fall back to prop
  const profile =
    reduxProfile && (reduxProfile.email || reduxProfile.fullName)
      ? {
        shortName:
          reduxProfile.shortName ||
          reduxProfile.fullName ||
          propProfile?.shortName ||
          "",
        fullName: reduxProfile.fullName || propProfile?.fullName || "",
        photoUrl: reduxProfile.photoUrl || propProfile?.photoUrl || null,
      }
      : propProfile || {
        shortName: "",
        fullName: "",
        photoUrl: null,
      };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login", {
      state: { success: "Logged out successfully!" },
    });
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      onClose();
    }
  };

  return (
    <aside
      className={`${isMobile
          ? "fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out"
          : "relative w-72"
        } ${isMobile
          ? isOpen
            ? "translate-x-0"
            : "-translate-x-full"
          : "translate-x-0"
        } bg-teal-900 text-white flex flex-col p-6`}
    >
      {/* Close Button for Mobile */}
      {isMobile && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-teal-800 text-white cursor-pointer"
          aria-label="Close sidebar"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <div className="flex items-center gap-3 pb-4 border-b border-teal-700">
        <div className="w-12 h-12 bg-white/10 rounded-md flex items-center justify-center">
          <img
            src={appLogo}
            alt="AdvoCare Logo"
            className="w-8 h-8 object-contain"
          />
        </div>

        <div>
          <div className="text-sm opacity-90">AdvoCare</div>
          <div className="text-xs opacity-80">Legal Aid Platform</div>
        </div>
      </div>

      <div className="mt-6 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center font-semibold overflow-hidden border-2 border-teal-600">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.shortName || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {profile.shortName?.charAt(0) ||
                profile.fullName?.charAt(0) ||
                "S"}
            </span>
          )}
        </div>
        <div>
          <div className="font-semibold">
            {profile.shortName || profile.fullName || "User"}
          </div>
          <div className="text-xs opacity-80">Citizen</div>
        </div>
      </div>

      <nav className="flex-1">
        {[
          { key: "overview", label: "Overview" },
          { key: "addcase", label: "Add Your Case" },
          { key: "cases", label: "My Cases" },
          { key: "find", label: "Find Lawyer & NGOs" },
          { key: "messages", label: "Messages" },
          { key: "profile", label: "Profile" },
          { key: "settings", label: "Settings" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavClick(item.key)}
            className={`w-full text-left px-3 py-3 rounded-md mb-2 transition-colors cursor-pointer ${activePage === item.key ? "bg-teal-800" : "hover:bg-teal-800/60"
              }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-teal-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-white cursor-pointer"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
