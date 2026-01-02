import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

export default function LawyerProfile({ profile, setProfile, isEditing, setIsEditing }) {
    const [formData, setFormData] = useState({ ...profile });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const response = await axiosClient.put(`/lawyers/${profile.id}`, formData);
            setProfile(response.data);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            const msg = error.response?.data?.message || error.response?.data || "Failed to update profile";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-xl border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Profile</h2>
                <button
                    onClick={() => {
                        if (isEditing) handleSave();
                        else setIsEditing(true);
                    }}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-white ${isEditing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                        } disabled:opacity-50`}
                >
                    {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full p-2 border rounded-lg bg-gray-200 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Mobile Number</label>
                    <input
                        type="text"
                        name="mobileNum"
                        value={formData.mobileNum}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Bar Council ID</label>
                    <input
                        type="text"
                        name="barCouncilId"
                        value={formData.barCouncilId}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Specialization</label>
                    <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">State</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">District</label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">City</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">Office Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows="3"
                        className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100"
                    />
                </div>
            </div>
        </div>
    );
}
