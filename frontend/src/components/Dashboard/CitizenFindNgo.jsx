import React from "react";

function NgoCard({ ngo, setActivePage, setSelectedRecipient }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border flex items-center justify-between">
      <div>
        <div className="font-semibold">{ngo.ngoName}</div>
        <div className="text-sm text-gray-600">
          {ngo.city}, {ngo.state}
        </div>
        <div className="text-sm text-gray-500 mt-1">{ngo.ngoType}</div>
        <div className="text-sm text-gray-500 mt-1">
          {ngo.contact} • {ngo.email}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {ngo.verificationStatus && (
          <span
            className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"
          >
            Verified NGO
          </span>
        )}

        <button
          onClick={() => {
            setActivePage("messages");
            setSelectedRecipient({
              type: "ngo",
              id: ngo.id,
              name: ngo.ngoName,
            });
          }}
          className="bg-teal-700 text-white px-3 py-1 rounded mt-2"
        >
          Message
        </button>
      </div>
    </div>
  );
}

export default function CitizenFindNgo({
  ngos,
  setActivePage,
  setSelectedRecipient,
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Find NGOs</h2>
      <div className="grid gap-4">
        {ngos
          .filter(n => n.isApproved) // Only show approved NGOs
          .map((ngo) => (
            <NgoCard
              key={ngo.id}
              ngo={ngo}
              setActivePage={setActivePage}
              setSelectedRecipient={setSelectedRecipient}
            />
          ))}
      </div>
    </div>
  );
}
