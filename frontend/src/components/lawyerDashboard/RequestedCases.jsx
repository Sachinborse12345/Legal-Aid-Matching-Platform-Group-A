import React, { useState, useEffect } from "react";
import { FiFileText, FiUser, FiMapPin, FiCalendar, FiEye, FiCheck, FiX } from "react-icons/fi";

export default function RequestedCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    // const fetchRequestedCases = async () => {
    //   try {
    //     const res = await getRequestedCases();
    //     setCases(res.data || []);
    //   } catch (err) {
    //     console.error("Error fetching requested cases:", err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchRequestedCases();
    
    // Sample data for now
    setTimeout(() => {
      setCases([
        {
          id: 1,
          caseNumber: "CASE-001",
          caseTitle: "Land Dispute Case",
          citizenName: "John Doe",
          citizenEmail: "john@example.com",
          citizenPhone: "9876543210",
          category: "Property Law",
          urgency: "High",
          location: "Mumbai",
          description: "My neighbour has extended construction into my land boundary.",
          requestedAt: "2025-01-15",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-orange-100 text-orange-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleAcceptCase = (caseId) => {
    // TODO: Implement API call to accept case
    alert(`Case ${caseId} accepted`);
    setCases(cases.filter((c) => c.id !== caseId));
  };

  const handleRejectCase = (caseId) => {
    // TODO: Implement API call to reject case
    alert(`Case ${caseId} rejected`);
    setCases(cases.filter((c) => c.id !== caseId));
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requested cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-teal-900 rounded-2xl p-6 sm:p-10 mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Requested Cases</h1>
        <p className="text-gray-200 text-base sm:text-lg">
          Cases that have been requested to you
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <span className="text-white text-sm">Total Requests: </span>
            <span className="text-white font-bold">{cases.length}</span>
          </div>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
          <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requested Cases</h3>
          <p className="text-gray-500">
            You don't have any case requests at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-300"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded">
                    #{c.caseNumber || c.id}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${getUrgencyColor(c.urgency)}`}>
                    {c.urgency || "N/A"}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 hidden sm:flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {formatDate(c.requestedAt)}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-3">
                  {c.caseTitle || "Untitled Case"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{c.citizenName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{c.location}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Category: </span>
                    <span className="text-gray-700 font-medium">{c.category}</span>
                  </div>
                </div>

                {c.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Requested on {formatDate(c.requestedAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="p-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition cursor-pointer"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAcceptCase(c.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer flex items-center gap-2"
                    >
                      <FiCheck className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectCase(c.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer flex items-center gap-2"
                    >
                      <FiX className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 p-6 flex justify-between items-start">
              <div>
                <p className="text-white/70 text-sm">Case Number</p>
                <h3 className="text-2xl font-bold text-white">
                  {selectedCase.caseNumber || `#${selectedCase.id}`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-teal-700 border-b pb-2">Case Information</h4>
                  <DetailRow label="Case Title" value={selectedCase.caseTitle} />
                  <DetailRow label="Category" value={selectedCase.category} />
                  <DetailRow label="Urgency" value={selectedCase.urgency} />
                  <DetailRow label="Location" value={selectedCase.location} />
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-teal-700 border-b pb-2">Citizen Details</h4>
                  <DetailRow label="Name" value={selectedCase.citizenName} />
                  <DetailRow label="Email" value={selectedCase.citizenEmail} />
                  <DetailRow label="Phone" value={selectedCase.citizenPhone} />
                </div>
              </div>

              {selectedCase.description && (
                <div className="mt-6">
                  <h4 className="font-bold text-teal-700 border-b pb-2 mb-3">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border leading-relaxed">
                    {selectedCase.description}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  handleRejectCase(selectedCase.id);
                  setSelectedCase(null);
                }}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleAcceptCase(selectedCase.id);
                  setSelectedCase(null);
                }}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Accept Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium text-gray-800 text-sm">{value || "N/A"}</span>
    </div>
  );
}

