import React, { useState, useEffect } from "react";
import { getMatches } from "../../api/caseApi";
import { FiUser, FiMessageSquare, FiMapPin, FiAward, FiStar, FiArrowLeft, FiShield } from "react-icons/fi";
import { createSession } from "../../api/chatApi";
import { toast } from "sonner";

export default function CitizenMatches({ caseId, setActivePage, setSelectedRecipient, onBookAppointment, onBack, appointments = [] }) {
    const [matches, setMatches] = useState({ lawyers: [], ngos: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("lawyers");

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await getMatches(caseId);
                const data = res.data;
                // Normalize name field
                if (data.lawyers) data.lawyers = data.lawyers.map(l => ({ ...l, name: l.fullName }));
                if (data.ngos) data.ngos = data.ngos.map(n => ({ ...n, name: n.ngoName }));
                setMatches(data);
            } catch (err) {
                console.error("Error fetching matches:", err);
            } finally {
                setLoading(false);
            }
        };
        if (caseId) fetchMatches();
    }, [caseId]);

    const handleStartChat = async (provider, role) => {
        try {
            const res = await createSession(caseId, provider.id, role.toUpperCase());
            const session = res.data;

            setSelectedRecipient({
                type: role,
                id: provider.id,
                name: provider.name,
                sessionId: session.id
            });
            setActivePage("messages");
        } catch (err) {
            console.error("Error starting chat:", err);
            toast.error("Failed to start chat session.");
        }
    };

    if (loading) {
        return (
            <div className="p-20 text-center flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#333] transition-colors">
                <div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-bold text-gray-600 dark:text-gray-500 uppercase tracking-[0.3em] transition-colors">Querying Verified Network...</p>
            </div>
        );
    }

    const lawyers = matches.lawyers || [];
    const ngos = matches.ngos || [];

    return (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#333] p-10 shadow-2xl relative font-sans transition-colors duration-300">
            <button
                onClick={onBack}
                className="text-[10px] font-bold text-[#D4AF37] hover:text-gray-900 dark:hover:text-white uppercase tracking-widest mb-8 flex items-center gap-2 transition-colors group"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Case Repository
            </button>
            <div className="mb-10">
                <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">Algorithmic Matching</span>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif tracking-tight transition-colors">Verified Legal Providers</h2>
                <p className="text-gray-600 dark:text-gray-500 text-sm mt-2 max-w-xl transition-colors">The following professionals have been matched based on your case classification, location, and specialization requirements.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-10 border-b border-gray-200 dark:border-[#333] mb-10 transition-colors">
                <button
                    onClick={() => setActiveTab("lawyers")}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "lawyers"
                        ? "text-[#D4AF37]"
                        : "text-gray-600 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-400"
                        }`}
                >
                    Lawyers ({lawyers.length})
                    {activeTab === "lawyers" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab("ngos")}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "ngos"
                        ? "text-[#D4AF37]"
                        : "text-gray-600 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-400"
                        }`}
                >
                    NGOs ({ngos.length})
                    {activeTab === "ngos" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(activeTab === "lawyers" ? lawyers : ngos).map((item) => (
                    <div key={item.id} className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all duration-500 group shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FiShield size={80} className="text-[#D4AF37]" />
                        </div>

                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-xl font-bold text-[#D4AF37] shadow-inner group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                                {item.name.charAt(0)}
                            </div>
                            {item.isVerified && (
                                <span className="bg-[#D4AF37] text-black text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg shadow-[#D4AF37]/10">
                                    Vetted
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-xl text-gray-900 dark:text-white font-serif mb-2 tracking-tight group-hover:text-[#D4AF37] transition-colors">{item.name}</h3>

                        <div className="space-y-2 mb-8">
                            <div className="text-[10px] font-bold text-[#D4AF37] flex items-center gap-2 uppercase tracking-widest">
                                <FiAward className="w-3 h-3" /> {activeTab === "lawyers" ? item.specialization : item.ngoType || "NGO"}
                            </div>
                            <div className="text-[10px] font-bold text-gray-600 dark:text-gray-500 flex items-center gap-2 uppercase tracking-widest transition-colors">
                                <FiMapPin className="w-3 h-3" /> {item.city}, {item.state}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-200 dark:border-[#222] transition-colors">
                            <button
                                onClick={() => handleStartChat(item, activeTab === "lawyers" ? "LAWYER" : "NGO")}
                                className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-900 dark:hover:text-white hover:border-[#D4AF37] transition-all flex items-center justify-center gap-3 group/btn"
                            >
                                <FiMessageSquare className="w-4 h-4 text-[#D4AF37] group-hover/btn:scale-110 transition-transform" /> Initiate Consultation
                            </button>
                            {(() => {
                                const role = activeTab === "lawyers" ? "LAWYER" : "NGO";
                                const existingAppt = appointments.find(a => a.providerId === item.id && a.providerRole === role);
                                const hasAppt = !!existingAppt;
                                const status = existingAppt?.status;

                                return (
                                    <button
                                        onClick={() => onBookAppointment({ ...item, type: role })}
                                        disabled={hasAppt && status !== 'REJECTED' && status !== 'CANCELLED'}
                                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${hasAppt
                                            ? (status === 'CONFIRMED' || status === 'APPROVED')
                                                ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 cursor-default"
                                                : (status === 'REJECTED' || status === 'CANCELLED')
                                                    ? "bg-[#D4AF37] text-black hover:bg-[#c5a059]"
                                                    : "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 cursor-default"
                                            : "bg-[#D4AF37] text-black hover:bg-[#c5a059]"
                                            }`}
                                    >
                                        <FiStar className={`w-4 h-4 ${hasAppt ? 'opacity-40' : 'opacity-100'}`} />
                                        {hasAppt
                                            ? (status === 'REJECTED' || status === 'CANCELLED')
                                                ? "Rebook Encounter"
                                                : `Phase: ${status}`
                                            : "Schedule Protocol"}
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                ))}

                {(activeTab === "lawyers" ? lawyers : ngos).length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-[#111] border border-dashed border-gray-300 dark:border-[#333] rounded-2xl flex flex-col items-center transition-colors">
                        <FiUser className="w-16 h-16 text-gray-400 dark:text-gray-800 mb-6 opacity-20 transition-colors" />
                        <p className="text-gray-600 dark:text-gray-500 font-bold uppercase tracking-widest text-xs mb-6 px-10 max-w-lg leading-relaxed transition-colors">No direct matches identified in this tier based on current case parameters.</p>
                        <button
                            onClick={() => setActivePage("find")}
                            className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#c5a059] transition-all shadow-xl shadow-[#D4AF37]/10"
                        >
                            Access Full Registry Manually
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
