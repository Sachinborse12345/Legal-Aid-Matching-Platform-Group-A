import { useState } from "react";
import Navbar from "./NavBar";
import DirectorySearch from "../components/DirectorySearch";
import DirectoryFilters from "../components/DirectoryFilters";
import DirectoryCard from "../components/DirectoryCard";

export default function Directory() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    district: "",
    specialization: "",
  });

  const filteredData = DIRECTORY_DATA.filter((item) => {
    const searchMatch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.state.toLowerCase().includes(search.toLowerCase());

    const typeMatch = !filters.type || item.type === filters.type;
    const districtMatch =
      !filters.district || item.district === filters.district;
    const specializationMatch =
      !filters.specialization || item.specialization === filters.specialization;

    return searchMatch && typeMatch && districtMatch && specializationMatch;
  });

  return (
    <>
      <Navbar />
      <div className="pt-28 container mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
          Find Lawyers & NGOs
        </h1>

        <DirectorySearch onSearch={setSearch} />
        <DirectoryFilters onChange={setFilters} />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {filteredData.map((item) => (
            <DirectoryCard key={item.id} data={item} />
          ))}

          {filteredData.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              No results found
            </p>
          )}
        </div>
      </div>
    </>
  );
}
