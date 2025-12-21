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
import { API_BASE } from "../../api/axiosClient.js";

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

  // State management for location fetching
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState("");
  
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

  // Specialization options matching the registration form
  const specializationOptions = [
    { label: "Criminal Law", value: "CR" },
    { label: "Civil Law", value: "CV" },
    { label: "Corporate Law", value: "CO" },
    { label: "Family Law", value: "FA" },
    { label: "Property Law", value: "PR" },
  ];

  // Don't fetch profile here - LawyerDashboard handles it to avoid duplicate requests
  // This component just uses the Redux profile data

  // Update local profile when Redux profile changes
  useEffect(() => {
    if (reduxProfile && (reduxProfile.email || reduxProfile.fullName)) {
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
        aadharProofFilename: reduxProfile.aadharProofFilename || null,
        barCertificateUrl: reduxProfile.barCertificateUrl || null,
        barCertificateFilename: reduxProfile.barCertificateFilename || null,
        latitude: reduxProfile.latitude || null,
        longitude: reduxProfile.longitude || null,
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

  // Validation functions for latitude and longitude
  const isLatitudeValid = (lat) => {
    if (!lat || lat === "") return false;
    const num = typeof lat === 'string' ? parseFloat(lat) : lat;
    if (isNaN(num)) return false;
    return num >= -90 && num <= 90;
  };

  const isLongitudeValid = (lng) => {
    if (!lng || lng === "") return false;
    const num = typeof lng === 'string' ? parseFloat(lng) : lng;
    if (isNaN(num)) return false;
    return num >= -180 && num <= 180;
  };

  // Get current location from browser with retry mechanism
  const handleGetCurrentLocation = (retryCount = 0) => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    const options = {
      enableHighAccuracy: retryCount === 0,
      timeout: retryCount === 0 ? 20000 : 30000,
      maximumAge: retryCount === 0 ? 0 : 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const latStr = lat.toFixed(6);
        const lngStr = lng.toFixed(6);
        handleProfileChange("latitude", latStr);
        handleProfileChange("longitude", lngStr);
        setIsGettingLocation(false);
        setLocationError("");
        toast.success("Location fetched successfully!");
      },
      (error) => {
        setIsGettingLocation(false);

        if (error.code === error.TIMEOUT && retryCount === 0) {
          setTimeout(() => {
            handleGetCurrentLocation(1);
          }, 500);
          return;
        }

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location permissions in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable. Please enter coordinates manually.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please check your GPS/WiFi connection.");
            break;
          default:
            setLocationError("Unable to get location. Please enter coordinates manually.");
            break;
        }
      },
      options
    );
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

  const handleDownloadDocument = async (url, filename) => {
    try {
      setIsLoading(true);
      
      // Fetch the file from Cloudinary
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      
      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a blob URL with the correct MIME type for PDF
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        barState: profile.barState?.trim() || "",
        specialization: profile.specialization?.trim() || "",
        latitude: profile.latitude !== null && profile.latitude !== undefined ? profile.latitude : "",
        longitude: profile.longitude !== null && profile.longitude !== undefined ? profile.longitude : "",
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
          barState: updatedData.barState || profile.barState || "",
          specialization: updatedData.specialization || profile.specialization || "",
          experienceYears: profile.experienceYears || "", // Preserve Experience (read-only)
          aadharProofUrl: profile.aadharProofUrl || null,
          aadharProofFilename: profile.aadharProofFilename || null,
          barCertificateUrl: profile.barCertificateUrl || null,
          barCertificateFilename: profile.barCertificateFilename || null,
          latitude: updatedData.latitude !== undefined ? updatedData.latitude : profile.latitude,
          longitude: updatedData.longitude !== undefined ? updatedData.longitude : profile.longitude,
        });

        // Refresh profile from backend to get latest data (only once, and only if not already fetching)
        if (!isFetchingProfile) {
          dispatch(fetchUserProfile());
        }
        
        toast.success(response.data.message || "Profile updated successfully");
        setIsEditingProfile(false);
      } else {
        // Refresh profile from backend even if response format is different
        if (!isFetchingProfile) {
          dispatch(fetchUserProfile());
        }
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
                      aadharProofFilename: reduxProfile.aadharProofFilename || null,
                      barCertificateUrl: reduxProfile.barCertificateUrl || null,
                      barCertificateFilename: reduxProfile.barCertificateFilename || null,
                      latitude: reduxProfile.latitude || null,
                      longitude: reduxProfile.longitude || null,
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
                  Bar State
                </label>
                <input
                  type="text"
                  value={profile.barState || ""}
                  onChange={(e) => handleProfileChange("barState", e.target.value)}
                  disabled={!isEditingProfile}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 ${
                    isEditingProfile
                      ? "border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  }`}
                  placeholder="Bar State"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specialization
                </label>
                {isEditingProfile ? (
                  <select
                    value={profile.specialization || ""}
                    onChange={(e) => handleProfileChange("specialization", e.target.value)}
                    className="w-full p-3 border-2 border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg transition-all duration-200 bg-white text-gray-900"
                  >
                    <option value="">Select Specialization</option>
                    {specializationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={
                      specializationOptions.find((opt) => opt.value === profile.specialization)?.label ||
                      profile.specialization ||
                      ""
                    }
                    disabled={true}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                )}
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

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Aadhar Proof Document <span className="text-gray-400">(Read-only)</span>
                </label>
                {profile.aadharProofUrl ? (
                  <button
                    onClick={() => handleDownloadDocument(profile.aadharProofUrl, profile.aadharProofFilename || 'aadhar-proof.pdf')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Aadhar Proof PDF</span>
                  </button>
                ) : (
                  <input
                    type="text"
                    value="No document uploaded"
                    disabled={true}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bar Certificate Document <span className="text-gray-400">(Read-only)</span>
                </label>
                {profile.barCertificateUrl ? (
                  <button
                    onClick={() => handleDownloadDocument(profile.barCertificateUrl, profile.barCertificateFilename || 'bar-certificate.pdf')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Bar Certificate PDF</span>
                  </button>
                ) : (
                  <input
                    type="text"
                    value="No document uploaded"
                    disabled={true}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={profile.latitude || ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                    handleProfileChange("latitude", isNaN(value) ? "" : value);
                    setLocationError("");
                  }}
                  disabled={!isEditingProfile}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 ${
                    isEditingProfile
                      ? "border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  }`}
                  placeholder="Geographic latitude (e.g., 19.0760)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={profile.longitude || ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                    handleProfileChange("longitude", isNaN(value) ? "" : value);
                    setLocationError("");
                  }}
                  disabled={!isEditingProfile}
                  className={`w-full p-3 border-2 rounded-lg transition-all duration-200 ${
                    isEditingProfile
                      ? "border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  }`}
                  placeholder="Geographic longitude (e.g., 72.8777)"
                />
              </div>

              {/* Location Fetching Button */}
              {isEditingProfile && (
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap gap-3 mb-2">
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isGettingLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {isGettingLocation ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Getting Location...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Get Current Location</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error Messages */}
                  {locationError && (
                    <div className="mb-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                      {locationError}
                    </div>
                  )}
                  {!locationError && !isGettingLocation && (
                    <div className="mb-2 p-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded">
                      💡 Tip: Use "Get Current Location" to use your device's GPS to fetch your coordinates.
                    </div>
                  )}
                </div>
              )}

              {/* Google Maps Preview */}
              {profile.latitude &&
                profile.longitude &&
                isLatitudeValid(profile.latitude) &&
                isLongitudeValid(profile.longitude) && (
                  <div className="sm:col-span-2 mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Location Preview
                      </label>
                      <a
                        href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>Open in Google Maps</span>
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                    <div className="w-full h-64 border border-gray-300 rounded-md overflow-hidden bg-gray-100">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}&output=embed&z=15`}
                        title="Location Preview"
                      ></iframe>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {profile.latitude}, {profile.longitude}
                    </p>
                  </div>
                )}

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

