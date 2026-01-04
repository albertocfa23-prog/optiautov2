// maintenances.js - Sistema de mantenimientos de vehículos

import { showMessage, handlePocketBaseError } from './utils.js';

// Intervalos de mantenimiento en km
const MAINTENANCE_INTERVALS = {
    'Cambio de aceite y filtros': 15000,
    'Inspección de frenos': 30000,
    'Correas': 100000,
    'ITV': 20000,
    'Neumáticos': 40000,
    'Batería': 50000,
    'Bujías': 60000
};

const MAINTENANCE_TYPES = Object.keys(MAINTENANCE_INTERVALS);

/**
 * Obtiene los mantenimientos de un vehículo
 */
export async function getMaintenances(pb, vehicleId) {
    try {
        return await pb.collection('maintenances').getFullList({
            filter: `vehicle_id = "${vehicleId}"`,
            sort: '-date'
        });
    } catch (error) {
        console.error('Error al cargar mantenimientos:', error);
        return [];
    }
}

/**
 * Calcula cuándo es el próximo mantenimiento
 */
export function getNextMaintenanceInfo(maintenances, type, currentKm) {
    const completed = maintenances
        .filter(m => m.type === type && m.status === 'realizado')
        .sort((a, b) => b.km - a.km);

    const lastKm = completed.length > 0 ? completed[0].km : 0;
    const interval = MAINTENANCE_INTERVALS[type] || 15000;
    const nextKm = lastKm + interval;
    const kmRemaining = nextKm - currentKm;

    let urgency = 'ok';
    let message = `Próximo en ${kmRemaining} km`;
    let className = 'text-green-600';

    if (kmRemaining <= 0) {
        urgency = 'urgent';
        message = `¡Realizar ya! (hace ${Math.abs(kmRemaining)} km)`;
        className = 'text-red-600 font-bold';
    } else if (kmRemaining <= 2000) {
        urgency = 'soon';
        message = `Próximo en ${kmRemaining} km`;
        className = 'text-yellow-600 font-semibold';
    }

    return { urgency, message, className, nextKm, kmRemaining };
}

/**
 * Renderiza las alertas de mantenimiento
 */
export function renderMaintenanceAlerts(maintenances, currentKm) {
    let html = '<div class="mb-6 bg-gray-50 p-4 rounded-lg"><h5 class="font-bold mb-3 text-gray-800">Alertas de Mantenimiento</h5><ul class="space-y-2">';

    MAINTENANCE_TYPES.forEach(type => {
        const info = getNextMaintenanceInfo(maintenances, type, currentKm);
        html += `<li class="flex justify-between items-center p-2 rounded hover:bg-gray-100">
            <span class="text-sm">${type}</span>
            <span class="${info.className} text-sm">${info.message}</span>
        </li>`;
    });

    html += '</ul></div>';
    return html;
}

/**
 * Renderiza el formulario para añadir mantenimiento
 */
export function renderMaintenanceForm(vehicleId) {
    const today = new Date().toISOString().split('T')[0];

    return `
        <form id="maintenance-form-${vehicleId}" class="mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <h5 class="font-bold mb-3 text-gray-800">Añadir Mantenimiento</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <select name="type" required class="shadow-sm border rounded w-full py-2 px-3 text-sm">
                    <option value="">Tipo de mantenimiento</option>
                    ${MAINTENANCE_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
                <input type="date" name="date" value="${today}" required class="shadow-sm border rounded w-full py-2 px-3 text-sm" />
                <input type="number" name="km" placeholder="Kilómetros" required min="0" class="shadow-sm border rounded w-full py-2 px-3 text-sm" />
                <select name="status" class="shadow-sm border rounded w-full py-2 px-3 text-sm">
                    <option value="pendiente">Pendiente</option>
                    <option value="realizado" selected>Realizado</option>
                </select>
            </div>
            <div class="mt-3">
                <input type="text" name="notes" placeholder="Notas (opcional)" class="shadow-sm border rounded w-full py-2 px-3 text-sm" />
            </div>
            <button type="submit" class="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-sm">
                Añadir Mantenimiento
            </button>
        </form>
    `;
}

/**
 * Renderiza la lista de mantenimientos
 */
export function renderMaintenanceList(maintenances, vehicleId) {
    if (maintenances.length === 0) {
        return '<p class="text-center text-gray-500 py-4">No hay mantenimientos registrados</p>';
    }

    let html = '<ul class="space-y-2">';

    maintenances.forEach(m => {
        const statusClass = m.status === 'realizado' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200';
        const statusIcon = m.status === 'realizado' ? '✓' : '○';

        html += `
            <li class="p-3 rounded border ${statusClass} flex justify-between items-start" data-id="${m.id}">
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="font-semibold text-sm">${statusIcon} ${m.type}</span>
                        <span class="text-xs px-2 py-1 rounded ${m.status === 'realizado' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}">${m.status}</span>
                    </div>
                    <div class="text-xs text-gray-600 mt-1">
                        ${m.date} • ${m.km.toLocaleString()} km
                        ${m.notes ? `<br><span class="italic">${m.notes}</span>` : ''}
                    </div>
                </div>
                <div class="flex gap-1">
                    <button class="toggle-status-btn p-1 hover:bg-gray-200 rounded" data-id="${m.id}" data-status="${m.status}" title="Cambiar estado">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button class="delete-maintenance-btn p-1 hover:bg-red-100 rounded text-red-600" data-id="${m.id}" title="Eliminar">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </li>
        `;
    });

    html += '</ul>';
    return html;
}

/**
 * Crea un nuevo mantenimiento
 */
export async function createMaintenance(pb, vehicleId, data) {
    try {
        const record = await pb.collection('maintenances').create({
            vehicle_id: vehicleId,
            type: data.type,
            date: data.date,
            km: parseInt(data.km),
            status: data.status || 'realizado',
            notes: data.notes || ''
        });
        return { success: true, record };
    } catch (error) {
        console.error('Error al crear mantenimiento:', error);
        return { success: false, error: handlePocketBaseError(error) };
    }
}

/**
 * Actualiza el estado de un mantenimiento
 */
export async function toggleMaintenanceStatus(pb, id, currentStatus) {
    try {
        const newStatus = currentStatus === 'realizado' ? 'pendiente' : 'realizado';
        await pb.collection('maintenances').update(id, { status: newStatus });
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar mantenimiento:', error);
        return { success: false, error: handlePocketBaseError(error) };
    }
}

/**
 * Elimina un mantenimiento
 */
export async function deleteMaintenance(pb, id) {
    try {
        await pb.collection('maintenances').delete(id);
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar mantenimiento:', error);
        return { success: false, error: handlePocketBaseError(error) };
    }
}

/**
 * Configura los event listeners para mantenimientos
 */
export function setupMaintenanceListeners(pb, vehicleId, onUpdate) {
    // Formulario de añadir mantenimiento
    const form = document.getElementById(`maintenance-form-${vehicleId}`);
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            const result = await createMaintenance(pb, vehicleId, data);
            if (result.success) {
                form.reset();
                form.querySelector('[name="date"]').value = new Date().toISOString().split('T')[0];
                if (onUpdate) onUpdate();
            } else {
                alert(result.error);
            }
        });
    }

    // Botones de cambiar estado
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            const status = btn.dataset.status;

            const result = await toggleMaintenanceStatus(pb, id, status);
            if (result.success && onUpdate) {
                onUpdate();
            }
        });
    });

    // Botones de eliminar
    document.querySelectorAll('.delete-maintenance-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('¿Eliminar este mantenimiento?')) return;

            const id = btn.dataset.id;
            const result = await deleteMaintenance(pb, id);
            if (result.success && onUpdate) {
                onUpdate();
            }
        });
    });
}
