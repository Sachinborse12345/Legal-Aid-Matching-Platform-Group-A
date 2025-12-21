import React, { useState, useEffect } from "react";
import { getMyCases, updateCaseStatus, getCaseDocuments, uploadDocuments, deleteDocument } from "../../api/caseApi";
import { toast } from "react-toastify";
import { FiFileText, FiUser, FiAlertCircle, FiMapPin, FiCalendar, FiEye, FiX, FiClock, FiDownload, FiCheck, FiRefreshCw, FiMessageSquare, FiSearch, FiUpload, FiTrash2 } from "react-icons/fi";

export default function CitizenMyCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDocuments, setCaseDocuments] = useState({}); // Store documents by caseId
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState({});

  // Download PDF from Cloudinary raw URL
  const downloadPdf = async (url, filename = "document.pdf") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Toggle case status between COMPLETED and PENDING
  const toggleCaseStatus = async (caseId, currentStatus) => {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await updateCaseStatus(caseId, newStatus);
      setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await getMyCases();
        setCases(res.data || []);
      } catch (err) {
        console.error("Error fetching cases:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  // Load documents when a case is selected
  useEffect(() => {
    const loadDocuments = async () => {
      if (selectedCase && selectedCase.id) {
        try {
          setIsLoadingDocuments(prev => ({ ...prev, [selectedCase.id]: true }));
          const response = await getCaseDocuments(selectedCase.id);
          if (response.data && response.data.documents) {
            setCaseDocuments(prev => ({
              ...prev,
              [selectedCase.id]: response.data.documents
            }));
          }
        } catch (error) {
          console.error("Error loading documents:", error);
          toast.error("Failed to load documents");
        } finally {
          setIsLoadingDocuments(prev => ({ ...prev, [selectedCase.id]: false }));
        }
      }
    };
    loadDocuments();
  }, [selectedCase]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_PROGRESS":
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "RESOLVED":
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f6f5] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#234f4a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f5] p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="bg-[#2f4f4f] rounded-2xl p-6 sm:p-10 mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">My Cases</h1>
        <p className="text-gray-200 text-base sm:text-lg">
          Track and manage all your submitted legal cases
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <span className="text-white text-sm">Total Cases: </span>
            <span className="text-white font-bold">{cases.length}</span>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
          <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Cases Found</h3>
          <p className="text-gray-500">
            You haven't submitted any cases yet. Start by filing a new case.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c, index) => (
            <div
              key={c.id}
              className="group bg-white rounded-xl border border-gray-200 hover:border-[#234f4a]/30 hover:shadow-md transition-all duration-300"
            >
              <div className="p-4 sm:p-5">
                {/* Top Row - Case Number, Status, Urgency */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded">
                    #{c.caseNumber || c.id}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${getUrgencyColor(c.urgency)}`}>
                    {c.urgency || "N/A"}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-medium border ${getStatusColor(c.status)}`}>
                    {c.status || "Draft"}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 hidden sm:flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {formatDate(c.updatedAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-3 line-clamp-2 group-hover:text-[#234f4a] transition-colors">
                  {c.caseTitle || "Untitled Case"}
                </h3>

                {/* Info Grid - Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-0.5">Victim</span>
                    <span className="text-gray-700 font-medium truncate">{c.victimName || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-0.5">Type</span>
                    <span className="text-gray-700 font-medium">{c.caseType || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-0.5">Location</span>
                    <span className="text-gray-700 font-medium truncate">{c.incidentPlace || "N/A"}</span>
                  </div>
                  <div className="flex flex-col sm:hidden">
                    <span className="text-xs text-gray-400 mb-0.5">Updated</span>
                    <span className="text-gray-700 font-medium">{formatDate(c.updatedAt)}</span>
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs text-gray-400 mb-0.5">Court</span>
                    <span className="text-gray-700 font-medium">{c.courtType || "N/A"}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      c.status?.toUpperCase() === "SUBMITTED" ? "bg-blue-500 animate-pulse" :
                      c.status?.toUpperCase() === "IN_PROGRESS" ? "bg-yellow-500 animate-pulse" :
                      c.status?.toUpperCase() === "RESOLVED" ? "bg-green-500" : "bg-gray-400"
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {c.status?.toUpperCase() === "SUBMITTED" ? "Awaiting review" :
                       c.status?.toUpperCase() === "IN_PROGRESS" ? "Being processed" :
                       c.status?.toUpperCase() === "RESOLVED" ? "Case resolved" : "Draft saved"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        setSelectedCase(c);
                        // Load documents for this case
                        try {
                          setIsLoadingDocuments(prev => ({ ...prev, [c.id]: true }));
                          const response = await getCaseDocuments(c.id);
                          if (response.data && response.data.documents) {
                            setCaseDocuments(prev => ({
                              ...prev,
                              [c.id]: response.data.documents
                            }));
                          }
                        } catch (error) {
                          console.error("Error loading documents:", error);
                        } finally {
                          setIsLoadingDocuments(prev => ({ ...prev, [c.id]: false }));
                        }
                      }}
                      className="p-2 text-[#234f4a] bg-[#234f4a]/10 rounded-lg hover:bg-[#234f4a]/20 active:scale-95 transition-all cursor-pointer"
                      title="View Documents"
                    >
                      <FiFileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert(`Send message for case ${c.caseNumber || c.id}`)}
                      disabled={!c.isSubmitted}
                      className={`p-2 rounded-lg active:scale-95 transition-all ${
                        c.isSubmitted 
                          ? "text-blue-600 bg-blue-100 hover:bg-blue-200 cursor-pointer" 
                          : "text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                      }`}
                      title={c.isSubmitted ? "Message" : "Submit case first"}
                    >
                      <FiMessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert(`Find Lawyers & NGOs for case ${c.caseNumber || c.id}`)}
                      disabled={!c.isSubmitted}
                      className={`p-2 md:px-3 md:py-2 rounded-lg active:scale-95 transition-all flex items-center gap-2 ${
                        c.isSubmitted 
                          ? "text-purple-600 bg-purple-100 hover:bg-purple-200 cursor-pointer" 
                          : "text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                      }`}
                      title={c.isSubmitted ? "Find Lawyers & NGOs" : "Submit case first"}
                    >
                      <FiSearch className="w-4 h-4" />
                      <span className="hidden md:inline text-sm font-medium">Find Help</span>
                    </button>
                    <button
                      onClick={() => toggleCaseStatus(c.id, c.status)}
                      disabled={!c.isSubmitted}
                      className={`p-2 md:px-3 md:py-2 rounded-lg active:scale-95 transition-all flex items-center gap-2 ${
                        !c.isSubmitted 
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed opacity-50"
                          : c.status === "COMPLETED" 
                            ? "text-green-600 bg-green-100 hover:bg-green-200 cursor-pointer" 
                            : "text-orange-600 bg-orange-100 hover:bg-orange-200 cursor-pointer"
                      }`}
                      title={!c.isSubmitted ? "Submit case first" : (c.status === "COMPLETED" ? "Mark as Pending" : "Mark as Completed")}
                    >
                      {c.status === "COMPLETED" ? <FiCheck className="w-4 h-4" /> : <FiRefreshCw className="w-4 h-4" />}
                      <span className="hidden md:inline text-sm font-medium">{c.status === "COMPLETED" ? "Completed" : "Pending"}</span>
                    </button>
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="p-2 text-white bg-[#234f4a] rounded-lg hover:bg-[#1b3d3a] active:scale-95 transition-all cursor-pointer"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
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
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#234f4a] to-[#2f6f6f] p-6 flex justify-between items-start">
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Status & Urgency */}
              <div className="flex gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(selectedCase.status)}`}>
                  Status: {selectedCase.status || "Draft"}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getUrgencyColor(selectedCase.urgency)}`}>
                  Urgency: {selectedCase.urgency || "N/A"}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[#234f4a] border-b pb-2">Case Information</h4>
                  <DetailRow label="Case Title" value={selectedCase.caseTitle} />
                  <DetailRow label="Case Type" value={selectedCase.caseType} />
                  <DetailRow label="Court Type" value={selectedCase.courtType} />
                  <DetailRow label="Specialization" value={selectedCase.specialization} />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[#234f4a] border-b pb-2">Victim Details</h4>
                  <DetailRow label="Victim Name" value={selectedCase.victimName} />
                  <DetailRow label="Relation" value={selectedCase.relation} />
                  <DetailRow label="Gender" value={selectedCase.victimGender} />
                  <DetailRow label="Age" value={selectedCase.victimAge} />
                </div>

                {/* Incident Details */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[#234f4a] border-b pb-2">Incident Details</h4>
                  <DetailRow label="Incident Date" value={formatDate(selectedCase.incidentDate)} />
                  <DetailRow label="Incident Place" value={selectedCase.incidentPlace} />
                </div>

                {/* Applicant Details */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[#234f4a] border-b pb-2">Applicant Details</h4>
                  <DetailRow label="Name" value={selectedCase.applicantName} />
                  <DetailRow label="Email" value={selectedCase.email} />
                  <DetailRow label="Mobile" value={selectedCase.mobile} />
                </div>
              </div>

              {/* Description Section */}
              {selectedCase.background && (
                <div className="mt-6">
                  <h4 className="font-bold text-[#234f4a] border-b pb-2 mb-3">Case Background</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border leading-relaxed">
                    {selectedCase.background}
                  </p>
                </div>
              )}

              {selectedCase.relief && (
                <div className="mt-4">
                  <h4 className="font-bold text-[#234f4a] border-b pb-2 mb-3">Relief Expected</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border leading-relaxed">
                    {selectedCase.relief}
                  </p>
                </div>
              )}

              {/* Documents Section */}
              <div className="mt-6">
                <h4 className="font-bold text-[#234f4a] border-b pb-2 mb-3">Documents</h4>
                
                {/* Upload New Documents */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Upload New PDF Documents
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Max file size: 2MB per file. PDF format only.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    disabled={isUploadingDocuments}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    onChange={async (e) => {
                      const files = [...e.target.files];
                      const maxSize = 2 * 1024 * 1024; // 2MB
                      const validFiles = [];
                      const errors = [];
                      
                      files.forEach(file => {
                        if (file.type !== "application/pdf") {
                          errors.push(`${file.name}: Only PDF files are allowed`);
                        } else if (file.size > maxSize) {
                          errors.push(`${file.name}: exceeds 2MB limit`);
                        } else {
                          validFiles.push(file);
                        }
                      });
                      
                      if (errors.length > 0) {
                        toast.error("Some files were rejected: " + errors.join(", "));
                      }

                      if (validFiles.length > 0) {
                        try {
                          setIsUploadingDocuments(true);
                          const response = await uploadDocuments(selectedCase.id, validFiles);
                          if (response.data && response.data.documents) {
                            setCaseDocuments(prev => ({
                              ...prev,
                              [selectedCase.id]: [
                                ...(prev[selectedCase.id] || []),
                                ...response.data.documents
                              ]
                            }));
                            toast.success(`${response.data.uploadedCount} document(s) uploaded successfully`);
                          }
                          e.target.value = "";
                        } catch (error) {
                          console.error("Error uploading documents:", error);
                          toast.error("Failed to upload documents. Please try again.");
                        } finally {
                          setIsUploadingDocuments(false);
                        }
                      }
                    }}
                  />
                  {isUploadingDocuments && (
                    <div className="text-center py-2">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-[#234f4a]"></div>
                      <p className="mt-1 text-sm text-gray-600">Uploading documents...</p>
                    </div>
                  )}
                </div>

                {/* Display Documents */}
                {isLoadingDocuments[selectedCase.id] ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#234f4a]"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading documents...</p>
                  </div>
                ) : caseDocuments[selectedCase.id] && caseDocuments[selectedCase.id].length > 0 ? (
                  <div className="space-y-2">
                    {caseDocuments[selectedCase.id].map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {doc.documentFilename || "Document"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded{" "}
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                          >
                            <FiDownload className="w-3 h-3" />
                            View
                          </a>
                          <button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this document?")) {
                                try {
                                  await deleteDocument(doc.id);
                                  setCaseDocuments(prev => ({
                                    ...prev,
                                    [selectedCase.id]: prev[selectedCase.id].filter((d) => d.id !== doc.id)
                                  }));
                                  toast.success("Document deleted successfully");
                                } catch (error) {
                                  toast.error("Failed to delete document");
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                          >
                            <FiTrash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                    <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No documents uploaded yet</p>
                    <p className="text-xs text-gray-400 mt-1">Upload PDF documents above</p>
                  </div>
                )}

                {/* Legacy Documents (if any) - for backward compatibility */}
                {selectedCase.documentsUrl && (!caseDocuments[selectedCase.id] || caseDocuments[selectedCase.id].length === 0) && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Legacy Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.documentsUrl.split(",").map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => downloadPdf(url.trim(), `case_${selectedCase.caseNumber || selectedCase.id}_document_${idx + 1}.pdf`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition"
                        >
                          <FiDownload className="w-4 h-4" />
                          Document {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="mt-6 pt-4 border-t flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>Created: {formatDate(selectedCase.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>Updated: {formatDate(selectedCase.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Detail Row Component ---------- */
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium text-gray-800 text-sm">{value || "N/A"}</span>
    </div>
  );
}
