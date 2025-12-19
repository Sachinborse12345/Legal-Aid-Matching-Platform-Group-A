import React, { useRef, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../../Redux/authSlice.js";
import { updateProfile } from "../../api/auth.js";
import { toast } from "react-toastify";
import {
  INDIAN_STATES_AND_UT_ARRAY,
  STATES_OBJECT,
  STATE_WISE_CITIES,
} from "indian-states-cities-list";

export default function LawyerProfile({
  profile,
  setProfile,
  isEditingProfile,
  setIsEditingProfile,
}) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollPositionRef = useRef(0);
  
  // State management for location dropdowns
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  
  // State to track validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Get auth state from Redux
  const { profile: reduxProfile, isLoading: isFetchingProfile, isAuthenticated } = useSelector((state) => state.auth);

  // Get all states
  const stateOptions = INDIAN_STATES_AND_UT_ARRAY.map((state) => ({
    label: state,
    value: state,
  }));

  // Find state object to get the key for STATE_WISE_CITIES
  const selectedStateObj = useMemo(() => {
    return STATES_OBJECT.find((state) => state.value === selectedState);
  }, [selectedState]);

  // Get districts based on selected state
  const districtOptions = useMemo(() => {
    if (!selectedState || !selectedStateObj) return [];
    
    const stateKey = selectedStateObj.name;
    const districts = STATE_WISE_CITIES[stateKey];
    
    if (!districts) return [];
    
    // Extract unique districts from cities data
    const districtsSet = new Set();
    if (Array.isArray(districts)) {
      districts.forEach((item) => {
        if (item.district) {
          districtsSet.add(item.district);
        } else if (item.value) {
          districtsSet.add(item.value);
        }
      });
    } else if (typeof districts === 'object') {
      Object.values(districts).forEach((cityList) => {
        if (Array.isArray(cityList)) {
          cityList.forEach((city) => {
            if (city.district) {
              districtsSet.add(city.district);
            } else if (city.name) {
              districtsSet.add(city.name);
            }
          });
        }
      });
    }
    
    return Array.from(districtsSet).sort().map((district) => ({
      label: district,
      value: district,
    }));
  }, [selectedState, selectedStateObj]);

  // Fetch profile data from backend on mount/refresh
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    // Always fetch profile on mount to ensure data is loaded after refresh
    // This ensures data is fetched even after page refresh when Redux state is empty
    dispatch(fetchUserProfile()).catch((error) => {
      console.error("Error fetching profile:", error);
      // Only show error if it's a real error, not just empty profile
      if (error?.response?.status === 403) {
        toast.error("Profile endpoint not available for your role. Please contact support.");
      } else if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      }
      // Don't show generic error on initial load - might be normal
    });
  }, [dispatch]);
  
  // Also fetch when profile is empty but we have a token (fallback)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && (!reduxProfile.email && !reduxProfile.fullName)) {
      dispatch(fetchUserProfile()).catch((error) => {
        console.error("Error fetching profile (fallback):", error);
      });
    }
  }, [dispatch, reduxProfile.email, reduxProfile.fullName]);

  // Update local profile when Redux profile changes
  useEffect(() => {
    if (reduxProfile && (reduxProfile.email || reduxProfile.fullName)) {
      // Log for debugging
      console.log("Redux Profile Data:", reduxProfile);
      
      // Format date if it exists (handle both date string and date object)
      let formattedDob = "";
      if (reduxProfile.dob) {
        if (typeof reduxProfile.dob === 'string') {
          // If it's already a string, use it directly (should be YYYY-MM-DD)
          formattedDob = reduxProfile.dob.split('T')[0]; // Remove time if present
        } else if (reduxProfile.dob instanceof Date) {
          formattedDob = reduxProfile.dob.toISOString().split('T')[0];
        } else {
          formattedDob = reduxProfile.dob;
        }
      }
      
      setProfile({
        shortName: reduxProfile.shortName || reduxProfile.fullName || "",
        fullName: reduxProfile.fullName || "",
        role: reduxProfile.role || "LAWYER",
        email: reduxProfile.email || "",
        mobile: reduxProfile.mobile || reduxProfile.mobileNum || "",
        dob: formattedDob,
        state: reduxProfile.state || "",
        district: reduxProfile.district || "",
        city: reduxProfile.city || "",
        address: reduxProfile.address || "",
        password: "",
        photo: null,
        photoUrl: reduxProfile.photoUrl || null,
        // Lawyer-specific fields
        aadhaar: reduxProfile.aadhaar || reduxProfile.aadharNum || "",
        barCouncilId: reduxProfile.barCouncilId || "",
        barState: reduxProfile.barState || "",
        specialization: reduxProfile.specialization || "",
        experienceYears: reduxProfile.experienceYears || reduxProfile.experience || "",
        aadharProofUrl: reduxProfile.aadharProofUrl || null,
        barCertificateUrl: reduxProfile.barCertificateUrl || null,
      });
      
      if (reduxProfile.state) {
        setSelectedState(reduxProfile.state);
      }
      if (reduxProfile.district) {
        setSelectedDistrict(reduxProfile.district);
      }
    }
  }, [reduxProfile, setProfile]);

  // Sync dropdown states with profile state
  useEffect(() => {
    if (profile.state) {
      setSelectedState(profile.state);
    }
    if (profile.district) {
      setSelectedDistrict(profile.district);
    }
  }, [profile.state, profile.district]);

  // Cleanup photo URL on unmount
  useEffect(() => {
    return () => {
      if (profile.photoUrl && profile.photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profile.photoUrl);
      }
    };
  }, [profile.photoUrl]);

  // Validation functions
  const validateFullName = (name) => {
    if (!name || name.trim() === "") {
      return "Full Name is required";
    }
    if (name.trim().length < 2) {
      return "Full Name must be at least 2 characters";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim() === "") {
      return "Phone number is required";
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "fullName":
        error = validateFullName(value);
        break;
      case "mobile":
        error = validatePhone(value);
        break;
      default:
        break;
    }
    return error;
  };

  const handleProfileChange = (field, value) => {
    setProfile((p) => ({ ...p, [field]: value }));

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = profile[field];
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    const fields = ["fullName", "mobile"];

    fields.forEach((field) => {
      const value = profile[field];
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(
      fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    return Object.keys(newErrors).length === 0;
  };

  const handleStateChange = (state) => {
    scrollPositionRef.current = window.scrollY;
    setSelectedState(state);
    setSelectedDistrict("");
    handleProfileChange("state", state);
    handleProfileChange("district", "");
    handleProfileChange("city", "");
    
    setTimeout(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: "instant",
      });
    }, 0);
  };

  const handleDistrictChange = (district) => {
    scrollPositionRef.current = window.scrollY;
    setSelectedDistrict(district);
    handleProfileChange("district", district);
    handleProfileChange("city", "");
    
    setTimeout(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: "instant",
      });
    }, 0);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      e.target.value = "";
      return;
    }
    
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 500KB");
      e.target.value = "";
      return;
    }
    
    // Clean up previous object URL if it exists
    if (profile.photoUrl && profile.photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(profile.photoUrl);
    }
    
    const url = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, photo: file, photoUrl: url }));
    setErrors((prev) => ({ ...prev, photo: "" }));
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      
      if (!validateAll()) {
        toast.error("Please fix all validation errors before saving");
        setIsLoading(false);
        return;
      }
      
      const profileData = {
        fullName: profile.fullName?.trim() || "",
        mobile: profile.mobile?.trim() || "",
        dob: profile.dob || "",
        state: profile.state?.trim() || "",
        district: profile.district?.trim() || "",
        city: profile.city?.trim() || "",
        address: profile.address?.trim() || "",
      };
      
      // Remove empty fields to avoid sending empty strings
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === "" || profileData[key] === null || profileData[key] === undefined) {
          delete profileData[key];
        }
      });

      const response = await updateProfile(profileData, profile.photo);
      
      if (response.data && response.data.data) {
        const updatedData = response.data.data;
        
        // Preserve all existing profile data including lawyer-specific fields
        setProfile({
          shortName: updatedData.shortName || updatedData.fullName || profile.shortName || "",
          fullName: updatedData.fullName || profile.fullName || "",
          role: updatedData.role || profile.role || "LAWYER",
          email: updatedData.email || profile.email || "", // Preserve email (read-only)
          mobile: updatedData.mobile || profile.mobile || "",
          dob: updatedData.dob || profile.dob || "",
          state: updatedData.state || profile.state || "",
          district: updatedData.district || profile.district || "",
          city: updatedData.city || profile.city || "",
          address: updatedData.address || profile.address || "",
          password: "",
          photo: null,
          photoUrl: updatedData.photoUrl || profile.photoUrl,
          // Preserve lawyer-specific read-only fields
          aadhaar: profile.aadhaar || "", // Preserve Aadhaar (read-only)
          barCouncilId: profile.barCouncilId || "", // Preserve Bar Council ID (read-only)
          barState: profile.barState || "", // Preserve Bar State (read-only)
          specialization: profile.specialization || "", // Preserve Specialization (read-only)
          experienceYears: profile.experienceYears || "", // Preserve Experience (read-only)
          aadharProofUrl: profile.aadharProofUrl || null,
          barCertificateUrl: profile.barCertificateUrl || null,
        });

        // Refresh profile from backend to get latest data
        dispatch(fetchUserProfile());
        
        toast.success(response.data.message || "Profile updated successfully");
        setIsEditingProfile(false);
      } else {
        // Refresh profile from backend even if response format is different
        dispatch(fetchUserProfile());
        toast.success("Profile updated successfully");
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error(
          "Profile update is not yet supported for lawyers. Please contact support."
        );
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.response?.data ||
            "Failed to update profile. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching
  if (isFetchingProfile && !reduxProfile.email && !reduxProfile.fullName) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if profile fetch failed
  if (!isFetchingProfile && !reduxProfile.email && !reduxProfile.fullName && isAuthenticated) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center bg-white p-6 rounded-lg shadow">
          <p className="text-red-600 mb-4">Failed to load profile data</p>
          <button
            onClick={() => dispatch(fetchUserProfile())}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Profile
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your personal information and preferences.
          </p>
        </div>

        <div className="flex gap-2">
          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profile
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </button>
              <button
                onClick={() => {
                  // Reset form to original values and cleanup photo URL if it's a blob
                  if (profile.photo && profile.photoUrl && profile.photoUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(profile.photoUrl);
                  }
                  // Reset to Redux profile values
                  if (reduxProfile && (reduxProfile.email || reduxProfile.fullName)) {
                    let formattedDob = "";
                    if (reduxProfile.dob) {
                      if (typeof reduxProfile.dob === 'string') {
                        formattedDob = reduxProfile.dob.split('T')[0];
                      } else if (reduxProfile.dob instanceof Date) {
                        formattedDob = reduxProfile.dob.toISOString().split('T')[0];
                      } else {
                        formattedDob = reduxProfile.dob;
                      }
                    }
                    setProfile({
                      shortName: reduxProfile.shortName || reduxProfile.fullName || "",
                      fullName: reduxProfile.fullName || "",
                      role: reduxProfile.role || "LAWYER",
                      email: reduxProfile.email || "",
                      mobile: reduxProfile.mobile || reduxProfile.mobileNum || "",
                      dob: formattedDob,
                      state: reduxProfile.state || "",
                      district: reduxProfile.district || "",
                      city: reduxProfile.city || "",
                      address: reduxProfile.address || "",
                      password: "",
                      photo: null,
                      photoUrl: reduxProfile.photoUrl || null,
                      aadhaar: reduxProfile.aadhaar || reduxProfile.aadharNum || "",
                      barCouncilId: reduxProfile.barCouncilId || "",
                      barState: reduxProfile.barState || "",
                      specialization: reduxProfile.specialization || "",
                      experienceYears: reduxProfile.experienceYears || reduxProfile.experience || "",
                      aadharProofUrl: reduxProfile.aadharProofUrl || null,
                      barCertificateUrl: reduxProfile.barCertificateUrl || null,
                    });
                  }
                  setErrors({});
                  setTouched({});
                  setIsEditingProfile(false);
                }}
                className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-200 text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-md border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex flex-col items-center lg:items-start gap-4 flex-shrink-0">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl sm:text-5xl md:text-6xl font-bold">
                    {profile.shortName?.charAt(0) || profile.fullName?.charAt(0) || "L"}
                  </div>
                )}
              </div>
              {isEditingProfile && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
            
            {isEditingProfile && (
              <div className="w-full">
                <input
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="profile-photo-upload"
                />
                <label
                  htmlFor="profile-photo-upload"
                  className="block w-full text-center sm:text-left cursor-pointer bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Change Photo
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
                  JPG, PNG or GIF (max 500KB)
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role <span className="text-gray-400">(Read-only)</span>
                </label>
                <input
                  value={profile.role}
                  disabled
                  className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={profile.fullName}
                  onChange={(e) =>
                    handleProfileChange("fullName", e.target.value)
                  }
                  onBlur={() => handleBlur("fullName")}
                  disabled={!isEditingProfile}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 ${
                    isEditingProfile
                      ? errors.fullName && touched.fullName
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white text-gray-900"
                        : "border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && touched.fullName && (
                  <span className="text-red-500 text-sm mt-1">{errors.fullName}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-gray-400">(Read-only)</span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled={true}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={profile.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    handleProfileChange("mobile", value);
                  }}
                  onBlur={() => handleBlur("mobile")}
                  disabled={!isEditingProfile}
                  maxLength={10}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 ${
                    isEditingProfile
                      ? errors.mobile && touched.mobile
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white text-gray-900"
                        : "border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  }`}
                  placeholder="10-digit mobile number"
                />
                {errors.mobile && touched.mobile && (
                  <span className="text-red-500 text-sm mt-1">{errors.mobile}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Aadhaar Number <span className="text-gray-400">(Read-only)</span>
                </label>
                <input
                  type="text"
                  value={profile.aadhaar || ""}
                  disabled={true}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="12-digit Aadhaar number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bar Council ID <span className="text-gray-400">(Read-only)</span>
                </label>
                <input
                  type="text"
                  value={profile.barCouncilId || ""}
                  disabled={true}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Bar Council ID"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bar State <span className="text-gray-400">(Read-only)</span>
                </label>
                <input
                  type="text"
                  value={profile.barState || ""}
                  disabled={true}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Bar State"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specialization <span className="text-gray-400">(Read-only)</span>
                </label>
                <input
                  type="text"
                  value={profile.specialization || ""}
                  disabled={true}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Legal Specialization"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience (Years) <span className="text-gray-400">(Read-only)</span>
                </label>
                <input
                  type="number"
                  value={profile.experienceYears || ""}
                  disabled={true}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Years of experience"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={!isEditingProfile}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 ${
                    isEditingProfile
                      ? "border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <option value="">Select State</option>
                  {stateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!isEditingProfile || !selectedState}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 ${
                    !isEditingProfile || !selectedState
                      ? "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                      : "border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900"
                  }`}
                >
                  <option value="">Select District</option>
                  {districtOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={profile.city || ""}
                  onChange={(e) =>
                    handleProfileChange("city", e.target.value)
                  }
                  disabled={!isEditingProfile}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 ${
                    isEditingProfile
                      ? "border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  }`}
                  placeholder="Enter your city"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) =>
                    handleProfileChange("address", e.target.value)
                  }
                  disabled={!isEditingProfile}
                  rows={3}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 resize-none ${
                    isEditingProfile
                      ? "border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  }`}
                  placeholder="Enter your complete address"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

