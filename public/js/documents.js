// documents.js - Gestión de documentos de vehículos

import { handlePocketBaseError } from './utils.js';

const DOCUMENT_TYPES = {
    'tech_sheet_url': { label: 'Ficha Técnica', icon: '📋' },
    'insurance_url': { label: 'Seguro', icon: '🛡️' },
    'itv_url': { label: 'ITV', icon: '✅' }
};

/**
 * Genera la URL de un documento
 */
export function getDocumentUrl(pb, vehicle, field) {
    if (!vehicle[field]) return null;
    return pb.files.getUrl(vehicle, vehicle[field]);
}

/**
 * Renderiza la sección de documentos
 */
export function renderDocuments(pb, vehicle) {
    let html = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">';

    Object.entries(DOCUMENT_TYPES).forEach(([field, info]) => {
        const hasDoc = vehicle[field];
        const url = hasDoc ? getDocumentUrl(pb, vehicle, field) : null;

        html += `
            <div class="border rounded-lg p-4 ${hasDoc ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}">
                <div class="flex items-center justify-between mb-2">
                    <h6 class="font-semibold text-sm flex items-center gap-2">
                        <span>${info.icon}</span>
                        <span>${info.label}</span>
                    </h6>
                    ${hasDoc ? `<span class="text-xs text-green-600 font-medium">✓ Subido</span>` : `<span class="text-xs text-gray-500">Sin archivo</span>`}
                </div>

                ${hasDoc ? `
                    <div class="space-y-2">
                        <a href="${url}" target="_blank" rel="noopener noreferrer"
                           class="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded">
                            Ver Documento
                        </a>
                        <button class="delete-document-btn block w-full bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 rounded"
                                data-field="${field}" data-vehicle-id="${vehicle.id}">
                            Eliminar
                        </button>
                    </div>
                ` : `
                    <div>
                        <input type="file"
                               class="upload-document-input text-xs w-full"
                               data-field="${field}"
                               data-vehicle-id="${vehicle.id}"
                               accept="application/pdf,image/*">
                        <p class="text-xs text-gray-500 mt-1">PDF o imagen, máx 10MB</p>
                    </div>
                `}
            </div>
        `;
    });

    html += '</div>';
    return html;
}

/**
 * Sube un documento
 */
export async function uploadDocument(pb, vehicleId, field, file) {
    try {
        // Validar tamaño (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return { success: false, error: 'El archivo debe ser menor a 10MB' };
        }

        // Validar tipo
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            return { success: false, error: 'Solo se permiten archivos PDF o imágenes' };
        }

        const formData = new FormData();
        formData.append(field, file);

        await pb.collection('vehicles').update(vehicleId, formData);
        return { success: true };
    } catch (error) {
        console.error('Error al subir documento:', error);
        return { success: false, error: handlePocketBaseError(error) };
    }
}

/**
 * Elimina un documento
 */
export async function deleteDocument(pb, vehicleId, field) {
    try {
        const formData = new FormData();
        formData.append(field, null);

        await pb.collection('vehicles').update(vehicleId, formData);
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        return { success: false, error: handlePocketBaseError(error) };
    }
}

/**
 * Configura los event listeners para documentos
 */
export function setupDocumentListeners(pb, onUpdate) {
    // Subida de documentos
    document.querySelectorAll('.upload-document-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const field = input.dataset.field;
            const vehicleId = input.dataset.vehicleId;

            const result = await uploadDocument(pb, vehicleId, field, file);
            if (result.success) {
                if (onUpdate) onUpdate();
            } else {
                alert(result.error);
                input.value = '';
            }
        });
    });

    // Eliminación de documentos
    document.querySelectorAll('.delete-document-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('¿Eliminar este documento?')) return;

            const field = btn.dataset.field;
            const vehicleId = btn.dataset.vehicleId;

            const result = await deleteDocument(pb, vehicleId, field);
            if (result.success && onUpdate) {
                onUpdate();
            }
        });
    });
}
