import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth.js";
import NGOProfile from "./NGOProfile.jsx"; // Import new profile component

export default function NGODashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("overview"); // overview, profile
  const [caseAccepted, setCaseAccepted] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // Mock NGO Profile Data
  const [profile, setProfile] = useState({
    ngoName: "Helping Hands Foundation",
    email: "contact@helpinghands.org",
    contact: "022-24567890",
    ngoType: "Women & Child Safety",
    registrationNumber: "NGO/MH/2015/0045",
    state: "Maharashtra",
    city: "Mumbai",
    address: "123, Social Service Lane, Andheri West, Mumbai",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // logout(); // call if it handles other cleanup
    navigate("/login", {
      state: { success: "Logged out successfully!" },
    });
  };

  const ngoCase = {
    id: 501,
    title: "Domestic Violence & Safety Support",
    category: "Women Safety",
    urgency: "High",
    location: "Hyderabad",
    description:
      "Citizen needs immediate guidance regarding domestic violence issues. They require legal and emotional support, including police assistance and safe shelter options.",
    citizenName: "Priya Deshmukh",
    citizenEmail: "priya@example.com",
    citizenPhone: "9876001234",
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-green-700">NGO Panel</h1>
        </div>
        <nav className="mt-4">
          <button
            onClick={() => setActivePage("overview")}
            className={`w-full text-left px-6 py-3 hover:bg-gray-100 ${activePage === 'overview' ? 'bg-green-100 border-r-4 border-green-600' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActivePage("profile")}
            className={`w-full text-left px-6 py-3 hover:bg-gray-100 ${activePage === 'profile' ? 'bg-green-100 border-r-4 border-green-600' : ''}`}
          >
            My Profile
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* NAVBAR */}
        <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
          <h2 className="text-xl font-bold text-gray-800 ml-4 md:ml-0">
            {activePage === 'overview' ? 'NGO Dashboard' : 'My Profile'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex justify-center items-center font-semibold text-gray-700">
              {profile.ngoName.charAt(0)}
            </div>
            <span className="font-medium text-gray-700 hidden sm:block">{profile.ngoName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer text-sm"
            >
              Logout
            </button>
          </div>
        </nav>

        <main className="p-8 overflow-y-auto">

          {/* PROFILE PAGE */}
          {activePage === "profile" && (
            <NGOProfile
              profile={profile}
              setProfile={setProfile}
              isEditing={isEditingProfile}
              setIsEditing={setIsEditingProfile}
            />
          )}

          {/* OVERVIEW DASHBOARD */}
          {activePage === "overview" && (
            <div>
              {/* Stats Section */}
              {!caseAccepted && (
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="font-medium text-gray-600">
                      Active Support Cases
                    </h3>
                    <p className="text-4xl font-bold text-green-600 mt-2">
                      {caseAccepted ? 1 : 0}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="font-medium text-gray-600">Scheduled Visits</h3>
                    <p className="text-4xl font-bold text-blue-600 mt-2">0</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="font-medium text-gray-600">Unread Messages</h3>
                    <p className="text-4xl font-bold text-purple-600 mt-2">
                      {caseAccepted ? 5 : 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Case Details (Before acceptance) */}
              {!caseAccepted && (
                <div className="bg-white p-8 rounded-xl shadow-xl border mb-10">
                  <h2 className="text-2xl font-bold mb-4">New Support Request</h2>

                  <p>
                    <strong>Case Title:</strong> {ngoCase.title}
                  </p>
                  <p>
                    <strong>Category:</strong> {ngoCase.category}
                  </p>
                  <p>
                    <strong>Urgency:</strong> {ngoCase.urgency}
                  </p>
                  <p>
                    <strong>Location:</strong> {ngoCase.location}
                  </p>

                  <div className="mt-4">
                    <strong>Description:</strong>
                    <p className="text-gray-700 mt-1">{ngoCase.description}</p>
                  </div>

                  <div className="mt-4">
                    <strong>Citizen Name:</strong> {ngoCase.citizenName} <br />
                    <strong>Email:</strong> {ngoCase.citizenEmail} <br />
                    <strong>Phone:</strong> {ngoCase.citizenPhone}
                  </div>

                  <button
                    onClick={() => setCaseAccepted(true)}
                    className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition cursor-pointer"
                  >
                    Accept Case
                  </button>
                </div>
              )}

              {/* AFTER ACCEPTING THE CASE */}
              {caseAccepted && (
                <div className="bg-white p-8 rounded-xl shadow-xl border">
                  {/* Citizen Information */}
                  <h2 className="text-2xl font-bold mb-6">Active Support Case</h2>

                  <div className="bg-green-50 p-6 rounded-lg border mb-6">
                    <h3 className="text-xl font-bold text-green-800">
                      {ngoCase.citizenName}
                    </h3>
                    <p>
                      <strong>Email:</strong> {ngoCase.citizenEmail}
                    </p>
                    <p>
                      <strong>Phone:</strong> {ngoCase.citizenPhone}
                    </p>
                    <p className="mt-2">
                      <strong>Case:</strong> {ngoCase.title}
                    </p>
                  </div>

                  {/* CHAT BOX */}
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Chat with Citizen</h2>

                    {/* Toggle Chat Box Button */}
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                    >
                      {showChat ? "Minimize Chat" : "Open Chat"}
                    </button>
                  </div>

                  {showChat && (
                    <div className="bg-gray-100 p-6 rounded-lg shadow-inner h-96 flex flex-col">
                      {/* CHAT MESSAGES */}
                      <div className="flex-1 overflow-y-auto mb-4">
                        <div className="mb-4">
                          <p className="bg-green-200 p-2 rounded-lg inline-block mb-1">
                            Hello NGO, I need help urgently.
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="bg-blue-200 p-2 rounded-lg inline-block mb-1">
                            We are here for you. Please explain the situation.
                          </p>
                        </div>
                      </div>

                      {/* INPUT BOX */}
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="flex-1 p-3 rounded-lg border"
                        />
                        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
