import axios from 'axios';
import FormData from 'form-data';

const API_URL = 'http://localhost:8080/api/lawyers/add';

async function createLawyer(data) {
    try {
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        const response = await axios.post(API_URL, formData, {
            headers: {
                ...formData.getHeaders ? formData.getHeaders() : {} // Handle headers for node
            }
        });
        console.log(`Successfully created lawyer: ${data.fullName} (ID: ${data.barId})`);
    } catch (error) {
        console.error(`Failed to create lawyer ${data.fullName}:`, error.response ? error.response.data : error.message);
    }
}

const verifiedLawyer = {
    fullName: "Suresh Patil (Test Verified)",
    email: "suresh.test@example.com",
    phone: "9999999999",
    aadhar: "999988887777",
    barId: "MAH/9999/2020", // Exists in CSV
    barState: "Maharashtra",
    specialization: "Tax",
    experience: "5",
    address: "Test Address Verified",
    district: "Nagpur",
    city: "Nagpur",
    state: "Maharashtra",
    password: "password123"
};

const NGO_API_URL = 'http://localhost:8080/api/ngos/add';

async function createNGO(data) {
    try {
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        const response = await axios.post(NGO_API_URL, formData, {
            headers: {
                ...formData.getHeaders ? formData.getHeaders() : {} // Handle headers for node
            }
        });
        console.log(`Successfully created NGO: ${data.ngoName}`);
    } catch (error) {
        // console.error(`Failed to create NGO ${data.ngoName}:`, error.response ? error.response.data : error.message);
    }
}

const unverifiedLawyer = {
    fullName: "Vikram Malhotra",
    email: "vikram.m" + Math.floor(Math.random() * 10000) + "@example.com",
    phone: "9876543210",
    aadhar: "5555" + Math.floor(Math.random() * 100000000),
    barId: "PENDING/" + Math.floor(Math.random() * 10000),
    barState: "Maharashtra",
    specialization: "Civil",
    experience: "4",
    address: "Office 402, Legal Heights",
    district: "Pune",
    city: "Pune",
    state: "Maharashtra",
    password: "password123"
};

const unverifiedNGO = {
    ngoName: "Community Legal Support",
    email: "contact" + Math.floor(Math.random() * 10000) + "@communitylegal.org",
    contact: "020-25654321",
    ngoType: "Legal Aid",
    registrationNumber: "NGO/REG/" + Math.floor(Math.random() * 10000),
    address: "12, Social Justice Road",
    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    pincode: "400001",
    password: "password123"
};

async function run() {
    console.log("Creating Verified Lawyer...");
    await createLawyer(verifiedLawyer);

    console.log("\nCreating Realistic Unverified Lawyer...");
    await createLawyer(unverifiedLawyer);

    console.log("\nCreating Realistic Unverified NGO...");
    await createNGO(unverifiedNGO);
}

run();
