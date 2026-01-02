import React, { useState } from "react";
import LawyerProfile from "./LawyerProfile.jsx"; // Import new profile component

export default function LawyerDashboard() {
  const [activePage, setActivePage] = useState("overview"); // overview, profile
  const [caseAccepted, setCaseAccepted] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // Mock Lawyer Profile Data (in real app, fetch from Redux/API)
  const [profile, setProfile] = useState({
    fullName: "Adv. Rahul Verma",
    email: "rahul.verma@law.com",
    mobile: "9876543210",
    specialization: "Criminal Law",
    state: "Maharashtra",
    city: "Mumbai",
    address: "Chamber 204, High Court Lane, Fort, Mumbai",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  // Case sent from citizen
  const lawyerCase = {
    id: 301,
    title: "Land Encroachment Issue",
    category: "Property Law",
    urgency: "Medium",
    location: "Mumbai",
    description:
      "My neighbour has extended construction into my land boundary. A legal notice has already been ignored. I need professional representation.",
    citizenName: "Rohit Patil",
    citizenEmail: "rohit@example.com",
    citizenPhone: "9822334455",
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-[#4B227A]">Lawyer Panel</h1>
        </div>
        <nav className="mt-4">
          <button
            onClick={() => setActivePage("overview")}
            className={`w-full text-left px-6 py-3 hover:bg-gray-100 ${activePage === 'overview' ? 'bg-[#FDB415]/20 border-r-4 border-[#FDB415]' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActivePage("profile")}
            className={`w-full text-left px-6 py-3 hover:bg-gray-100 ${activePage === 'profile' ? 'bg-[#FDB415]/20 border-r-4 border-[#FDB415]' : ''}`}
          >
            My Profile
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOP NAVBAR */}
        <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
          <h2 className="text-xl font-bold text-gray-800 ml-4 md:ml-0">
            {activePage === 'overview' ? 'Dashboard' : 'My Profile'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex justify-center items-center text-gray-700 font-semibold">
              {profile.fullName.charAt(0)}
            </div>
            <span className="font-medium text-gray-700 hidden sm:block">{profile.fullName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer text-sm"
            >
              Logout
            </button>
          </div>
        </nav>

        <main className="p-8 overflow-y-auto">

          {/* PROFILE PAGE */}
          {activePage === "profile" && (
            <LawyerProfile
              profile={profile}
              setProfile={setProfile}
              isEditing={isEditingProfile}
              setIsEditing={setIsEditingProfile}
            />
          )}

          {/* OVERVIEW DASHBOARD */}
          {activePage === "overview" && (
            <div>
              {/* STATS CARDS */}
              {!caseAccepted && (
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="font-medium text-gray-600">Active Cases</h3>
                    <p className="text-4xl font-bold text-blue-600 mt-2">
                      {caseAccepted ? 1 : 0}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="font-medium text-gray-600">Upcoming Hearings</h3>
                    <p className="text-4xl font-bold text-green-600 mt-2">0</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="font-medium text-gray-600">Unread Messages</h3>
                    <p className="text-4xl font-bold text-purple-600 mt-2">
                      {caseAccepted ? 4 : 0}
                    </p>
                  </div>
                </div>
              )}

              {/* CASE DETAILS BEFORE ACCEPTING */}
              {!caseAccepted && (
                <div className="bg-white p-8 rounded-xl shadow-xl border mb-10">
                  <h2 className="text-2xl font-bold mb-4">New Case Assigned</h2>

                  <p>
                    <strong>Case Title:</strong> {lawyerCase.title}
                  </p>
                  <p>
                    <strong>Category:</strong> {lawyerCase.category}
                  </p>
                  <p>
                    <strong>Urgency:</strong> {lawyerCase.urgency}
                  </p>
                  <p>
                    <strong>Location:</strong> {lawyerCase.location}
                  </p>

                  <div className="mt-4">
                    <strong>Description:</strong>
                    <p className="text-gray-700 mt-1">{lawyerCase.description}</p>
                  </div>

                  <div className="mt-4">
                    <strong>Citizen Name:</strong> {lawyerCase.citizenName}
                    <br />
                    <strong>Email:</strong> {lawyerCase.citizenEmail}
                    <br />
                    <strong>Phone:</strong> {lawyerCase.citizenPhone}
                  </div>

                  <button
                    onClick={() => setCaseAccepted(true)}
                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  >
                    Accept Case
                  </button>
                </div>
              )}

              {/* AFTER CASE IS ACCEPTED */}
              {caseAccepted && (
                <div className="bg-white p-8 rounded-xl shadow-xl border">
                  {/* Citizen Info */}
                  <h2 className="text-2xl font-bold mb-6">
                    Active Case — Communicate with Citizen
                  </h2>

                  <div className="bg-blue-50 p-6 rounded-lg border mb-6">
                    <h3 className="text-xl font-bold text-blue-800">
                      {lawyerCase.citizenName}
                    </h3>
                    <p>
                      <strong>Email:</strong> {lawyerCase.citizenEmail}
                    </p>
                    <p>
                      <strong>Phone:</strong> {lawyerCase.citizenPhone}
                    </p>
                    <p className="mt-2">
                      <strong>Case:</strong> {lawyerCase.title}
                    </p>
                  </div>

                  {/* CHAT HEADER + TOGGLE */}
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Chat with Citizen</h2>

                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                    >
                      {showChat ? "Minimize Chat" : "Open Chat"}
                    </button>
                  </div>

                  {/* CHAT BOX */}
                  {showChat && (
                    <div className="bg-gray-100 p-6 rounded-lg shadow-inner h-96 flex flex-col">
                      <div className="flex-1 overflow-y-auto mb-4">
                        <div className="mb-4">
                          <p className="bg-blue-200 p-2 rounded-lg inline-block mb-1">
                            Hello Lawyer, I need help regarding my land dispute.
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="bg-green-200 p-2 rounded-lg inline-block mb-1">
                            I understand. Could you share more documents and details?
                          </p>
                        </div>
                      </div>

                      {/* Chat Input */}
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="flex-1 p-3 rounded-lg border"
                        />
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
