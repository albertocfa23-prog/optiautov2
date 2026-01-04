// app-full.js - Aplicación completa con todas las funcionalidades

import { initAuth, isAuthenticated, getCurrentUser } from './auth.js';
import { showMessage } from './utils.js';
import { getMaintenances, renderMaintenanceAlerts, renderMaintenanceForm, renderMaintenanceList, setupMaintenanceListeners } from './maintenances.js';
import { renderDocuments, setupDocumentListeners } from './documents.js';
import { getAvailableWorkshops, getUserAppointments, renderWorkshopList, renderBookingForm, renderUserAppointments, setupWorkshopListeners } from './workshops.js';

const PB_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8090'
    : 'https://optiauto.agarnet.duckdns.org';

const pb = new PocketBase(PB_URL);
window.pb = pb;

let userVehicles = [];
let selectedWorkshop = null;

function init() {
    console.log('Inicializando OPTIAUTO Full...');

    pb.authStore.onChange((token, model) => {
        console.log('Auth state changed:', model ? 'authenticated' : 'logged out');
    });

    checkAuth();
    initAuth(pb);
    setupTabNavigation();
    setupVehicleModal();

    window.addEventListener('auth-success', () => showDashboard());
    window.addEventListener('auth-logout', handleLogout);
}

function checkAuth() {
    if (isAuthenticated(pb)) {
        showDashboard();
    } else {
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('auth-screen')?.classList.remove('hidden');
    document.getElementById('dashboard-screen')?.classList.add('hidden');
}

async function showDashboard() {
    document.getElementById('auth-screen')?.classList.add('hidden');
    document.getElementById('dashboard-screen')?.classList.remove('hidden');

    const user = getCurrentUser(pb);
    document.getElementById('user-name').textContent = user?.email || 'Usuario';
    const roleBadge = document.getElementById('user-role');
    roleBadge.textContent = user?.role || 'client';
    roleBadge.className = `badge ${user?.role || 'client'}`;

    await loadVehicles();
    await loadWorkshopsSection();
}

function handleLogout() {
    pb.authStore.clear();
    userVehicles = [];
    showAuthScreen();
}

// ===== GESTIÓN DE PESTAÑAS =====
function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            btn.classList.add('active');
            document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');

            if (tabId === 'workshops') {
                loadWorkshopsSection();
            }
        });
    });
}

// ===== VEHÍCULOS =====
async function loadVehicles() {
    const user = getCurrentUser(pb);
    try {
        userVehicles = await pb.collection('vehicles').getFullList({
            filter: `user_id = "${user.id}"`,
            sort: '-created'
        });
        renderVehicles();
    } catch (error) {
        console.error('Error al cargar vehículos:', error);
    }
}

function renderVehicles() {
    const container = document.getElementById('vehicles-container');
    if (!container) return;

    if (userVehicles.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">No tienes vehículos registrados. Añade tu primer vehículo.</p>';
        return;
    }

    container.innerHTML = userVehicles.map(v => `
        <div class="vehicle-card bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold">${v.make} ${v.model} (${v.year})</h3>
                    <p class="text-gray-600">${v.km?.toLocaleString() || 0} km</p>
                </div>
                <div class="flex gap-2">
                    <button class="btn-icon edit" onclick="window.editVehicle('${v.id}')">✏️</button>
                    <button class="btn-icon delete" onclick="window.deleteVehicle('${v.id}')">🗑️</button>
                    <button class="toggle-details-btn btn btn-secondary" data-id="${v.id}">
                        Ver Detalles
                    </button>
                </div>
            </div>

            <div id="vehicle-details-${v.id}" class="hidden">
                ${renderDocuments(pb, v)}
                <div id="vehicle-maintenances-${v.id}"></div>
            </div>
        </div>
    `).join('');

    // Event listeners para toggle details
    document.querySelectorAll('.toggle-details-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const vehicleId = btn.dataset.id;
            const detailsDiv = document.getElementById(`vehicle-details-${vehicleId}`);
            const isHidden = detailsDiv.classList.contains('hidden');

            if (isHidden) {
                detailsDiv.classList.remove('hidden');
                btn.textContent = 'Ocultar Detalles';
                await loadVehicleDetails(vehicleId);
            } else {
                detailsDiv.classList.add('hidden');
                btn.textContent = 'Ver Detalles';
            }
        });
    });

    setupDocumentListeners(pb, loadVehicles);
}

async function loadVehicleDetails(vehicleId) {
    const vehicle = userVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const maintenances = await getMaintenances(pb, vehicleId);
    const container = document.getElementById(`vehicle-maintenances-${vehicleId}`);

    container.innerHTML = `
        <h4 class="text-lg font-bold mb-3 mt-6">Mantenimientos</h4>
        ${renderMaintenanceAlerts(maintenances, vehicle.km || 0)}
        ${renderMaintenanceForm(vehicleId)}
        ${renderMaintenanceList(maintenances, vehicleId)}
    `;

    setupMaintenanceListeners(pb, vehicleId, () => loadVehicleDetails(vehicleId));
}

// ===== MODAL VEHÍCULO =====
function setupVehicleModal() {
    document.getElementById('add-vehicle-btn')?.addEventListener('click', () => {
        openVehicleModal();
    });

    document.getElementById('close-vehicle-modal')?.addEventListener('click', closeVehicleModal);
    document.getElementById('cancel-vehicle-btn')?.addEventListener('click', closeVehicleModal);

    document.getElementById('vehicle-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveVehicle();
    });
}

function openVehicleModal(vehicle = null) {
    const modal = document.getElementById('vehicle-modal');
    const form = document.getElementById('vehicle-form');
    const title = document.getElementById('vehicle-modal-title');

    form.reset();

    if (vehicle) {
        title.textContent = 'Editar Vehículo';
        document.getElementById('vehicle-id').value = vehicle.id;
        form.elements.make.value = vehicle.make;
        form.elements.model.value = vehicle.model;
        form.elements.year.value = vehicle.year;
        form.elements.km.value = vehicle.km || 0;
    } else {
        title.textContent = 'Añadir Vehículo';
        document.getElementById('vehicle-id').value = '';
    }

    modal?.classList.remove('hidden');
}

function closeVehicleModal() {
    document.getElementById('vehicle-modal')?.classList.add('hidden');
}

async function saveVehicle() {
    const form = document.getElementById('vehicle-form');
    const formData = new FormData(form);
    const vehicleId = document.getElementById('vehicle-id').value;
    const user = getCurrentUser(pb);

    const data = {
        user_id: user.id,
        make: formData.get('make'),
        model: formData.get('model'),
        year: parseInt(formData.get('year')),
        km: parseInt(formData.get('km'))
    };

    try {
        if (vehicleId) {
            await pb.collection('vehicles').update(vehicleId, data);
        } else {
            await pb.collection('vehicles').create(data);
        }

        closeVehicleModal();
        await loadVehicles();
        showMessage('vehicle-modal-message', 'Vehículo guardado', 'success');
    } catch (error) {
        showMessage('vehicle-modal-message', 'Error al guardar', 'error');
    }
}

// Global functions
window.editVehicle = (id) => {
    const vehicle = userVehicles.find(v => v.id === id);
    if (vehicle) openVehicleModal(vehicle);
};

window.deleteVehicle = async (id) => {
    if (!confirm('¿Eliminar este vehículo?')) return;
    try {
        await pb.collection('vehicles').delete(id);
        await loadVehicles();
    } catch (error) {
        alert('Error al eliminar');
    }
};

// ===== TALLERES Y CITAS =====
async function loadWorkshopsSection() {
    const workshops = await getAvailableWorkshops(pb);
    const appointments = await getUserAppointments(pb, getCurrentUser(pb).id);

    document.getElementById('workshops-list').innerHTML = renderWorkshopList(workshops, selectedWorkshop);
    document.getElementById('appointments-list').innerHTML = renderUserAppointments(appointments);

    setupWorkshopListeners(pb, getCurrentUser(pb).id,
        (workshopId) => {
            selectedWorkshop = workshopId;
            const workshop = workshops.find(w => w.id === workshopId);
            document.getElementById('booking-section').innerHTML = workshop ?
                renderBookingForm(workshop, userVehicles) : '';
            document.getElementById('workshops-list').innerHTML = renderWorkshopList(workshops, selectedWorkshop);
            setupWorkshopListeners(pb, getCurrentUser(pb).id, null, loadWorkshopsSection);
        },
        loadWorkshopsSection
    );
}

// Iniciar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('OPTIAUTO Full loaded');
