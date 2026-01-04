// workshops.js - Sistema de talleres y citas

import { showMessage, handlePocketBaseError } from './utils.js';

const AVAILABLE_TIMES = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"];

/**
 * Obtiene todos los talleres disponibles
 */
export async function getAvailableWorkshops(pb) {
    try {
        return await pb.collection('workshops').getFullList({
            filter: 'available = true',
            sort: 'name'
        });
    } catch (error) {
        console.error('Error al cargar talleres:', error);
        return [];
    }
}

/**
 * Obtiene las citas de un usuario
 */
export async function getUserAppointments(pb, userId) {
    try {
        return await pb.collection('appointments').getFullList({
            filter: `user = "${userId}"`,
            sort: '-created',
            expand: 'vehicle,workshop'
        });
    } catch (error) {
        console.error('Error al cargar citas:', error);
        return [];
    }
}

/**
 * Renderiza la lista de talleres
 */
export function renderWorkshopList(workshops, selectedId) {
    if (workshops.length === 0) {
        return '<p class="text-center text-gray-500 py-8">No hay talleres disponibles en este momento</p>';
    }

    let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';

    workshops.forEach(ws => {
        const isSelected = ws.id === selectedId;
        html += `
            <div class="workshop-card border rounded-lg p-4 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-300 bg-white hover:shadow-md'}"
                 data-id="${ws.id}">
                <h4 class="font-bold text-lg mb-2">${ws.name}</h4>
                <p class="text-sm text-gray-600 mb-1">📍 ${ws.address}</p>
                ${ws.phone ? `<p class="text-sm text-gray-600 mb-1">📞 ${ws.phone}</p>` : ''}
                ${ws.email ? `<p class="text-sm text-gray-600">📧 ${ws.email}</p>` : ''}
            </div>
        `;
    });

    html += '</div>';
    return html;
}

/**
 * Renderiza el formulario de reserva
 */
export function renderBookingForm(workshop, userVehicles) {
    if (userVehicles.length === 0) {
        return `
            <div class="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p class="text-center font-semibold text-yellow-800">
                    Necesitas añadir al menos un vehículo para poder reservar una cita.
                </p>
            </div>
        `;
    }

    const today = new Date().toISOString().split('T')[0];

    return `
        <div class="mt-6 p-6 bg-white rounded-lg shadow-xl border border-blue-200">
            <h4 class="font-bold text-xl mb-4 text-gray-800">Reservar cita en ${workshop.name}</h4>
            <form id="booking-form" data-workshop-id="${workshop.id}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">1. Elige tu vehículo</label>
                        <select name="vehicle" required class="shadow-sm border rounded w-full py-2 px-3">
                            ${userVehicles.map(v => `<option value="${v.id}">${v.make} ${v.model} (${v.placa})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">2. Motivo de la cita</label>
                        <input type="text" name="reason" placeholder="Ej: Revisión, cambio de aceite..." required
                               class="shadow-sm border rounded w-full py-2 px-3">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">3. Elige fecha</label>
                        <input type="date" name="date" value="${today}" min="${today}" required
                               class="shadow-sm border rounded w-full py-2 px-3">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">4. Elige hora</label>
                        <select name="time" required class="shadow-sm border rounded w-full py-2 px-3">
                            <option value="">Selecciona una hora</option>
                            ${AVAILABLE_TIMES.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <button type="submit"
                        class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded">
                    Confirmar Cita
                </button>
            </form>
            <div id="booking-message"></div>
        </div>
    `;
}

/**
 * Renderiza las citas del usuario
 */
export function renderUserAppointments(appointments) {
    if (appointments.length === 0) {
        return '<p class="text-center text-gray-500 py-4">No tienes citas programadas</p>';
    }

    const statusColors = {
        'solicitada': 'bg-yellow-100 border-yellow-300 text-yellow-800',
        'confirmada': 'bg-blue-100 border-blue-300 text-blue-800',
        'completada': 'bg-green-100 border-green-300 text-green-800',
        'cancelada': 'bg-red-100 border-red-300 text-red-800'
    };

    let html = '<div class="space-y-3">';

    appointments.forEach(apt => {
        const workshop = apt.expand?.workshop;
        const vehicle = apt.expand?.vehicle;
        const statusClass = statusColors[apt.status] || 'bg-gray-100 border-gray-300';

        html += `
            <div class="border rounded-lg p-4 ${statusClass}">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h5 class="font-bold">${workshop?.name || 'Taller'}</h5>
                        <p class="text-sm mt-1">🚗 ${vehicle?.make} ${vehicle?.model} - ${vehicle?.placa}</p>
                        <p class="text-sm">📅 ${apt.date} a las ${apt.time}</p>
                        ${apt.reason ? `<p class="text-sm">💬 ${apt.reason}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase">
                            ${apt.status}
                        </span>
                        ${apt.status === 'solicitada' || apt.status === 'confirmada' ? `
                            <button class="cancel-appointment-btn block mt-2 text-xs text-red-600 hover:underline"
                                    data-id="${apt.id}">
                                Cancelar
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

/**
 * Crea una nueva cita
 */
export async function createAppointment(pb, userId, data) {
    try {
        const record = await pb.collection('appointments').create({
            user: userId,
            vehicle: data.vehicle,
            workshop: data.workshop,
            date: data.date,
            time: data.time,
            reason: data.reason || '',
            status: 'solicitada'
        });
        return { success: true, record };
    } catch (error) {
        console.error('Error al crear cita:', error);
        return { success: false, error: handlePocketBaseError(error) };
    }
}

/**
 * Cancela una cita
 */
export async function cancelAppointment(pb, id) {
    try {
        await pb.collection('appointments').update(id, { status: 'cancelada' });
        return { success: true };
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        return { success: false, error: handlePocketBaseError(error) };
    }
}

/**
 * Configura event listeners para talleres
 */
export function setupWorkshopListeners(pb, userId, onWorkshopSelect, onUpdate) {
    // Selección de taller
    document.querySelectorAll('.workshop-card').forEach(card => {
        card.addEventListener('click', () => {
            const workshopId = card.dataset.id;
            if (onWorkshopSelect) onWorkshopSelect(workshopId);
        });
    });

    // Formulario de reserva
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(bookingForm);
            const data = {
                vehicle: formData.get('vehicle'),
                workshop: bookingForm.dataset.workshopId,
                date: formData.get('date'),
                time: formData.get('time'),
                reason: formData.get('reason')
            };

            const result = await createAppointment(pb, userId, data);
            if (result.success) {
                showMessage('booking-message', '¡Cita reservada con éxito! El taller te confirmará pronto.', 'success', 3000);
                bookingForm.reset();
                if (onUpdate) setTimeout(onUpdate, 1500);
            } else {
                showMessage('booking-message', result.error, 'error');
            }
        });
    }

    // Cancelar citas
    document.querySelectorAll('.cancel-appointment-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('¿Cancelar esta cita?')) return;

            const id = btn.dataset.id;
            const result = await cancelAppointment(pb, id);
            if (result.success && onUpdate) {
                onUpdate();
            }
        });
    });
}
