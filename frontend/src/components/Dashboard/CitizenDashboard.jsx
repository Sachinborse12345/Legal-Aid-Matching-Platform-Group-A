// CitizenDashboard.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import { fetchUserProfile } from "../../Redux/authSlice.js";
import CitizenSidebar from "./CitizenSidebar.jsx";
import CitizenOverview from "./CitizenOverview.jsx";
import CitizenAddCase from "./CitizenAddCase.jsx";
import CitizenMyCases from "./CitizenMyCases.jsx";
import CitizenFindLawyer from "./CitizenFindLawyer.jsx";
// import CitizenFindNgo from "./CitizenFindNgo.jsx"; // Removed as merged into FindLawyer
import CitizenMessages from "./CitizenMessages.jsx";
import CitizenProfile from "./CitizenProfile.jsx";
import CitizenSettings from "./CitizenSettings.jsx";
import ProfileModal from "./ProfileModal.jsx"; // New Modal Import

// Helper to check type
const isLawyer = (item) => item.type === "LAWYER";

export default function CitizenDashboard() {
  const dispatch = useDispatch();
  const { profile: reduxProfile, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // overview | cases | findLawyer | findNgo | messages | profile | settings | addcase
  const [activePage, setActivePage] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // directory data from backend
  const [lawyers, setLawyers] = useState([]);
  const [ngos, setNgos] = useState([]);

  // Sample cases (can later come from API)
  const [cases] = useState([
    {
      id: 1,
      title: "Land dispute with neighbor",
      status: "Open",
      summary: "Dispute over boundary after construction.",
      date: "2025-10-01",
    },
  ]);

  // Messages state
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  // Profile Viewer State
  const [viewingProfile, setViewingProfile] = useState(null); // { item, type } or null

  // Profile (editable)
  const [profile, setProfile] = useState({
    shortName: reduxProfile?.shortName || reduxProfile?.fullName || "",
    fullName: reduxProfile?.fullName || "",
    role: reduxProfile?.role || "CITIZEN",
    aadhaar: reduxProfile?.aadhaar || "",
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
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    shareProfile: false,
  });

  // Device width → mobile / desktop
  useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 700);
      if (width <= 500) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  // Load profile from Redux when it changes
  useEffect(() => {
    if (reduxProfile && (reduxProfile.email || reduxProfile.fullName)) {
      setProfile((prev) => ({
        ...prev,
        ...reduxProfile,
        shortName: reduxProfile.shortName || reduxProfile.fullName || prev.shortName,
      }));
    }
  }, [reduxProfile]);

  // Fetch lawyers + NGOs from backend
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/lawyers");
        setLawyers(res.data);
      } catch (e) {
        console.error("Failed to load lawyers", e);
      }
    };

    const fetchNgos = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/ngos");
        setNgos(res.data);
      } catch (e) {
        console.error("Failed to load NGOs", e);
      }
    };

    fetchLawyers();
    fetchNgos();
  }, []);

  // Send message handler
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedRecipient) return;
    const newMsg = {
      id: messages.length + 1,
      to: selectedRecipient.name,
      from: profile.shortName,
      text: messageText.trim(),
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setMessages((m) => [...m, newMsg]);
    setMessageText("");
  };

  const handleCreateMessage = (recipientProfile) => {
    // Logic from Directory to start messaging a specific person
    setActivePage("messages");
    setSelectedRecipient({
      type: recipientProfile.type || (recipientProfile.role === 'LAWYER' ? 'lawyer' : 'ngo'),
      id: recipientProfile.id,
      name: recipientProfile.name || recipientProfile.fullName || recipientProfile.ngoName
    });
  };

  return (
    <div
      className={`flex min-h-screen relative ${settings.darkMode
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-gray-900"
        }`}
    >
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <CitizenSidebar
        profile={profile}
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isMobile={isMobile}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
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
            {activePage === "overview"
              ? "Overview"
              : activePage === "cases"
                ? "My Cases"
                : activePage === "find"
                  ? "Find Lawyer & NGOs"
                  : activePage === "messages"
                    ? "Messages"
                    : activePage === "profile"
                      ? "My Profile"
                      : activePage === "addcase"
                        ? "Add Your Case"
                        : "Settings"}
          </h1>

          <div className="flex items-center gap-3">
            <div className="text-sm opacity-80 hidden sm:block">
              {profile.shortName || profile.fullName || "User"}
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.shortName || profile.fullName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-semibold">
                  {profile.shortName?.charAt(0) ||
                    profile.fullName?.charAt(0) ||
                    "U"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main content switch */}
        <section className="space-y-6 pb-20">
          {activePage === "overview" && <CitizenOverview />}

          {activePage === "addcase" && <CitizenAddCase />}

          {activePage === "cases" && <CitizenMyCases cases={cases} />}

          {activePage === "find" && (
            <CitizenFindLawyer
              setActivePage={setActivePage}
              setSelectedRecipient={setSelectedRecipient}
              onViewProfile={(item, type) => {
                // Normalize item for modal
                setViewingProfile({
                  ...item,
                  type: type,
                  name: item.name, // DirectoryEntry uses 'name', not fullName/ngoName
                  // Map other fields if needed, but ProfileModal should handle common fields
                  specialization: item.specialization,
                  city: item.city,
                  state: item.state,
                  mobile: item.contactPhone,
                  email: item.contactEmail,
                  isVerified: item.verified,
                  bio: isLawyer(item) ? "Practicing Lawyer" : "Non-Governmental Organization" // Placeholder bio if missing
                });
              }}
            />
          )}

          {/* Removed separate FindNgo, now merged into FindLawyer */}

          {activePage === "messages" && (
            <CitizenMessages
              lawyers={lawyers}
              selectedRecipient={selectedRecipient}
              setSelectedRecipient={setSelectedRecipient}
              messages={messages}
              messageText={messageText}
              setMessageText={setMessageText}
              handleSendMessage={handleSendMessage}
              profile={profile}
            />
          )}

          {activePage === "profile" && (
            <CitizenProfile
              profile={profile}
              setProfile={setProfile}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
            />
          )}

          {activePage === "settings" && (
            <CitizenSettings settings={settings} setSettings={setSettings} />
          )}
        </section>
      </main>

      {/* Modal Layer */}
      {viewingProfile && (
        <ProfileModal
          profile={viewingProfile}
          onClose={() => setViewingProfile(null)}
          onMessage={handleCreateMessage}
        />
      )}

    </div>
  );
}
