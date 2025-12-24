import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, Download, MessageSquare, Plus } from 'lucide-react';

const MyCases = () => {
  const navigate = useNavigate();
  // Data matching your screenshot
  const [cases] = useState([
    {
      id: "1766062218613",
      title: "fraud",
      victim: "rahul sharma",
      type: "Civil",
      location: "Pune",
      court: "District Court",
      date: "20 Dec 2025",
      status: "COMPLETED",
      priority: "Medium"
    },
    {
      id: "1766048732548",
      title: "fraud by the company",
      victim: "Rahul sharma",
      type: "Civil",
      location: "Pune",
      court: "District Court",
      date: "18 Dec 2025",
      status: "PENDING",
      priority: "Medium"
    }
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-slate-800 p-8 rounded-xl text-white mb-8">
        <h1 className="text-3xl font-bold">My Cases</h1>
        <p className="opacity-80">Track and manage all your submitted legal cases</p>
        <span className="mt-4 inline-block bg-slate-700 px-3 py-1 rounded text-sm">Total Cases: {cases.length}</span>
      </div>

      <div className="space-y-4">
        {cases.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2 text-[10px] font-mono">
                <span className="bg-gray-100 p-1 rounded">#CASE-{c.id}</span>
                <span className="bg-orange-50 text-orange-600 p-1 rounded font-bold uppercase">{c.priority}</span>
                <span className={`p-1 rounded font-bold uppercase ${c.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {c.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Calendar size={14} /> {c.date}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4 capitalize">{c.title}</h3>
            
            <div className="grid grid-cols-4 gap-4 text-sm mb-6">
              <div><p className="text-gray-400 text-xs uppercase">Victim</p><p className="font-semibold">{c.victim}</p></div>
              <div><p className="text-gray-400 text-xs uppercase">Type</p><p className="font-semibold">{c.type}</p></div>
              <div><p className="text-gray-400 text-xs uppercase">Location</p><p className="font-semibold">{c.location}</p></div>
              <div><p className="text-gray-400 text-xs uppercase">Court</p><p className="font-semibold">{c.court}</p></div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
               <div className="flex gap-2">
                 <button className="p-2 bg-gray-50 rounded hover:bg-gray-100"><Download size={16} className="text-gray-500"/></button>
                 <button className="p-2 bg-gray-50 rounded hover:bg-gray-100"><MessageSquare size={16} className="text-gray-500"/></button>
               </div>
               <div className="flex gap-2">
                 <button className={`px-4 py-2 rounded-lg text-sm font-bold ${c.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {c.status === 'COMPLETED' ? '✓ Completed' : '⟳ Pending'}
                 </button>
                 {/* ⭐ THIS BUTTON TRIGGERS TASK 2 */}
                 <button 
                  onClick={() => navigate(`/citizen/case-details/${c.id}`)}
                  className="p-2 bg-slate-800 text-white rounded-lg hover:bg-black transition"
                 >
                   <Eye size={18} />
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCases;