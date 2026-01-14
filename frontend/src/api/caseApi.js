import axiosClient from "./axiosClient";

// Save step data
export const saveStep = async (step, formData, caseId = null) => {
    const payload = { step, ...formData };
    if (caseId) payload.caseId = caseId;
    return axiosClient.post("/cases/save-step", payload);
};

// Submit final case
export const submitCase = async (caseId = null) => {
    return axiosClient.post("/cases/submit", { caseId });
};

// Get all cases for user
export const getMyCases = async () => {
    return axiosClient.get("/cases/my-cases");
};

// Get draft case
export const getDraftCase = async () => {
    return axiosClient.get("/cases/draft");
};

// Start new case
export const startNewCase = async () => {
    return axiosClient.post("/cases/new");
};

// Get case by ID
export const getCaseById = async (id) => {
    return axiosClient.get(`/cases/${id}`);
};

// Upload documents (max 2MB each)
export const uploadDocuments = async (caseId, files) => {
    const formData = new FormData();
    formData.append("caseId", caseId);
    files.forEach((file) => {
        formData.append("documents", file);
    });
    return axiosClient.post("/cases/upload-documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// Update case status
export const updateCaseStatus = async (caseId, status) => {
    return axiosClient.put(`/cases/${caseId}/status`, { status });
};

// Get matches for a case
export const getMatches = async (caseId) => {
    return axiosClient.get(`/cases/${caseId}/matches`);
};

