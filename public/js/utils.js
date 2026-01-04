// utils.js - Funciones auxiliares y helpers

/**
 * Muestra un mensaje en un elemento específico
 * @param {string} elementId - ID del elemento donde mostrar el mensaje
 * @param {string} message - Texto del mensaje
 * @param {string} type - Tipo: 'success', 'error', 'info'
 * @param {number} duration - Duración en ms (0 = permanente)
 */
export function showMessage(elementId, message, type = 'info', duration = 5000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.className = `message ${type} show`;

    if (duration > 0) {
        setTimeout(() => {
            element.classList.remove('show');
        }, duration);
    }
}

/**
 * Oculta un mensaje
 * @param {string} elementId - ID del elemento
 */
export function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.classList.remove('show');
}

/**
 * Formatea un precio con separadores de miles
 * @param {number} price - Precio a formatear
 * @returns {string} - Precio formateado
 */
export function formatPrice(price) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

/**
 * Genera la URL de una imagen desde PocketBase
 * @param {object} record - Registro de PocketBase
 * @param {string} filename - Nombre del archivo
 * @param {string} thumb - Tamaño del thumbnail (opcional)
 * @returns {string} - URL de la imagen
 */
export function getImageUrl(pb, record, filename, thumb = '100x100') {
    if (!filename) return null;
    return pb.files.getUrl(record, filename, { thumb });
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Sanitiza texto para evitar XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string}
 */
export function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Debounce function para búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Convierte un objeto FormData a objeto plano
 * @param {FormData} formData
 * @returns {object}
 */
export function formDataToObject(formData) {
    const obj = {};
    for (let [key, value] of formData.entries()) {
        obj[key] = value;
    }
    return obj;
}

/**
 * Maneja errores de PocketBase y devuelve mensaje legible
 * @param {Error} error - Error de PocketBase
 * @returns {string} - Mensaje de error
 */
export function handlePocketBaseError(error) {
    console.error('PocketBase Error:', error);

    // Errores de validación
    if (error.data?.data) {
        const fieldErrors = Object.entries(error.data.data)
            .map(([field, error]) => `${field}: ${error.message}`)
            .join(', ');
        return `Error de validación: ${fieldErrors}`;
    }

    // Errores comunes
    if (error.status === 400) {
        return 'Datos inválidos. Por favor verifica el formulario.';
    }
    if (error.status === 401) {
        return 'No autorizado. Por favor inicia sesión nuevamente.';
    }
    if (error.status === 403) {
        return 'No tienes permisos para realizar esta acción.';
    }
    if (error.status === 404) {
        return 'Recurso no encontrado.';
    }

    return error.message || 'Error desconocido. Intenta nuevamente.';
}

/**
 * Muestra/oculta spinner de carga
 * @param {boolean} show - true para mostrar, false para ocultar
 */
export function toggleSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.toggle('hidden', !show);
    }
}

/**
 * Limpia un formulario
 * @param {string} formId - ID del formulario
 */
export function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Limpiar preview de imagen si existe
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.classList.add('hidden');
        }
    }
}

/**
 * Convierte un string de estado a clase CSS
 * @param {string} status - Estado del vehículo
 * @returns {string} - Clase CSS
 */
export function getStatusClass(status) {
    const statusMap = {
        'disponible': 'status-disponible',
        'vendido': 'status-vendido',
        'en mantenimiento': 'status-en-mantenimiento'
    };
    return statusMap[status] || '';
}

/**
 * Confirma una acción con el usuario
 * @param {string} message - Mensaje de confirmación
 * @returns {boolean}
 */
export function confirm(message) {
    return window.confirm(message);
}
