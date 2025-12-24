import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiMapPin, FiUser } from "react-icons/fi";

export default function CitizenFindLawyer({
  setActivePage,
  setSelectedRecipient,
}) {
  /* ---------------- STATES ---------------- */
  const [lawyers, setLawyers] = useState([]);
  const [ngos, setNgos] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [specialization, setSpecialization] = useState("ALL");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- FETCH LAWYERS + NGOs (TASK 11) ---------------- */
  useEffect(() => {
    const fetchDirectoryData = async () => {
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

    fetchDirectoryData();
  }, []);

  /* ---------------- MAP BACKEND → FRONTEND ---------------- */
  const directoryData = useMemo(() => {
    const lawyerData = lawyers.map((l) => ({
      id: l.id,
      name: l.fullName,
      expertise: l.specialization,
      location: `${l.city}, ${l.state}`,
      entityType: "LAWYER",
    }));

    const ngoData = ngos.map((n) => ({
      id: n.id,
      name: n.ngoName || n.name,
      expertise: n.focusArea || n.specialization || "NGO Support",
      location: `${n.city}, ${n.state}`,
      entityType: "NGO",
    }));

    return [...lawyerData, ...ngoData];
  }, [lawyers, ngos]);

  /* ---------------- SEARCH + FILTER LOGIC ---------------- */
  const filteredResults = useMemo(() => {
    return directoryData.filter((item) => {
      const searchMatch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.expertise.toLowerCase().includes(search.toLowerCase());

      const typeMatch = typeFilter === "ALL" || item.entityType === typeFilter;

      const specializationMatch =
        specialization === "ALL" ||
        item.expertise.toLowerCase().includes(specialization.toLowerCase());

      const locationMatch =
        !location ||
        item.location.toLowerCase().includes(location.toLowerCase());

      return searchMatch && typeMatch && specializationMatch && locationMatch;
    });
  }, [directoryData, search, typeFilter, specialization, location]);

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
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Find Lawyers & NGOs</h2>
        <p className="text-gray-500 text-sm">
          Browse registered lawyers and NGOs on the platform
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow border grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* SEARCH */}
        <div className="relative md:col-span-2">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialization"
            className="pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* TYPE FILTER */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="p-3 border rounded-lg"
        >
          <option value="ALL">All</option>
          <option value="LAWYER">Lawyers</option>
          <option value="NGO">NGOs</option>
        </select>

        {/* SPECIALIZATION */}
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="p-3 border rounded-lg"
        >
          <option value="ALL">All Specializations</option>
          <option value="Criminal">Criminal</option>
          <option value="Civil">Civil</option>
          <option value="Family">Family</option>
          <option value="Property">Property</option>
          <option value="Women">Women</option>
        </select>

        {/* LOCATION */}
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City / State"
          className="p-3 border rounded-lg"
        />
      </div>

      {/* RESULTS */}
      {filteredResults.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
          No lawyers or NGOs found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((item) => (
            <div
              key={`${item.entityType}-${item.id}`}
              className="bg-white rounded-xl shadow border hover:shadow-lg transition"
            >
              {/* CARD HEADER */}
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {item.entityType}
                  </span>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-4 text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <FiUser />
                  {item.expertise}
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin />
                  {item.location}
                </div>
              </div>

              {/* ACTION */}
              <div className="p-4 border-t">
                <button
                  onClick={() => {
                    setActivePage("messages");
                    setSelectedRecipient({
                      type: item.entityType.toLowerCase(),
                      id: item.id,
                      name: item.name,
                    });
                  }}
                  className="w-full bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800"
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
