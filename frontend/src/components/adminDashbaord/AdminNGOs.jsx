import React, { useState, useEffect } from "react";
import { FiSearch, FiUsers, FiMapPin, FiFileText } from "react-icons/fi";
import axios from "axios";

export default function AdminNGOs() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchNGOs();
  }, [page]);

  const fetchNGOs = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/ngos", {
        params: { page, size: pageSize }
      });
      // Assuming backend returns paginated response
      if (response.data.content) {
        setNgos(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        // Fallback for non-paginated response
        setNgos(response.data);
      }
    } catch (error) {
      console.error("Error fetching NGOs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/ngos/${id}/approve`);
      // Update local state
      setNgos(ngos.map(n => n.id === id ? { ...n, isApproved: true } : n));
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Failed to approve NGO");
    }
  };

  const filteredNGOs = ngos.filter(
    (n) =>
      n.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.ngoType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All NGOs</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search NGOs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#AAAAAA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B227A]"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading NGOs...</p>
        ) : filteredNGOs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No NGOs found</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredNGOs.map((ngo) => (
              <div
                key={ngo.id}
                className="border border-[#AAAAAA] rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FDB415]/20 rounded-full flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-[#4B227A]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg mb-1">{ngo.ngoName}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedNGO(ngo)}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                        >
                          View Details
                        </button>
                        {!ngo.isApproved && (
                          <button
                            onClick={() => handleApprove(ngo.id)}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ngo.email}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <FiFileText className="w-4 h-4" />
                      <span>{ngo.ngoType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <FiMapPin className="w-4 h-4" />
                      <span>{`${ngo.city}, ${ngo.state}`}</span>
                    </div>
                    {ngo.verificationStatus && (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                        Verified
                      </span>
                    )}
                    {ngo.isApproved ? (
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-50 text-blue-600 border border-blue-200">
                        Approved
                      </span>
                    ) : (
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2"
            >
              ← Previous
            </button>

            <span className="text-sm font-medium text-gray-600">
              Page {page + 1} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* NGO Details Modal */}
      {selectedNGO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-[#4B227A]">NGO Details</h2>
              <button
                onClick={() => setSelectedNGO(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <span className="text-xl font-bold">&times;</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">NGO Name</label>
                  <p className="font-semibold">{selectedNGO.ngoName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-semibold">{selectedNGO.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mobile Number</label>
                  <p className="font-semibold">{selectedNGO.mobileNum || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Verification Status</label>
                  <label className="text-sm text-gray-500">Verification Status</label>
                  <div>
                    {selectedNGO.verificationStatus && (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 mr-2">
                        Verified
                      </span>
                    )}

                    {selectedNGO.isApproved ? (
                      <span className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-600 border border-blue-200">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Organization Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Type</label>
                    <p className="font-semibold">{selectedNGO.ngoType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Registration Number</label>
                    <p className="font-semibold">{selectedNGO.registrationNumber || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Website</label>
                    <p className="font-semibold">{selectedNGO.websiteUrl ? <a href={selectedNGO.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selectedNGO.websiteUrl}</a> : "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Address</h3>
                <p className="text-gray-700">{selectedNGO.address}</p>
                <p className="text-gray-700">{`${selectedNGO.city}, ${selectedNGO.district}, ${selectedNGO.state}`}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-gray-700 text-sm">{selectedNGO.description || "No description provided."}</p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button
                  onClick={() => setSelectedNGO(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {!selectedNGO.isApproved && (
                  <button
                    onClick={() => {
                      handleApprove(selectedNGO.id);
                      setSelectedNGO(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Approve NGO
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
