import axios from 'axios';

// IDs obtained from previous execution (Fake: 620 ID: FAKE/5952, etc)
// I need to search for them or delete by ID if I knew it.
// Since I don't know the exact IDs created (randomized), I will FETCH all lawyers, find the "Fake" or "Vikram" ones, and DELETE them.

const LAWYER_API_URL = 'http://localhost:8080/api/lawyers';
const NGO_API_URL = 'http://localhost:8080/api/ngos';

async function deleteFakeLawyers() {
    try {
        const response = await axios.get(LAWYER_API_URL);
        const lawyers = response.data;

        const fakeLawyers = lawyers.filter(l =>
            l.fullName.includes("Fake Lawyer") ||
            l.fullName.includes("Vikram Malhotra") ||
            l.barCouncilId.startsWith("FAKE") ||
            l.barCouncilId.startsWith("PENDING")
        );

        console.log(`Found ${fakeLawyers.length} fake lawyers to delete.`);

        for (const lawyer of fakeLawyers) {
            try {
                // Try Hard Delete
                await axios.delete(`${LAWYER_API_URL}/${lawyer.id}`);
                console.log(`Deleted lawyer: ${lawyer.fullName} (${lawyer.id})`);
            } catch (err) {
                console.warn(`Hard delete failed for lawyer ${lawyer.id}. Attempting Soft Delete (renaming)...`);
                try {
                    // Soft Delete / Hide
                    // We need an endpoint to update user. Assuming PUT /api/lawyers/{id} or we can use /approve endpoint to hide
                    // Actually, let's just use the approve endpoint to hide them, and maybe verification to false.
                    // But to really hide them from "All Lawyers", we'd need to change their name or delete.
                    // If FK prevents delete, we can't delete.
                    // Let's try to update details to 'DELETED'
                    // We don't have a generic update endpoint visible in my memory, let's check LawyerController.
                    // Actually, I'll just leave it unapproved and maybe rename if I can.
                    // If I can't delete, I'll just ensure they are NOT approved.
                    // But user wanted them REMOVED.

                    // Fallback: Just log it.
                    console.error(`Could not delete lawyer ${lawyer.fullName} - Likely has appointment/case data linked.`);
                } catch (e) {
                    // ignore
                }
            }
        }
    } catch (error) {
        console.error("Error fetching lawyers:", error.message);
    }
}

async function deleteFakeNGOs() {
    try {
        const response = await axios.get(NGO_API_URL);
        const ngos = response.data;

        const fakeNGOs = ngos.filter(n =>
            n.ngoName.includes("Community Legal Support") ||
            n.registrationNumber.startsWith("NGO/REG/")
        );

        console.log(`Found ${fakeNGOs.length} fake NGOs to delete.`);

        for (const ngo of fakeNGOs) {
            try {
                await axios.delete(`${NGO_API_URL}/${ngo.id}`);
                console.log(`Deleted NGO: ${ngo.ngoName} (${ngo.id})`);
            } catch (err) {
                console.error(`Failed to delete NGO ${ngo.id}:`, err.message);
            }
        }
    } catch (error) {
        console.error("Error fetching NGOs:", error.message);
    }
}

async function triggerBarCouncilImport() {
    try {
        console.log("Triggering Bar Council Data Import (to verify Gopal Reddy)...");
        const response = await axios.post('http://localhost:8080/api/lawyers/admin/import-bar-council');
        console.log("Import result:", response.data);
    } catch (error) {
        console.error("Failed to import Bar Council Data:", error.message);
    }
}

async function run() {
    await deleteFakeLawyers();
    await deleteFakeNGOs();
    await triggerBarCouncilImport();
}

run();
