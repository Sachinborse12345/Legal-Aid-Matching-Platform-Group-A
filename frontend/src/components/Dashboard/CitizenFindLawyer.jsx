import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function DirectoryCard({ item, setActivePage, setSelectedRecipient, onViewProfile }) {
  // item is a DirectoryEntry
  const isLawyer = item.type === "LAWYER";
  const typeLabel = isLawyer ? "LAWYER" : "NGO";
  const name = item.name;
  const specialization = isLawyer ? item.specialization : item.specialization || "Social Service";
  // Note: DirectoryEntry reuses 'specialization' field. For NGO it might be mapped from 'ngoType' in import service.
  // Actually, checking entity, 'specialization' is the field for both.

  const city = item.city || "Unknown";
  const state = item.state || "";
  const verified = item.verified;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isLawyer ? 'bg-teal-100 text-teal-800' : 'bg-orange-100 text-orange-800'}`}>
            {isLawyer ? 'L' : 'N'}
          </div>
          {verified && (
            <span className="bg-green-50 text-green-700 text-[10px] px-2 py-1 rounded-full font-medium border border-green-100">
              VERIFIED
            </span>
          )}
        </div>

        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1" title={name}>{name}</h3>

        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded border ${isLawyer ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
            {typeLabel}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span className="truncate">{specialization || "General"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="truncate">{city}, {state}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mt-2">
        <button
          onClick={() => {
            setActivePage("messages");
            setSelectedRecipient({
              type: isLawyer ? "lawyer" : "ngo",
              id: item.id,
              name: name,
            });
          }}
          className="w-full bg-[#234f4a] hover:bg-[#1a3b37] text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Message
        </button>
        <button
          onClick={() => onViewProfile(item, isLawyer ? "lawyer" : "ngo")}
          className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

export default function CitizenFindLawyer({
  setActivePage,
  setSelectedRecipient,
  onViewProfile
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Lawyer, NGO
  const [filterSpec, setFilterSpec] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterExperience, setFilterExperience] = useState("");

  // Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(9); // 3x3 grid

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size
      };

      if (filterType !== "All") params.type = filterType.toUpperCase();
      if (searchTerm) params.name = searchTerm;
      if (filterSpec) params.specialization = filterSpec;
      // Location search: Backend supports state, district separate params.
      // Front end has one input. If user types "Mumbai", we can try sending it as district or state?
      // DirectoryController has state, district. 
      // For now, let's treat location input as 'district' primarily or 'state' if fallback?
      // Actually backend controller search param is: name, state, district, specialization.
      // If user uses single input for location, we might have to pick one. 
      // Let's assume user types district for now.
      if (filterLocation) params.district = filterLocation;
      if (filterExperience) params.minExperience = parseInt(filterExperience);

      console.log("DEBUG: Fetching directory with params:", params);
      const res = await axios.get("http://localhost:8080/api/directory/search", { params });
      console.log("DEBUG: Search results received:", res.data.totalElements);
      setItems(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (e) {
      console.error("Failed to fetch directory", e);
    } finally {
      setLoading(false);
    }
  }, [page, size, filterType, searchTerm, filterSpec, filterLocation, filterExperience]);

  // Fetch when dependencies change. 
  // Debounce search term to avoid too many calls? For now plain effect.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300); // 300ms debounce for typing
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterType, filterSpec, filterLocation, filterExperience]);

  return (
    <div className="space-y-6">

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Find Lawyers & NGOs</h2>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              placeholder="Search by name"
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#234f4a] focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-48">
            <select
              className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#234f4a]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Lawyer">Lawyers Only</option>
              <option value="NGO">NGOs Only</option>
            </select>
          </div>

          {/* Specialization Filter */}
          <div className="w-full md:w-48">
            <select
              className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#234f4a]"
              value={filterSpec}
              onChange={(e) => setFilterSpec(e.target.value)}
            >
              <option value="">Any Specialization</option>
              <option value="Criminal">Criminal Law</option>
              <option value="Civil">Civil Law</option>
              <option value="Family">Family Law</option>
              <option value="Property">Property Law</option>
              <option value="Corporate">Corporate Law</option>
              <option value="Women Welfare">Women Welfare (NGO)</option>
              <option value="Child Rights">Child Rights (NGO)</option>
              <option value="Child Protection">Child Protection (NGO)</option>
              <option value="Women Rights">Women Rights (NGO)</option>
              <option value="Human Rights">Human Rights (NGO)</option>
              <option value="Education Support">Education Support (NGO)</option>
              <option value="Community Welfare">Community Welfare (NGO)</option>
              <option value="Disaster Relief">Disaster Relief (NGO)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Location Filter */}
        <div className="mt-4 flex gap-4">
          <input
            type="text"
            placeholder="District / City (e.g. Pune)"
            className="w-full md:w-1/3 p-2.5 border rounded-lg focus:ring-2 focus:ring-[#234f4a] outline-none"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          />
          <input
            type="number"
            placeholder="Min Years of Experience"
            className="w-full md:w-1/4 p-2.5 border rounded-lg focus:ring-2 focus:ring-[#234f4a] outline-none"
            value={filterExperience}
            onChange={(e) => setFilterExperience(e.target.value)}
            min="0"
          />
        </div>
      </div>

      {/* Grid Results */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#234f4a]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <DirectoryCard
                key={item.id}
                item={item}
                setActivePage={setActivePage}
                setSelectedRecipient={setSelectedRecipient}
                onViewProfile={onViewProfile}
              />
            ))}

            {items.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-500">
                <p className="text-lg">No results found matching your criteria.</p>
                <button
                  onClick={() => { setSearchTerm(''); setFilterType('All'); setFilterSpec(''); setFilterLocation(''); setFilterExperience(''); }}
                  className="mt-2 text-[#234f4a] underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pb-8">
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
  );
}
