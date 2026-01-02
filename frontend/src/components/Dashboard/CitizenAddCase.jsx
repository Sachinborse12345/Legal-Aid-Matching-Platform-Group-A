import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchDraftCase,
  saveStepData,
  submitCaseData,
  startNewCaseAction,
  updateForm,
  setStep as setStepAction,
  setSaveStatus
} from "../../Redux/caseSlice";

/* ---------------- STEPS ---------------- */

const STEPS = [
  "Applicant",
  "Victim",
  "Case Details",
  "Incident",
  "Legal Preference",
  "Explanation",
  "Documents",
];
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile); // Indian mobile numbers
const isValidName = (name) => /^[A-Za-z ]+$/.test(name.trim());

export default function CaseFilingForm() {
  const dispatch = useDispatch();
  const { caseId, step, form, isLoading: loading, saveStatus, error } = useSelector((state) => state.case);

  const [victimNameError, setVictimNameError] = useState("");
  const handle = (k, v) => dispatch(updateForm({ [k]: v }));

  // Load draft case on mount
  useEffect(() => {
    dispatch(fetchDraftCase());
  }, [dispatch]);

  // Clear save status after 2 seconds
  useEffect(() => {
    if (saveStatus === "Saved!" || saveStatus === "Submitted!") {
      const timer = setTimeout(() => dispatch(setSaveStatus("")), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const requiredFields = {
    0: ["applicantName", "email", "mobile", "aadhaar"],
    1: ["victimName", "relation", "victimGender", "victimAge"],
    2: ["caseTitle", "caseType"],
    3: ["incidentDate", "incidentPlace", "urgency"],
    4: ["specialization", "courtType", "seekingNgoHelp"],
    5: ["background", "relief"],
    6: ["confirm"],
  };

  const getStepData = (stepNum) => {
    switch (stepNum) {
      case 0:
        return {
          applicantName: form.applicantName,
          email: form.email,
          mobile: form.mobile,
          aadhaar: form.aadhaar,
        };
      case 1:
        return {
          victimName: form.victimName,
          relation: form.relation,
          victimGender: form.victimGender,
          victimAge: form.victimAge,
        };
      case 2:
        return {
          caseTitle: form.caseTitle,
          caseType: form.caseType,
        };
      case 3:
        return {
          incidentDate: form.incidentDate,
          incidentPlace: form.incidentPlace,
          urgency: form.urgency,
        };
      case 4:
        return {
          specialization: form.specialization,
          courtType: form.courtType,
          seekingNgoHelp: form.seekingNgoHelp,
          ngoType: form.ngoType,
        };
      case 5:
        return {
          background: form.background,
          relief: form.relief,
        };
      case 6:
        return {};
      default:
        return {};
    }
  };

  const validateStep = () => {
    const fields = requiredFields[step] || [];

    // Basic required check
    for (let field of fields) {
      if (!form[field]) {
        toast.error("Please fill all required fields.");
        return false;
      }
    }

    // STEP 0: Email & Mobile validation
    if (step === 0) {
      if (!isValidName(form.applicantName)) {
        toast.error("Name should contain only letters and spaces.");
        return false;
      }
      if (!isValidEmail(form.email)) {
        toast.error("Please enter a valid email address.");
        return false;
      }

      if (!isValidMobile(form.mobile)) {
        toast.error("Please enter a valid 10-digit mobile number.");
        return false;
      }
      if (form.mobile.length !== 10) {
        toast.error("Your number should be 10-digits only.");
        return false;
      }

      if (form.aadhaar.length !== 12) {
        toast.error("Aadhaar number must be exactly 12 digits.");
        return false;
      }
    }

    // STEP 4: NGO conditional validation
    if (step === 4 && form.seekingNgoHelp === "Yes" && !form.ngoType) {
      toast.error("Please select type of NGO.");
      return false;
    }

    return true;
  };

  const next = async () => {
    if (!validateStep()) {
      return;
    }

    const stepData = getStepData(step);
    const result = await dispatch(saveStepData({ step, stepData, caseId }));

    if (saveStepData.fulfilled.match(result)) {
      toast.success("Step saved successfully!");
    }
  };

  const back = () => dispatch(setStepAction(step - 1));

  const handleSubmit = async () => {
    if (!form.confirm) {
      toast.error("Please confirm the information is correct.");
      return;
    }

    const result = await dispatch(submitCaseData({ caseId, documents: form.documents }));

    if (submitCaseData.fulfilled.match(result)) {
      if (result.payload.uploadErrors && result.payload.uploadErrors.length > 0) {
        toast.warn("Some files failed to upload: " + result.payload.uploadErrors.join(", "));
      }
      toast.success("Case submitted successfully!");
    }
  };

  const handleStartNewCase = () => {
    dispatch(startNewCaseAction());
  };

  return (
    <div className="min-h-screen bg-[#f3f6f5] p-4 sm:p-10">
      {/* HEADER */}
      <div className="bg-[#2f4f4f] rounded-2xl p-6 sm:p-10 mb-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Add Your Case</h1>
            <p className="text-gray-200 text-base sm:text-lg max-w-3xl">
              Share accurate details so we can connect you with the right lawyer
              based on urgency, location, and legal requirement.
            </p>
          </div>

        </div>
        {saveStatus && (
          <p className="mt-4 text-white text-sm">{saveStatus}</p>
        )}
      </div>

      {/* STEPPER */}
      <div className="flex flex-wrap justify-center gap-4 mb-10 max-w-6xl mx-auto md:flex-nowrap md:justify-between md:gap-0">
        {STEPS.map((s, i) => (
          <div key={i} className="text-center w-16 md:w-auto md:flex-1">
            <div
              className={`mx-auto w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 font-semibold text-sm md:text-base ${i <= step
                  ? "bg-[#234f4a] border-[#234f4a] text-white"
                  : "border-gray-300 text-gray-400"
                }`}
            >
              {i + 1}
            </div>
            <p className="mt-2 text-xs md:text-sm">{s}</p>
          </div>
        ))}
      </div>

      {/* FORM CARD */}
      <div className="bg-white max-w-6xl mx-auto rounded-xl shadow-xl p-6 sm:p-10">
        {/* STEP 1 */}
        {step === 0 && (
          <Section title="Applicant Details">
            {/* INSTRUCTION */}
            <div className="md:col-span-2">
              <p className="mb-6 text-sm text-gray-600 italic">
                Please enter your personal details exactly as per official
                records. These details are used for lawyer verification and case
                communication.
              </p>
            </div>

            {/* FULL NAME */}
            <Input
              label="Full Name"
              required
              maxLength={50}
              value={form.applicantName}
              placeholder="Example: Rahul Sharma"
              hint="According to PAN or AADHAR proof (Only alphabets and spaces are allowed.)"
              onChange={(v) =>
                handle("applicantName", v.replace(/[^A-Za-z ]/g, ""))
              }
            />

            {/* EMAIL */}
            <Input
              label="Email Address"
              type="email"
              required
              value={form.email}
              placeholder="Example: rahul.sharma@gmail.com"
              hint="Case updates and lawyer communication will be sent to this email."
              onChange={(v) => handle("email", v)}
            />

            {/* MOBILE */}
            <Input
              label="Mobile Number"
              type="tel"
              required
              maxLength={10}
              value={form.mobile}
              placeholder="Example: 9876543210"
              hint="Enter a valid 10-digit mobile number without country code."
              onChange={(v) => handle("mobile", v)}
            />

            {/* AADHAAR */}
            <Input
              label="Aadhaar Number"
              type="text"
              required
              value={form.aadhaar}
              placeholder="Example: 123412341234"
              hint="Enter your 12-digit Aadhaar number (numbers only)."
              maxLength={12}
              pattern="\d{12}"
              onChange={(v) =>
                handle("aadhaar", v.replace(/\D/g, "").slice(0, 12))
              }
            />
          </Section>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <Section title="Victim Details">
            {/* INSTRUCTION */}
            <div className="md:col-span-2">
              <p className="mb-4 text-sm text-gray-600 italic">
                Enter the details of the person directly affected by the case.
                These details are important for legal assessment.
              </p>
            </div>

            {/* VICTIM NAME */}
            <Input
              label="Victim Name"
              required
              value={form.victimName}
              placeholder="Example: Anjali Sharma"
              hint={victimNameError || "Only alphabets and spaces are allowed."}
              error={!!victimNameError}
              onChange={(v) => {
                if (/[^A-Za-z ]/.test(v)) {
                  setVictimNameError(
                    "Victim name should contain only letters and spaces."
                  );
                } else {
                  setVictimNameError("");
                }
                handle("victimName", v.replace(/[^A-Za-z ]/g, ""));
              }}
            />

            {/* RELATION */}
            <Select
              label="Relation with Applicant"
              required
              value={form.relation}
              hint="Select how the applicant is related to the victim."
              options={[
                "Self",
                "Father",
                "Mother",
                "Son",
                "Daughter",
                "Husband",
                "Wife",
                "Brother",
                "Sister",
                "Grandfather",
                "Grandmother",
                "Legal Guardian",
                "Relative",
                "Friend",
                "Other",
              ]}
              onChange={(v) => handle("relation", v)}
            />

            {/* GENDER */}
            <Select
              label="Gender"
              required
              value={form.victimGender}
              hint="Select the gender of the victim."
              options={["Male", "Female", "Other"]}
              onChange={(v) => handle("victimGender", v)}
            />

            {/* AGE */}
            <Input
              label="Age"
              type="number"
              required
              value={form.victimAge}
              placeholder="Example: 35"
              hint="Enter age between 1 and 100 years."
              minLength={1}
              maxLength={3}
              onChange={(v) => handle("victimAge", v)}
            />
          </Section>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <Section title="Case Details">
            <Input
              label="Case Title"
              required
              value={form.caseTitle}
              onChange={(v) => handle("caseTitle", v)}
            />
            <Select
              label="Case Type"
              required
              value={form.caseType}
              options={["Civil", "Criminal", "Family", "Property", "Consumer"]}
              onChange={(v) => handle("caseType", v)}
            />
          </Section>
        )}

        {/* STEP 4 */}
        {step === 3 && (
          <Section title="Incident Details">
            <Input
              label="Incident Date"
              type="date"
              required
              value={form.incidentDate}
              onChange={(v) => handle("incidentDate", v)}
            />
            <Input
              label="Incident Place (City/District)"
              required
              value={form.incidentPlace}
              onChange={(v) => handle("incidentPlace", v)}
            />
            <Select
              label="Urgency Level"
              required
              value={form.urgency}
              options={["Low", "Medium", "High"]}
              onChange={(v) => handle("urgency", v)}
            />
          </Section>
        )}

        {/* STEP 5 */}
        {step === 4 && (
          <Section title="Legal Preference">
            <Select
              label="Lawyer Specialization"
              required
              value={form.specialization}
              options={["Criminal", "Civil", "Family", "Property"]}
              onChange={(v) => handle("specialization", v)}
            />
            <Select
              label="Court Type"
              required
              value={form.courtType}
              options={["District Court", "High Court", "Supreme Court"]}
              onChange={(v) => handle("courtType", v)}
            />
            <Select
              label="Seeking Help from NGO?"
              required
              value={form.seekingNgoHelp}
              options={["Yes", "No"]}
              onChange={(v) => handle("seekingNgoHelp", v)}
            />

            {form.seekingNgoHelp === "Yes" && (
              <Select
                label="Type of NGO"
                required
                value={form.ngoType}
                options={[
                  "Legal Aid",
                  "Women Rights",
                  "Child Protection",
                  "Senior Citizen Welfare",
                  "Human Rights",
                ]}
                onChange={(v) => handle("ngoType", v)}
              />
            )}
          </Section>
        )}

        {/* STEP 6 */}
        {step === 5 && (
          <Section title="Case Explanation">
            {/* INSTRUCTION */}
            <p className="mb-4 text-sm text-gray-600 italic">
              Please explain your case clearly and briefly. This information
              helps the lawyer understand your situation without an initial
              phone call.
            </p>

            {/* CASE BACKGROUND */}
            <div className="md:col-span-2">
              <p className="mb-2 text-sm text-[#234f4a] italic">
                <strong>Example:</strong> I purchased a flat in 2021, but the
                builder has failed to hand over possession despite multiple
                notices.
              </p>
              <Textarea
                label="Case Background"
                required
                rows={3}
                value={form.background}
                placeholder="Describe what happened, when it happened, and who is involved..."
                onChange={(v) => handle("background", v)}
              />
            </div>

            {/* RELIEF EXPECTED */}
            <div className="md:col-span-2">
              <p className="mb-2 text-sm text-[#234f4a] italic">
                <strong>Example:</strong> I am seeking compensation and
                immediate possession of the property.
              </p>
              <Textarea
                label="Relief Expected"
                required
                rows={2}
                value={form.relief}
                placeholder="Mention the outcome you expect (compensation, stay order, bail, etc.)"
                onChange={(v) => handle("relief", v)}
              />
            </div>
          </Section>
        )}

        {/* STEP 7 */}
        {step === 6 && (
          <Section title="Documents & Confirmation">
            <div className="md:col-span-2">
              <p className="mb-2 italic text-[#234f4a]">
                FIR Copy • Notices / Summons • Agreements / Contracts • Medical
                Reports • Court Orders (If any) - PDF format only
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Max file size: <strong>2MB</strong> per file. Allowed: PDF only
              </p>

              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="w-full border border-dashed p-6 rounded-lg mb-2"
                onChange={(e) => {
                  const files = [...e.target.files];
                  const maxSize = 2 * 1024 * 1024; // 2MB
                  const validFiles = [];
                  const errors = [];

                  files.forEach(file => {
                    if (file.type !== "application/pdf") {
                      errors.push(`${file.name}: Only PDF files are allowed`);
                    } else if (file.size > maxSize) {
                      errors.push(`${file.name}: exceeds 2MB limit`);
                    } else if (form.documents.some(d => d.name === file.name && d.size === file.size)) {
                      errors.push(`${file.name}: already added`);
                    } else {
                      validFiles.push(file);
                    }
                  });

                  if (errors.length > 0) {
                    toast.error("Some files were skipped: " + errors.join(", "));
                  }

                  if (validFiles.length > 0) {
                    handle("documents", [...form.documents, ...validFiles]);
                  }

                  // Reset input value to allow selecting the same file again if needed after removal
                  e.target.value = '';
                }}
              />

              {form.documents.length > 0 && (
                <div className="mb-4 text-sm text-gray-600">
                  <p className="font-medium mb-2">Selected files:</p>
                  <ul className="space-y-2">
                    {form.documents.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                        <span className="truncate max-w-[80%]">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button
                          onClick={() => {
                            const newDocs = form.documents.filter((_, i) => i !== idx);
                            handle("documents", newDocs);
                          }}
                          className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  required
                  checked={form.confirm}
                  onChange={(e) => handle("confirm", e.target.checked)}
                />
                I confirm the above information is correct.
              </label>
            </div>
          </Section>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col-reverse gap-3 mt-10 sm:flex-row sm:justify-between sm:gap-0">
          {step > 0 && (
            <button onClick={back} className="w-full sm:w-auto px-6 sm:px-8 py-3 border rounded-lg">
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-10 py-3 bg-[#234f4a] text-white rounded-lg sm:ml-auto disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save & Continue →"}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-10 py-3 bg-green-700 text-white rounded-lg sm:ml-auto disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Case"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-6">{title}</h2>
    <div className="grid md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const Input = ({
  label,
  type = "text",
  required,
  placeholder,
  hint,
  onChange,
  maxLength,
  pattern,
  value = "",
}) => (
  <div>
    <label className="block mb-1 font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <input
      type={type}
      required={required}
      placeholder={placeholder}
      maxLength={maxLength}
      pattern={pattern}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#7fb3a2]"
    />

    {hint && <p className="mt-1 text-sm italic text-gray-500">{hint}</p>}
  </div>
);

const Select = ({ label, options, required, onChange, value = "", hint }) => (
  <div>
    <label className="block mb-1 font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border rounded-lg"
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    {hint && <p className="mt-1 text-sm italic text-gray-500">{hint}</p>}
  </div>
);

const Textarea = ({ label, required, onChange, rows = 3, placeholder, value = "" }) => (
  <div className="md:col-span-2">
    <label className="block mb-1 font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <textarea
      rows={rows}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#7fb3a2]"
    />
  </div>
);
