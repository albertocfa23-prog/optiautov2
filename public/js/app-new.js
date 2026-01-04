// app.js - OPTIAUTO Full Application (vanilla JS replication of React app)

// --- PocketBase Configuration ---
const PB_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8090'
    : 'https://optiauto.agarnet.duckdns.org';

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

// --- Global State ---
let currentUser = null;
let vehicles = [];
let selectedVehicleForAdd = null;
let vehicleSubscriptions = new Map();

// --- Maintenance Types ---
const MAINTENANCE_TYPES = [
    "Cambio de aceite y filtros",
    "Presión y estado de neumáticos",
    "Niveles de líquidos (frenos, refrigerante, etc.)",
    "Inspección de frenos",
    "Inspección de batería",
    "Bujías",
    "Correas"
];

const MAINTENANCE_INTERVALS = {
    "Cambio de aceite y filtros": 15000,
    "Inspección de frenos": 30000,
    "Correas": 100000,
    "Presión y estado de neumáticos": 10000,
    "Niveles de líquidos (frenos, refrigerante, etc.)": 15000,
    "Inspección de batería": 40000,
    "Bujías": 60000
};

// --- API Integration ---
async function fetchSmartcartApi(registrationNumber) {
    if (!registrationNumber) return [];

    console.log('Realizando llamada a la API de RegCheck para la matrícula: '+registrationNumber);

    const username = "TU_USERNAME";
    const url = "https://www.regcheck.org.uk/api/reg.asmx/CheckSpain";

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            registrationNumber,
            username
        }).toString()
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Error HTTP: '+response.status);
        }

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const carMakeNode = xmlDoc.querySelector("CarMake CurrentTextValue");
        const carModelNode = xmlDoc.querySelector("CarModel");
        const registrationYearNode = xmlDoc.querySelector("RegistrationYear");

        if (carMakeNode && carModelNode) {
            const make = carMakeNode.textContent;
            const model = carModelNode.textContent;
            const year = registrationYearNode ? parseInt(registrationYearNode.textContent, 10) : null;

            return [{
                make: make,
                model: model,
                year: year,
                description: "Datos obtenidos de la matrícula."
            }];
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error al obtener la información de la matrícula:", error);
        throw error;
    }
}

console.log('OPTIAUTO Full loaded');

// --- Initialize App ---
pb.authStore.onChange((token, model) => {
    currentUser = model;
    if (!currentUser) {
        vehicles = [];
        selectedVehicleForAdd = null;
    }
}, true);
