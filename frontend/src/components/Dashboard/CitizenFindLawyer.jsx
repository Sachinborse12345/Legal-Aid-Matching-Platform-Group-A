import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiMapPin, FiUser } from "react-icons/fi";
import { BsPatchCheckFill } from "react-icons/bs";

const SPECIALIZATIONS = [
  "Criminal",
  "Civil",
  "Family",
  "Property",
  "Corporate",
  "Labour",
  "Women",
  "Child",
  "Human Rights",
  "Environmental",
];

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

  /* ---------------- FETCH DATA ---------------- */
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

  /* ---------------- NORMALIZE BACKEND DATA ---------------- */
  const directoryData = useMemo(() => {
    const lawyerData = lawyers.map((l) => ({
      id: l.id,
      name: l.fullName,
      specialization: l.specialization,
      city: l.city,
      district: l.district,
      state: l.state,
      verified: l.verified,
      entityType: "LAWYER",
    }));

    const ngoData = ngos.map((n) => ({
      id: n.id,
      name: n.ngoName || n.name,
      specialization: n.focusArea || n.specialization,
      city: n.city,
      district: n.district,
      state: n.state,
      verified: n.verified,
      entityType: "NGO",
    }));

    return [...lawyerData, ...ngoData];
  }, [lawyers, ngos]);

  /* ---------------- SEARCH + FILTER ---------------- */
  const filteredResults = useMemo(() => {
    return directoryData.filter((item) => {
      const searchMatch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.specialization?.toLowerCase().includes(search.toLowerCase());

      const typeMatch = typeFilter === "ALL" || item.entityType === typeFilter;

      const specializationMatch =
        specialization === "ALL" ||
        item.specialization?.toLowerCase() === specialization.toLowerCase();

      const locationMatch =
        !location ||
        `${item.city} ${item.district} ${item.state}`
          .toLowerCase()
          .includes(location.toLowerCase());

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
      <h2 className="text-2xl font-bold">Find Lawyers & NGOs</h2>

      {/* FILTERS */}
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
          {SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City / District / State"
          className="p-3 border rounded-lg"
        />
      </div>

      {/* RESULTS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.map((item) => (
          <div
            key={`${item.entityType}-${item.id}`}
            className="bg-white rounded-xl shadow border"
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

            <div className="p-4 text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <FiUser /> {item.specialization}
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin />
                {item.city}, {item.district}, {item.state}
              </div>
            </div>

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
                className="w-full bg-teal-700 text-white py-2 rounded-lg"
              >
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
