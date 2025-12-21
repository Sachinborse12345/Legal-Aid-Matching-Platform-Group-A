import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { saveStep as saveStepApi, submitCase as submitCaseApi, getDraftCase, startNewCase as startNewCaseApi, uploadDocuments as uploadDocumentsApi } from "../api/caseApi";

// Async thunks
export const fetchDraftCase = createAsyncThunk(
  "case/fetchDraft",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getDraftCase();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch draft");
    }
  }
);

export const saveStepData = createAsyncThunk(
  "case/saveStep",
  async ({ step, stepData, caseId }, { rejectWithValue }) => {
    try {
      const res = await saveStepApi(step, stepData, caseId);
      return { ...res.data, step };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to save step");
    }
  }
);

export const submitCaseData = createAsyncThunk(
  "case/submit",
  async ({ caseId }, { rejectWithValue }) => {
    try {
      // Documents are already uploaded to case_documents table during step 6
      // No need to upload again here
      const res = await submitCaseApi(caseId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit case");
    }
  }
);

export const startNewCaseAction = createAsyncThunk(
  "case/startNew",
  async (_, { rejectWithValue }) => {
    try {
      const res = await startNewCaseApi();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to start new case");
    }
  }
);

const initialFormState = {
  applicantName: "",
  email: "",
  mobile: "",
  aadhaar: "",
  victimName: "",
  relation: "",
  victimGender: "",
  victimAge: "",
  caseTitle: "",
  caseType: "",
  incidentDate: "",
  incidentPlace: "",
  urgency: "",
  specialization: "",
  courtType: "",
  background: "",
  relief: "",
  seekingNgoHelp: "",
  ngoType: "",
  documents: [],
  confirm: false,
};

const initialState = {
  caseId: null,
  caseNumber: null,
  step: 0,
  form: { ...initialFormState },
  isLoading: false,
  saveStatus: "",
  error: null,
};

const caseSlice = createSlice({
  name: "case",
  initialState,
  reducers: {
    updateForm: (state, action) => {
      state.form = { ...state.form, ...action.payload };
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    setSaveStatus: (state, action) => {
      state.saveStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetCase: (state) => {
      state.caseId = null;
      state.caseNumber = null;
      state.step = 0;
      state.form = { ...initialFormState };
      state.saveStatus = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch draft
    builder
      .addCase(fetchDraftCase.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDraftCase.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const draft = action.payload;
          state.caseId = draft.id;
          state.caseNumber = draft.caseNumber;
          state.step = draft.currentStep || 0;
          state.form = {
            applicantName: draft.applicantName || "",
            email: draft.email || "",
            mobile: draft.mobile || "",
            aadhaar: draft.aadhaar || "",
            victimName: draft.victimName || "",
            relation: draft.relation || "",
            victimGender: draft.victimGender || "",
            victimAge: draft.victimAge?.toString() || "",
            caseTitle: draft.caseTitle || "",
            caseType: draft.caseType || "",
            incidentDate: draft.incidentDate || "",
            incidentPlace: draft.incidentPlace || "",
            urgency: draft.urgency || "",
            specialization: draft.specialization || "",
            courtType: draft.courtType || "",
            background: draft.background || "",
            relief: draft.relief || "",
            seekingNgoHelp: draft.seekingNgoHelp || "",
            ngoType: draft.ngoType || "",
            documents: [],
            confirm: false,
          };
        }
      })
      .addCase(fetchDraftCase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Save step
    builder
      .addCase(saveStepData.pending, (state) => {
        state.isLoading = true;
        state.saveStatus = "Saving...";
      })
      .addCase(saveStepData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.caseId = action.payload.caseId;
        state.caseNumber = action.payload.caseNumber;
        state.step = action.payload.step + 1;
        state.saveStatus = "Saved!";
        state.error = null;
      })
      .addCase(saveStepData.rejected, (state, action) => {
        state.isLoading = false;
        state.saveStatus = "Error saving";
        state.error = action.payload;
      });

    // Submit case
    builder
      .addCase(submitCaseData.pending, (state) => {
        state.isLoading = true;
        state.saveStatus = "Submitting...";
      })
      .addCase(submitCaseData.fulfilled, (state) => {
        state.isLoading = false;
        state.saveStatus = "Submitted!";
        // Reset form after successful submission
        state.caseId = null;
        state.caseNumber = null;
        state.step = 0;
        state.form = { ...initialFormState };
        state.error = null;
      })
      .addCase(submitCaseData.rejected, (state, action) => {
        state.isLoading = false;
        state.saveStatus = "Error";
        state.error = action.payload;
      });

    // Start new case
    builder
      .addCase(startNewCaseAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startNewCaseAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.caseId = action.payload.caseId;
        state.caseNumber = action.payload.caseNumber;
        state.step = 0;
        state.form = { ...initialFormState };
        state.error = null;
      })
      .addCase(startNewCaseAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { updateForm, setStep, setSaveStatus, clearError, resetCase } = caseSlice.actions;
export default caseSlice.reducer;
