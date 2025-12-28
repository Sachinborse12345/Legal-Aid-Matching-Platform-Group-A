import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiMapPin, FiUser } from "react-icons/fi";
import { BsPatchCheckFill } from "react-icons/bs";

/* --------------------------------------------------
   REAL-WORLD SPECIALIZATION MAPPING (LOGIC ONLY)
-------------------------------------------------- */
const mapToIssueKey = (value = "") => {
  const v = value.toLowerCase();

  // Lawyers
  if (v.includes("criminal") || v === "cr") return "criminal";
  if (v.includes("civil")) return "civil";
  if (v.includes("family")) return "family";
  if (v.includes("property")) return "property";
  if (v.includes("corporate")) return "corporate";

  // NGOs → mapped to legal issues
  if (v.includes("legal") || v.includes("human")) return "criminal";
  if (v.includes("women")) return "family";
  if (v.includes("child")) return "family";
  if (v.includes("environment")) return "environmental";
  if (v.includes("health")) return "healthcare";
  if (v.includes("poverty") || v.includes("livelihood")) return "labour";
  if (v.includes("rural")) return "property";

  return "";
};

export default function CitizenFindLawyer({
  setActivePage,
  setSelectedRecipient,
}) {
  /* ---------------- STATE ---------------- */
  const [lawyers, setLawyers] = useState([]);
  const [ngos, setNgos] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [specialization, setSpecialization] = useState("ALL");
  const [location, setLocation] = useState("");

  /* PAGINATION */
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lawyerRes, ngoRes] = await Promise.all([
          axios.get("http://localhost:8080/api/lawyers"),
          axios.get("http://localhost:8080/api/ngos"),
        ]);

        setLawyers(lawyerRes.data);
        setNgos(ngoRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load directory data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* RESET PAGE WHEN FILTER CHANGES */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, specialization, location]);

  /* ---------------- NORMALIZE DATA ---------------- */
  const directoryData = useMemo(() => {
    const lawyerData = lawyers.map((l) => ({
      id: l.id,
      name: l.fullName,
      specialization: l.specialization,
      issueKey: mapToIssueKey(l.specialization),
      city: l.city,
      district: l.district,
      state: l.state,
      verified: l.verified,
      entityType: "LAWYER",
    }));

    const ngoData = ngos.map((n) => ({
      id: n.id,
      name: n.ngoName || n.name,
      specialization: n.ngoType,
      issueKey: mapToIssueKey(n.ngoType),
      city: n.city,
      district: n.district,
      state: n.state,
      verified: n.verified,
      entityType: "NGO",
    }));

    return [...lawyerData, ...ngoData];
  }, [lawyers, ngos]);

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredResults = useMemo(() => {
    return directoryData.filter((item) => {
      const searchMatch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.specialization?.toLowerCase().includes(search.toLowerCase());

      const typeMatch = typeFilter === "ALL" || item.entityType === typeFilter;

      const specializationMatch =
        specialization === "ALL" ||
        mapToIssueKey(specialization) === item.issueKey;

      const locationMatch =
        !location ||
        `${item.city} ${item.district} ${item.state}`
          .toLowerCase()
          .includes(location.toLowerCase());

      return searchMatch && typeMatch && specializationMatch && locationMatch;
    });
  }, [directoryData, search, typeFilter, specialization, location]);

  /* ---------------- PAGINATION LOGIC ---------------- */
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);

  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ---------------- LOADING / ERROR ---------------- */
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading lawyers & NGOs...
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">{error}</div>;
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Find Lawyers & NGOs</h2>

      {/* FILTERS (UNCHANGED) */}
      <div className="bg-white p-4 rounded-xl shadow grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialization"
            className="pl-10 w-full p-3 border rounded-lg"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="p-3 border rounded-lg"
        >
          <option value="ALL">All</option>
          <option value="LAWYER">Lawyers</option>
          <option value="NGO">NGOs</option>
        </select>

        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="p-3 border rounded-lg"
        >
          <option value="ALL">All Specializations</option>
          <option value="Criminal Law">Criminal Law</option>
          <option value="Civil Law">Civil Law</option>
          <option value="Family Law">Family Law</option>
          <option value="Property Law">Property Law</option>
          <option value="Corporate Law">Corporate Law</option>
        </select>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City / District / State"
          className="p-3 border rounded-lg"
        />
      </div>

      {/* RESULTS GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {paginatedResults.map((item) => (
          <div
            key={`${item.entityType}-${item.id}`}
            className="bg-white rounded-xl shadow border flex flex-col h-full"
          >
            <div className="p-4 border-b flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                {item.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.verified && (
                    <BsPatchCheckFill className="text-blue-600" />
                  )}
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {item.entityType}
                </span>
              </div>
            </div>

            <div className="p-4 text-sm text-gray-600 space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <FiUser /> {item.specialization}
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin />
                {item.city}, {item.district}, {item.state}
              </div>
            </div>

            <div className="p-4 border-t mt-auto">
              <button
                onClick={() => {
                  setActivePage("messages");
                  setSelectedRecipient({
                    type: item.entityType.toLowerCase(),
                    id: item.id,
                    name: item.name,
                  });
                }}
                className="w-full bg-teal-700 text-white py-2 rounded-lg"
              >
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
