import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Download, ArrowLeft, Paperclip, 
  Clock, ShieldCheck, FilePlus, MapPin, Scale 
} from 'lucide-react';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data synchronized with your uploaded RRB Document 
  const [caseData] = useState({
    id: id || "1766062218613",
    title: "fraud",
    type: "Civil",
    court: "District Court",
    incidentDate: "15 Dec 2025",
    incidentPlace: "Pune",
    status: "PENDING",
    urgency: "Medium",
    documents: [
      { 
        id: 1, 
        name: "case_CASE-1766062218613_document.pdf", 
        size: "3 Pages", 
        owner: "KADAM WALMIK PANDURANG", // From document 
        examDate: "19 Dec 2025" // From document 
      }
    ]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-6 transition"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Case & Incident Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-3xl font-black text-slate-800 mb-4 uppercase text-blue-600">CASE-{caseData.id}</h1>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Case Title</p>
                  <p className="text-lg font-semibold text-slate-700">{caseData.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Incident Date</p>
                  <p className="text-lg font-semibold text-slate-700">{caseData.incidentDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-slate-800 text-white font-bold flex items-center gap-2">
              <Paperclip size={18} /> Case Documents
            </div>
            <div className="p-4 space-y-4">
              {caseData.documents.map((doc) => (
                <div key={doc.id} className="p-3 border rounded-xl hover:bg-blue-50 transition border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700 truncate w-40">{doc.name}</span>
                    <Download size={16} className="text-blue-500 cursor-pointer" />
                  </div>
                  <p className="text-[10px] text-gray-500">Candidate: {doc.owner}</p>
                  <p className="text-[10px] text-gray-400 italic">Exam Ref: {doc.examDate}</p>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-xs hover:text-blue-500 transition flex items-center justify-center gap-2">
                <FilePlus size={18} /> UPLOAD FILE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;