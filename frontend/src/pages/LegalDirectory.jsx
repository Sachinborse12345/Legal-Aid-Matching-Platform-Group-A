import React, { useState } from 'react';
import { Gavel, Building2, Search, MapPin, Star, ShieldCheck, MessageCircle } from 'lucide-react';

const LegalDirectory = () => {
  const [activeTab, setActiveTab] = useState('lawyers');

  const lawyers = [
    { id: 1, name: "Adv. Rahul Sharma", spec: "Civil Law", loc: "Pune", exp: "12 yrs", rating: 4.8 },
    { id: 2, name: "Adv. Priya Das", spec: "Cyber Fraud", loc: "Mumbai", exp: "8 yrs", rating: 4.9 }
  ];

  const ngos = [
    { id: 1, name: "Justice For All", focus: "Legal Aid", loc: "Pune", type: "Non-Profit" },
    { id: 2, name: "Sahyog Cell", focus: "Women Rights", loc: "Nashik", type: "NGO" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">Legal Directory</h1>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-200 p-1.5 rounded-2xl w-fit mb-10 shadow-inner">
          <button 
            onClick={() => setActiveTab('lawyers')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'lawyers' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-gray-500 hover:text-slate-700'}`}
          >
            <Gavel size={18} /> Lawyers
          </button>
          <button 
            onClick={() => setActiveTab('ngos')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'ngos' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-gray-500 hover:text-slate-700'}`}
          >
            <Building2 size={18} /> NGOs
          </button>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'lawyers' ? (
            lawyers.map(l => (
              <div key={l.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all border-t-4 border-t-blue-500">
                <h3 className="font-bold text-xl text-slate-800">{l.name}</h3>
                <p className="text-blue-600 text-xs font-black mb-6 uppercase tracking-widest">{l.spec}</p>
                <div className="space-y-3 text-sm text-slate-500 mb-8">
                  <div className="flex items-center gap-2 font-medium"><ShieldCheck size={16} className="text-green-500"/> {l.exp} Experience</div>
                  <div className="flex items-center gap-2 font-medium"><MapPin size={16}/> {l.loc}</div>
                </div>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
                  <MessageCircle size={18} /> Contact Lawyer
                </button>
              </div>
            ))
          ) : (
            ngos.map(n => (
              <div key={n.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all border-t-4 border-t-green-500">
                <h3 className="font-bold text-xl text-slate-800">{n.name}</h3>
                <p className="text-green-600 text-xs font-black mb-6 uppercase tracking-widest">{n.focus}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-8"><MapPin size={16}/> {n.loc}</div>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                  <MessageCircle size={18} /> Request Assistance
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalDirectory;