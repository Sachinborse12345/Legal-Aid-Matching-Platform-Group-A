import React, { useState, useEffect } from "react";
import { getMyCases, updateCaseStatus } from "../../api/caseApi";
import { FiFileText, FiUser, FiAlertCircle, FiMapPin, FiCalendar, FiEye, FiX, FiClock, FiDownload, FiCheck, FiRefreshCw, FiMessageSquare, FiSearch } from "react-icons/fi";

export default function CitizenMyCases({ onViewMatches }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

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
        console.log("DEBUG: CitizenMyCases.jsx - Fetched Cases:", res.data);
        setCases(res.data || []);
      } catch (err) {
        console.error("Error fetching cases:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case "SUBMITTED":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50";
      case "IN_PROGRESS":
      case "PENDING":
        return "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30";
      case "RESOLVED":
      case "COMPLETED":
        return "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50";
      case "CLOSED":
        return "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-50 dark:bg-[#111] text-gray-400 dark:text-gray-600 border-gray-100 dark:border-[#222]";
    }
  };

  const getUrgencyStyles = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return "text-red-500 font-black";
      case "medium":
        return "text-orange-400 font-bold";
      case "low":
        return "text-green-500 font-medium";
      default:
        return "text-gray-500";
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
      <div className="min-h-screen bg-transparent dark:bg-[#0a0a0a] p-6 flex flex-col items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest transition-colors">Accessing Records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-10 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl p-8 sm:p-12 mb-10 relative overflow-hidden group shadow-2xl transition-colors">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-all">
          <FiFileText size={120} className="text-[#D4AF37]" />
        </div>
        <div className="relative z-10">
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Case Management</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-white font-serif mb-4 tracking-tight">Case Repository</h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            A secure environment to monitor, audit, and manage your legal proceedings.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl px-6 py-3 flex items-center gap-3 shadow-inner transition-colors">
              <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest transition-colors">Active Archives</span>
              <span className="text-[#D4AF37] font-serif text-2xl font-bold leading-none">{cases.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl p-20 text-center max-w-2xl mx-auto shadow-2xl transition-colors">
          <FiFileText className="w-20 h-20 text-gray-200 dark:text-gray-800 mx-auto mb-8 opacity-20 transition-colors" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-serif mb-3 tracking-tight transition-colors">Dossier Required</h3>
          <p className="text-gray-400 dark:text-gray-600 text-sm font-medium tracking-wide transition-colors">
            No active cases found in your encrypted repository.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {cases.map((c, index) => (
            <div
              key={c.id}
              className="group bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#333] hover:border-[#D4AF37]/50 shadow-xl transition-all duration-500 overflow-hidden transition-colors"
            >
              <div className="p-6 sm:p-8">
                {/* Top Row */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="text-[10px] font-black bg-gray-50 dark:bg-[#252525] text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1.5 rounded uppercase tracking-[0.2em] shadow-inner transition-colors">
                    Record ID: {c.caseNumber || c.id}
                  </span>
                  <span className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-[0.2em] ${getUrgencyStyles(c.urgency)}`}>
                    Urgency: {c.urgency || "STANDARD"}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg ${getStatusStyles(c.status)}`}>
                    {c.status || "Draft"}
                  </span>
                  <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest bg-gray-50 dark:bg-[#111] px-4 py-2 rounded-full border border-gray-100 dark:border-[#222] transition-colors">
                    <FiCalendar className="w-3 h-3 text-[#D4AF37]" />
                    {formatDate(c.updatedAt)}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white font-serif text-xl sm:text-2xl mb-6 tracking-tight group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                  {c.caseTitle || "Unnamed Proceeding"}
                </h3>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] transition-colors">Subject</span>
                    <span className="text-gray-700 dark:text-gray-300 font-bold text-sm truncate uppercase tracking-widest transition-colors">{c.victimName || "Not Disclosed"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] transition-colors">Classification</span>
                    <span className="text-gray-700 dark:text-gray-300 font-bold text-sm uppercase tracking-widest transition-colors">{c.caseType || "Pending"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] transition-colors">Regional Hub</span>
                    <span className="text-gray-700 dark:text-gray-300 font-bold text-sm truncate uppercase tracking-widest transition-colors">{c.incidentPlace || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] transition-colors">Judicial Tier</span>
                    <span className="text-gray-700 dark:text-gray-300 font-bold text-sm uppercase tracking-widest transition-colors">{c.courtType || "District"}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center justify-between pt-6 border-t border-gray-100 dark:border-[#333] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_rgba(255,255,255,0.2)] ${c.status?.toUpperCase() === "SUBMITTED" ? "bg-blue-500 animate-pulse" :
                      c.status?.toUpperCase() === "IN_PROGRESS" ? "bg-[#D4AF37] animate-pulse" :
                        c.status?.toUpperCase() === "RESOLVED" ? "bg-green-500" : "bg-gray-400 dark:bg-gray-600"
                      } transition-colors`}></div>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] transition-colors">
                      {c.status?.toUpperCase() === "SUBMITTED" ? "Verification In-Progress" :
                        c.status?.toUpperCase() === "IN_PROGRESS" ? "Active Consultation" :
                          c.status?.toUpperCase() === "RESOLVED" ? "Case Finalized" : "Draft Status"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {c.documentsUrl && (
                      <button
                        onClick={() => downloadPdf(c.documentsUrl.split(",")[0], `case_${c.caseNumber || c.id}_document.pdf`)}
                        className="p-3 bg-[#252525] border border-[#333] text-[#D4AF37] rounded-xl hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] active:scale-95 transition-all cursor-pointer shadow-lg"
                        title="Download Dossier"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => alert(`Priority communication channel for case ${c.caseNumber || c.id}`)}
                      disabled={!c.isSubmitted}
                      className={`p-3 rounded-xl active:scale-95 transition-all shadow-lg ${c.isSubmitted
                        ? "text-blue-400 bg-blue-950/20 border border-blue-900/50 hover:bg-blue-900/40 cursor-pointer"
                        : "text-gray-600 bg-[#1a1a1a] border border-[#333] cursor-not-allowed grayscale opacity-30"
                        }`}
                      title="Direct Consultant Communication"
                    >
                      <FiMessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewMatches && onViewMatches(c.id)}
                      disabled={!c.isSubmitted}
                      className={`px-5 py-3 rounded-xl active:scale-95 transition-all flex items-center gap-3 shadow-lg ${c.isSubmitted
                        ? "text-white bg-indigo-950 border border-indigo-900 hover:bg-indigo-900 cursor-pointer"
                        : "text-gray-600 bg-[#1a1a1a] border border-[#333] cursor-not-allowed grayscale opacity-30"
                        }`}
                    >
                      <FiSearch className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Find Counsel</span>
                    </button>
                    <button
                      onClick={() => toggleCaseStatus(c.id, c.status)}
                      disabled={!c.isSubmitted}
                      className={`px-5 py-3 rounded-xl active:scale-95 transition-all flex items-center gap-3 shadow-lg ${!c.isSubmitted
                        ? "text-gray-600 bg-[#1a1a1a] border border-[#333] cursor-not-allowed grayscale opacity-30"
                        : c.status === "COMPLETED"
                          ? "text-green-400 bg-green-950 border border-green-900 hover:bg-green-900 cursor-pointer"
                          : "text-orange-400 bg-orange-950/20 border border-orange-900/50 hover:bg-orange-900/20 cursor-pointer"
                        }`}
                    >
                      {c.status === "COMPLETED" ? <FiCheck className="w-4 h-4" /> : <FiRefreshCw className="w-4 h-4" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{c.status === "COMPLETED" ? "Resolved" : "Active"}</span>
                    </button>
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-6 py-3 text-black bg-[#D4AF37] rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#c5a059] active:scale-95 transition-all cursor-pointer shadow-xl shadow-[#D4AF37]/10 flex items-center gap-2"
                    >
                      <FiEye className="w-4 h-4" />
                      View Dossier
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
        <div className="fixed inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-5xl rounded-2xl border border-gray-200 dark:border-[#333] shadow-3xl overflow-hidden max-h-[90vh] flex flex-col relative transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]"></div>

            {/* Modal Header */}
            <div className="bg-[#111] p-8 border-b border-[#333] flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#252525] border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-inner">
                  <FiFileText size={32} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-1 block">Full Case Disclosure</span>
                  <h3 className="text-3xl font-bold text-white font-serif tracking-tight">
                    {selectedCase.caseNumber || `RECORD #${selectedCase.id}`}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-600 hover:text-white hover:bg-white/5 p-3 rounded-full transition-all group"
              >
                <FiX className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 sm:p-12 overflow-y-auto flex-1 custom-scrollbar space-y-12 bg-[#0d0d0d]">
              {/* Status Header */}
              <div className="flex flex-wrap gap-4">
                <div className={`px-6 py-2 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-lg ${getStatusStyles(selectedCase.status)}`}>
                  Status: {selectedCase.status || "DRAFT ARCHIVE"}
                </div>
                <div className={`px-6 py-2 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-lg ${selectedCase.urgency?.toLowerCase() === 'high' ? 'bg-red-950/20 text-red-500 border-red-900/50' : 'bg-[#1a1a1a] text-gray-400 border-[#333]'
                  }`}>
                  Urgency: {selectedCase.urgency || "STANDARD"}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid md:grid-cols-2 gap-16">
                {/* Section 1 */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-[#333] pb-4">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                    <h4 className="font-bold text-white font-serif text-lg tracking-wide">Case Framework</h4>
                  </div>
                  <div className="space-y-4">
                    <DetailRow label="Designation" value={selectedCase.caseTitle} />
                    <DetailRow label="Classification" value={selectedCase.caseType} />
                    <DetailRow label="Judicial Tier" value={selectedCase.courtType} />
                    <DetailRow label="Required Expertise" value={selectedCase.specialization} />
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-[#333] pb-4">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                    <h4 className="font-bold text-white font-serif text-lg tracking-wide">Subject Profile</h4>
                  </div>
                  <div className="space-y-4">
                    <DetailRow label="Legal Name" value={selectedCase.victimName} />
                    <DetailRow label="Relationship" value={selectedCase.relation} />
                    <DetailRow label="Gender Profile" value={selectedCase.victimGender} />
                    <DetailRow label="Validated Age" value={selectedCase.victimAge} />
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-[#333] pb-4">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                    <h4 className="font-bold text-white font-serif text-lg tracking-wide">Incident Log</h4>
                  </div>
                  <div className="space-y-4">
                    <DetailRow label="Temporal Data" value={formatDate(selectedCase.incidentDate)} />
                    <DetailRow label="Spatial Hub" value={selectedCase.incidentPlace} />
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-[#333] pb-4">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                    <h4 className="font-bold text-white font-serif text-lg tracking-wide">Petitioner Credentials</h4>
                  </div>
                  <div className="space-y-4">
                    <DetailRow label="Authorized Name" value={selectedCase.applicantName} />
                    <DetailRow label="Digital ID" value={selectedCase.email} />
                    <DetailRow label="Verified Contact" value={selectedCase.mobile} />
                  </div>
                </div>
              </div>

              {/* Narrative Blocks */}
              <div className="space-y-8 pt-6">
                {selectedCase.background && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#D4AF37] text-[10px] uppercase tracking-[0.3em]">Analytical Background</h4>
                    <p className="text-gray-400 bg-[#111] p-6 rounded-2xl border border-[#222] italic leading-relaxed text-sm font-medium">
                      "{selectedCase.background}"
                    </p>
                  </div>
                )}

                {selectedCase.relief && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#D4AF37] text-[10px] uppercase tracking-[0.3em]">Sought Redress</h4>
                    <p className="text-white bg-[#1a1a1a] p-6 rounded-2xl border border-[#D4AF37]/20 leading-relaxed text-sm font-bold tracking-wide">
                      {selectedCase.relief}
                    </p>
                  </div>
                )}
              </div>

              {/* Secure Assets */}
              {selectedCase.documentsUrl && (
                <div className="space-y-6 pt-6">
                  <h4 className="font-bold text-[#D4AF37] text-[10px] uppercase tracking-[0.3em]">Encrypted Assets</h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedCase.documentsUrl.split(",").map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => downloadPdf(url.trim(), `case_${selectedCase.caseNumber || selectedCase.id}_document_${idx + 1}.pdf`)}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-[#252525] border border-[#333] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all shadow-xl"
                      >
                        <FiDownload className="w-4 h-4 text-[#D4AF37]" />
                        Dossier Item {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Log */}
              <div className="mt-12 pt-8 border-t border-[#333] flex flex-wrap items-center gap-10">
                <div className="flex items-center gap-3 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                  <FiClock className="w-4 h-4 text-[#D4AF37]/50" />
                  <span>Petitioner Ingress: {formatDate(selectedCase.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                  <FiClock className="w-4 h-4 text-[#D4AF37]/50" />
                  <span>Administrative Sync: {formatDate(selectedCase.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#333] p-8 bg-[#111] flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-10 py-3.5 bg-white/5 text-gray-400 border border-[#333] rounded-xl font-bold uppercase text-[10px] tracking-widest hover:text-white hover:bg-white/10 transition-all active:scale-95"
              >
                Exit Secure View
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
    <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-[#222] group hover:border-[#D4AF37]/30 transition-all transition-colors text-right">
      <span className="text-gray-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">{label}</span>
      <span className="font-bold text-gray-900 dark:text-gray-300 text-sm tracking-wide group-hover:text-[#D4AF37] dark:group-hover:text-white transition-colors">{value || "DECLINED"}</span>
    </div>
  );
}
