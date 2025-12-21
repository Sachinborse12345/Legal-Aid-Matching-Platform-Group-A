import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../api/axiosClient.js";

// ---------------------------------------------
// ASYNC THUNKS
// ---------------------------------------------

// Login thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/login", credentials);
      
      if (response.data && response.data.token) {
        // Store token and essential data in localStorage
        localStorage.setItem("accessToken", response.data.token);
        localStorage.setItem("email", response.data.email || credentials.username);
        localStorage.setItem("username", response.data.username || "");
        localStorage.setItem("role", response.data.role || credentials.role);
        localStorage.setItem("userId", response.data.userId || "");
        
        // Extract userData from response
        const userData = response.data.userData || {};
        
        // Debug: Log the response to see what backend is sending
        console.log("Login Response:", response.data);
        console.log("UserData from backend:", userData);
        console.log("profilePhotoUrl in userData:", userData.profilePhotoUrl);
        console.log("profilePhotoUrl at top level:", response.data.profilePhotoUrl);
        
        // Get profilePhotoUrl from userData or top level of response
        const profilePhotoUrl = userData.profilePhotoUrl || response.data.profilePhotoUrl || null;
        console.log("Extracted profilePhotoUrl:", profilePhotoUrl);
        
        return {
          token: response.data.token,
          email: response.data.email || credentials.username,
          username: response.data.username || "",
          role: response.data.role || credentials.role,
          userId: response.data.userId || "",
          message: response.data.message || "Login successful!",
          // Include userData (profile) in the return value
          userData: {
            id: userData.id || null,
            fullName: userData.fullName || null,
            shortName: userData.fullName ? (userData.fullName.includes(" ") 
              ? userData.fullName.split(" ")[0] + " " + userData.fullName.split(" ")[userData.fullName.split(" ").length - 1]
              : userData.fullName) : null,
            aadhaar: userData.aadharNum || userData.aadhaar || null,
            email: userData.email || response.data.email || null,
            mobile: userData.mobileNum || userData.mobile || null,
            dob: userData.dateOfBirth || userData.dob || null,
            state: userData.state || null,
            district: userData.district || null,
            city: userData.city || null,
            address: userData.address || null,
            photoUrl: profilePhotoUrl || userData.profilePhotoUrl || null, // Use extracted profilePhotoUrl
            role: response.data.role || credentials.role,
            // Lawyer-specific fields
            barCouncilId: userData.barCouncilId || null,
            barState: userData.barState || null,
            specialization: userData.specialization || null,
            experienceYears: userData.experienceYears || userData.experience || null,
            aadharProofUrl: userData.aadharProofUrl || null,
            barCertificateUrl: userData.barCertificateUrl || null,
            latitude: userData.latitude || null,
            longitude: userData.longitude || null,
          },
        };
      } else {
        return rejectWithValue("Invalid response from server");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Login failed"
      );
    }
  }
);

// Fetch user profile thunk
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/profile/me");
      
      // Log response for debugging
      console.log("Profile API Response:", response.data);
      
      if (response.data) {
        return response.data;
      } else {
        return rejectWithValue("No profile data received");
      }
    } catch (error) {
      console.error("Profile fetch error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to fetch profile"
      );
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("email");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      
      return true;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

// ---------------------------------------------
// INITIAL STATE
// ---------------------------------------------
const initialState = {
  // User authentication data
  user: {
    token: localStorage.getItem("accessToken") || null,
    email: localStorage.getItem("email") || null,
    username: localStorage.getItem("username") || null,
    role: localStorage.getItem("role") || null,
    userId: localStorage.getItem("userId") || null,
  },
  
  // User profile data (fetched from backend)
  profile: {
    id: null,
    fullName: null,
    shortName: null,
    aadhaar: null,
    email: null,
    mobile: null,
    dob: null,
    state: null,
    district: null,
    city: null,
    address: null,
    photoUrl: null,
    role: null,
    // Lawyer-specific fields
    barCouncilId: null,
    barState: null,
    specialization: null,
    experienceYears: null,
    aadharProofUrl: null,
    barCertificateUrl: null,
    // NGO-specific fields
    ngoName: null,
    ngoType: null,
    registrationNumber: null,
    registrationCertificateUrl: null,
    registrationCertificateFilename: null,
    latitude: null,
    longitude: null,
    createdAt: null,
    registrationNumber: null,
    contact: null,
    pincode: null,
    registrationCertificateUrl: null,
    latitude: null,
    longitude: null,
  },
  
  // Loading and error states
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  error: null,
};

// ---------------------------------------------
// SLICE
// ---------------------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update profile data manually (for editing)
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    
    // Set user data (for manual updates)
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = {
          token: action.payload.token,
          email: action.payload.email,
          username: action.payload.username,
          role: action.payload.role,
          userId: action.payload.userId,
        };
        // Store profile data from login response
        if (action.payload.userData) {
          const userData = action.payload.userData;
          state.profile = {
            id: userData.id || null,
            fullName: userData.fullName || null,
            shortName: userData.shortName || userData.fullName || null,
            aadhaar: userData.aadhaar || userData.aadharNum || null,
            email: userData.email || action.payload.email || null,
            mobile: userData.mobile || userData.mobileNum || null,
            dob: userData.dob || userData.dateOfBirth || null,
            state: userData.state || null,
            district: userData.district || null,
            city: userData.city || null,
            address: userData.address || null,
            photoUrl: userData.photoUrl || null,
            role: userData.role || action.payload.role || null,
            // Lawyer-specific fields
            barCouncilId: userData.barCouncilId || null,
            barState: userData.barState || null,
            specialization: userData.specialization || null,
            experienceYears: userData.experienceYears || userData.experience || null,
            aadharProofUrl: userData.aadharProofUrl || null,
            barCertificateUrl: userData.barCertificateUrl || null,
            latitude: userData.latitude || null,
            longitude: userData.longitude || null,
            // NGO-specific fields
            ngoName: userData.ngoName || null,
            ngoType: userData.ngoType || null,
            registrationNumber: userData.registrationNumber || null,
            registrationCertificateUrl: userData.registrationCertificateUrl || null,
            registrationCertificateFilename: userData.registrationCertificateFilename || null,
            latitude: userData.latitude || null,
            longitude: userData.longitude || null,
            createdAt: userData.createdAt || null,
            registrationNumber: userData.registrationNumber || null,
            contact: userData.contact || userData.mobile || userData.mobileNum || null,
            pincode: userData.pincode || null,
            registrationCertificateUrl: userData.registrationCertificateUrl || null,
            registrationCertificateFilename: userData.registrationCertificateFilename || null,
            latitude: userData.latitude || null,
            longitude: userData.longitude || null,
            createdAt: userData.createdAt || null,
          };
        }
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        state.user = {
          token: null,
          email: null,
          username: null,
          role: null,
          userId: null,
        };
      });
    
    // FETCH USER PROFILE
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        
        // Handle different field names from backend (mobileNum vs mobile, aadharNum vs aadhaar)
        const mobile = payload.mobile || payload.mobileNum || null;
        const aadhaar = payload.aadhaar || payload.aadharNum || null;
        
        // Generate shortName from fullName if not provided
        const fullName = payload.fullName || null;
        const shortName = payload.shortName || (fullName && fullName.includes(" ") 
          ? fullName.split(" ")[0] + " " + fullName.split(" ")[fullName.split(" ").length - 1]
          : fullName) || null;
        
        state.profile = {
          id: payload.id || null,
          fullName: fullName,
          shortName: shortName,
          aadhaar: aadhaar,
          email: payload.email || null,
          mobile: mobile,
          dob: payload.dob || payload.dateOfBirth || null,
          state: payload.state || null,
          district: payload.district || null,
          city: payload.city || null,
          address: payload.address || null,
          photoUrl: payload.photoUrl || null,
          role: payload.role || null,
          // Lawyer-specific fields
          barCouncilId: payload.barCouncilId || null,
          barState: payload.barState || null,
          specialization: payload.specialization || null,
          experienceYears: payload.experienceYears || payload.experience || null,
          aadharProofUrl: payload.aadharProofUrl || null,
          aadharProofFilename: payload.aadharProofFilename || null,
          barCertificateUrl: payload.barCertificateUrl || null,
          barCertificateFilename: payload.barCertificateFilename || null,
          // NGO-specific fields
          ngoName: payload.ngoName || null,
          ngoType: payload.ngoType || null,
          registrationNumber: payload.registrationNumber || null,
          registrationCertificateUrl: payload.registrationCertificateUrl || null,
          registrationCertificateFilename: payload.registrationCertificateFilename || null,
          latitude: payload.latitude || null,
          longitude: payload.longitude || null,
          createdAt: payload.createdAt || null,
          registrationNumber: payload.registrationNumber || null,
          contact: payload.contact || payload.mobile || payload.mobileNum || null,
          pincode: payload.pincode || null,
          registrationCertificateUrl: payload.registrationCertificateUrl || null,
          registrationCertificateFilename: payload.registrationCertificateFilename || null,
          latitude: payload.latitude || null,
          longitude: payload.longitude || null,
          createdAt: payload.createdAt || null,
        };
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // LOGOUT
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = {
          token: null,
          email: null,
          username: null,
          role: null,
          userId: null,
        };
        state.profile = {
          id: null,
          fullName: null,
          shortName: null,
          aadhaar: null,
          email: null,
          mobile: null,
          dob: null,
          state: null,
          district: null,
          city: null,
          address: null,
          photoUrl: null,
          role: null,
          // Lawyer-specific fields
          barCouncilId: null,
          barState: null,
          specialization: null,
          experienceYears: null,
          aadharProofUrl: null,
          aadharProofFilename: null,
          barCertificateUrl: null,
          barCertificateFilename: null,
          latitude: null,
          longitude: null,
          createdAt: null,
          // NGO-specific fields
          ngoName: null,
          ngoType: null,
          registrationNumber: null,
          contact: null,
          pincode: null,
          registrationCertificateUrl: null,
          registrationCertificateFilename: null,
        };
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateProfile, setUser } = authSlice.actions;
export default authSlice.reducer;

