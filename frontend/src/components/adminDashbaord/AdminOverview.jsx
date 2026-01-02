import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    lawyers: 0,
    ngos: 0,
    verifiedLawyers: 0,
    verifiedNGOs: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [lawyersRes, ngosRes] = await Promise.all([
        axios.get("http://localhost:8080/api/lawyers"),
        axios.get("http://localhost:8080/api/ngos"),
      ]);

      const lawyers = lawyersRes.data;
      const ngos = ngosRes.data;

      setStats({
        lawyers: lawyers.length,
        ngos: ngos.length,
        verifiedLawyers: lawyers.filter((l) => l.verificationStatus).length,
        verifiedNGOs: ngos.filter((n) => n.verificationStatus).length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const importBarCouncilData = async () => {
    try {
      if (confirm("Import dummy Bar Council data? This will allow new lawyers to be verified.")) {
        await axios.post("http://localhost:8080/api/lawyers/admin/import-bar-council");
        alert("Bar Council Data imported successfully! You can now register lawyers with IDs from the CSV.");
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed. Check console.");
    }
  };

  return (
    <div className="space-y-6">
      {/* WELCOME CARD */}
      <div className="bg-[#4B227A] text-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="opacity-90 mb-4">
          You have {stats.lawyers} registered lawyers and {stats.ngos} registered NGOs.
        </p>
        <button
          onClick={importBarCouncilData}
          className="bg-[#FDB415] text-[#4B227A] px-6 py-2 rounded-lg font-medium hover:bg-[#FDB415]/90 transition cursor-pointer"
        >
          Import Bar Council Data
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="TOTAL LAWYERS" value={stats.lawyers} />
        <StatCard title="VERIFIED LAWYERS" value={stats.verifiedLawyers} />
        <StatCard title="TOTAL NGOS" value={stats.ngos} />
        <StatCard title="VERIFIED NGOS" value={stats.verifiedNGOs} />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4 text-lg">Recent Activity</h3>
        <p className="text-gray-500 text-sm">System is running.</p>
      </div>
    </div>
  );
}

/* ===== STAT CARD ===== */
const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-xl p-5 shadow flex items-center gap-4 hover:shadow-md transition">
    <div className="w-10 h-10 bg-[#FDB415]/20 rounded-full flex items-center justify-center">
      <div className="w-6 h-6 bg-[#4B227A] rounded-full" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);
