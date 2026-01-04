// vehicles.js - CRUD de vehículos

import {
    showMessage,
    hideMessage,
    formatPrice,
    getImageUrl,
    handlePocketBaseError,
    toggleSpinner,
    clearForm,
    getStatusClass,
    debounce
} from './utils.js';
import { isAdmin, getCurrentUser } from './auth.js';

let currentVehicles = [];
let vehicleToDelete = null;

/**
 * Inicializa el módulo de vehículos
 * @param {object} pb - Instancia de PocketBase
 */
export function initVehicles(pb) {
    setupUI(pb);
    setupEventListeners(pb);
    loadVehicles(pb);
}

/**
 * Configura la UI según el rol del usuario
 * @param {object} pb - Instancia de PocketBase
 */
function setupUI(pb) {
    const userIsAdmin = isAdmin(pb);
    const user = getCurrentUser(pb);

    // Mostrar/ocultar botones según rol
    const createBtn = document.getElementById('create-vehicle-btn');
    const actionsHeader = document.getElementById('actions-header');

    if (userIsAdmin) {
        createBtn?.classList.remove('hidden');
        actionsHeader?.classList.remove('hidden');
    } else {
        createBtn?.classList.add('hidden');
        actionsHeader?.classList.add('hidden');
    }

    // Actualizar info de usuario
    document.getElementById('user-name').textContent = user?.username || 'Usuario';
    const roleBadge = document.getElementById('user-role');
    roleBadge.textContent = user?.role || 'user';
    roleBadge.className = `badge ${user?.role || 'user'}`;
}

/**
 * Configura los event listeners
 * @param {object} pb - Instancia de PocketBase
 */
function setupEventListeners(pb) {
    // Botón crear vehículo
    document.getElementById('create-vehicle-btn')?.addEventListener('click', () => {
        openVehicleModal(pb);
    });

    // Botones del modal
    document.getElementById('close-modal')?.addEventListener('click', closeVehicleModal);
    document.getElementById('cancel-btn')?.addEventListener('click', closeVehicleModal);

    // Formulario de vehículo
    document.getElementById('vehicle-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveVehicle(pb);
    });

    // Preview de imagen
    document.getElementById('vehicle-imagen')?.addEventListener('change', handleImagePreview);

    // Búsqueda con debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filterVehicles(e.target.value);
        }, 300));
    }

    // Modal de confirmación de eliminación
    document.getElementById('close-delete-modal')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancel-delete-btn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
        await confirmDelete(pb);
    });
}

/**
 * Carga los vehículos desde PocketBase
 * @param {object} pb - Instancia de PocketBase
 */
export async function loadVehicles(pb) {
    toggleSpinner(true);
    hideMessage('dashboard-message');

    try {
        // Obtener todos los vehículos con expand del owner
        const records = await pb.collection('vehicles').getFullList({
            sort: '-created',
            expand: 'owner'
        });

        currentVehicles = records;
        renderVehicles(pb, records);

        console.log('Vehículos cargados:', records.length);

    } catch (error) {
        const errorMessage = handlePocketBaseError(error);
        showMessage('dashboard-message', `Error al cargar vehículos: ${errorMessage}`, 'error');
        console.error('Error loading vehicles:', error);
    } finally {
        toggleSpinner(false);
    }
}

/**
 * Renderiza la tabla de vehículos
 * @param {object} pb - Instancia de PocketBase
 * @param {array} vehicles - Array de vehículos
 */
function renderVehicles(pb, vehicles) {
    const tbody = document.getElementById('vehicles-tbody');
    const emptyState = document.getElementById('empty-state');
    const userIsAdmin = isAdmin(pb);

    if (!tbody) return;

    // Limpiar tabla
    tbody.innerHTML = '';

    // Mostrar estado vacío si no hay vehículos
    if (vehicles.length === 0) {
        emptyState?.classList.remove('hidden');
        return;
    }

    emptyState?.classList.add('hidden');

    // Renderizar cada vehículo
    vehicles.forEach(vehicle => {
        const row = createVehicleRow(pb, vehicle, userIsAdmin);
        tbody.appendChild(row);
    });
}

/**
 * Crea una fila de la tabla para un vehículo
 * @param {object} pb - Instancia de PocketBase
 * @param {object} vehicle - Datos del vehículo
 * @param {boolean} isAdmin - Si el usuario es admin
 * @returns {HTMLElement}
 */
function createVehicleRow(pb, vehicle, isAdmin) {
    const row = document.createElement('tr');

    // Imagen
    const imageCell = document.createElement('td');
    if (vehicle.imagen) {
        const img = document.createElement('img');
        img.src = getImageUrl(pb, vehicle, vehicle.imagen, '100x100');
        img.alt = `${vehicle.marca} ${vehicle.modelo}`;
        img.className = 'vehicle-image';
        imageCell.appendChild(img);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'vehicle-image-placeholder';
        placeholder.textContent = 'Sin imagen';
        imageCell.appendChild(placeholder);
    }
    row.appendChild(imageCell);

    // Marca
    const marcaCell = document.createElement('td');
    marcaCell.textContent = vehicle.marca;
    row.appendChild(marcaCell);

    // Modelo
    const modeloCell = document.createElement('td');
    modeloCell.textContent = vehicle.modelo;
    row.appendChild(modeloCell);

    // Año
    const añoCell = document.createElement('td');
    añoCell.textContent = vehicle.año;
    row.appendChild(añoCell);

    // Tipo
    const tipoCell = document.createElement('td');
    tipoCell.textContent = vehicle.tipo;
    row.appendChild(tipoCell);

    // Placa
    const placaCell = document.createElement('td');
    placaCell.textContent = vehicle.placa;
    row.appendChild(placaCell);

    // Estado
    const estadoCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${getStatusClass(vehicle.estado)}`;
    statusBadge.textContent = vehicle.estado;
    estadoCell.appendChild(statusBadge);
    row.appendChild(estadoCell);

    // Precio
    const precioCell = document.createElement('td');
    precioCell.textContent = formatPrice(vehicle.precio);
    row.appendChild(precioCell);

    // Acciones (solo para admin)
    if (isAdmin) {
        const actionsCell = document.createElement('td');
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'action-buttons';

        // Botón editar
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-icon edit';
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Editar';
        editBtn.addEventListener('click', () => openVehicleModal(pb, vehicle));
        actionsDiv.appendChild(editBtn);

        // Botón eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon delete';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Eliminar';
        deleteBtn.addEventListener('click', () => openDeleteModal(vehicle));
        actionsDiv.appendChild(deleteBtn);

        actionsCell.appendChild(actionsDiv);
        row.appendChild(actionsCell);
    }

    return row;
}

/**
 * Abre el modal para crear o editar un vehículo
 * @param {object} pb - Instancia de PocketBase
 * @param {object|null} vehicle - Vehículo a editar (null para crear)
 */
function openVehicleModal(pb, vehicle = null) {
    const modal = document.getElementById('vehicle-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('vehicle-form');

    hideMessage('modal-message');
    clearForm('vehicle-form');

    if (vehicle) {
        // Modo edición
        modalTitle.textContent = 'Editar Vehículo';
        document.getElementById('vehicle-id').value = vehicle.id;
        document.getElementById('vehicle-marca').value = vehicle.marca;
        document.getElementById('vehicle-modelo').value = vehicle.modelo;
        document.getElementById('vehicle-año').value = vehicle.año;
        document.getElementById('vehicle-tipo').value = vehicle.tipo;
        document.getElementById('vehicle-placa').value = vehicle.placa;
        document.getElementById('vehicle-estado').value = vehicle.estado;
        document.getElementById('vehicle-precio').value = vehicle.precio;

        // Mostrar imagen actual si existe
        if (vehicle.imagen) {
            const preview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            previewImg.src = getImageUrl(pb, vehicle, vehicle.imagen);
            preview.classList.remove('hidden');
        }
    } else {
        // Modo creación
        modalTitle.textContent = 'Nuevo Vehículo';
        document.getElementById('vehicle-id').value = '';
    }

    modal?.classList.remove('hidden');
}

/**
 * Cierra el modal de vehículo
 */
function closeVehicleModal() {
    const modal = document.getElementById('vehicle-modal');
    modal?.classList.add('hidden');
    clearForm('vehicle-form');
    hideMessage('modal-message');
}

/**
 * Guarda un vehículo (crear o actualizar)
 * @param {object} pb - Instancia de PocketBase
 */
async function saveVehicle(pb) {
    const vehicleId = document.getElementById('vehicle-id').value;
    const isUpdate = !!vehicleId;

    // Recopilar datos del formulario
    const formData = new FormData();
    formData.append('marca', document.getElementById('vehicle-marca').value.trim());
    formData.append('modelo', document.getElementById('vehicle-modelo').value.trim());
    formData.append('año', document.getElementById('vehicle-año').value);
    formData.append('tipo', document.getElementById('vehicle-tipo').value);
    formData.append('placa', document.getElementById('vehicle-placa').value.trim().toUpperCase());
    formData.append('estado', document.getElementById('vehicle-estado').value);
    formData.append('precio', document.getElementById('vehicle-precio').value);

    // Solo agregar owner al crear
    if (!isUpdate) {
        const user = getCurrentUser(pb);
        formData.append('owner', user.id);
    }

    // Agregar imagen si se seleccionó una nueva
    const imageInput = document.getElementById('vehicle-imagen');
    if (imageInput.files.length > 0) {
        formData.append('imagen', imageInput.files[0]);
    }

    try {
        let record;

        if (isUpdate) {
            // Actualizar vehículo existente
            record = await pb.collection('vehicles').update(vehicleId, formData);
            showMessage('modal-message', 'Vehículo actualizado exitosamente', 'success', 2000);
        } else {
            // Crear nuevo vehículo
            record = await pb.collection('vehicles').create(formData);
            showMessage('modal-message', 'Vehículo creado exitosamente', 'success', 2000);
        }

        console.log('Vehículo guardado:', record);

        // Recargar lista de vehículos
        setTimeout(async () => {
            closeVehicleModal();
            await loadVehicles(pb);
        }, 1000);

    } catch (error) {
        const errorMessage = handlePocketBaseError(error);
        showMessage('modal-message', errorMessage, 'error');
        console.error('Error saving vehicle:', error);
    }
}

/**
 * Maneja la preview de la imagen seleccionada
 * @param {Event} e - Evento de cambio
 */
function handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');

    if (file) {
        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen debe ser menor a 5MB');
            e.target.value = '';
            preview.classList.add('hidden');
            return;
        }

        // Validar tipo
        if (!file.type.match(/^image\/(jpeg|png)$/)) {
            alert('Solo se permiten imágenes JPG o PNG');
            e.target.value = '';
            preview.classList.add('hidden');
            return;
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        preview.classList.add('hidden');
    }
}

/**
 * Abre el modal de confirmación de eliminación
 * @param {object} vehicle - Vehículo a eliminar
 */
function openDeleteModal(vehicle) {
    vehicleToDelete = vehicle;
    const modal = document.getElementById('delete-modal');
    const info = document.getElementById('delete-vehicle-info');

    info.textContent = `${vehicle.marca} ${vehicle.modelo} - ${vehicle.placa}`;
    modal?.classList.remove('hidden');
}

/**
 * Cierra el modal de confirmación de eliminación
 */
function closeDeleteModal() {
    vehicleToDelete = null;
    const modal = document.getElementById('delete-modal');
    modal?.classList.add('hidden');
}

/**
 * Confirma y ejecuta la eliminación
 * @param {object} pb - Instancia de PocketBase
 */
async function confirmDelete(pb) {
    if (!vehicleToDelete) return;

    try {
        await pb.collection('vehicles').delete(vehicleToDelete.id);

        console.log('Vehículo eliminado:', vehicleToDelete.id);

        closeDeleteModal();
        showMessage('dashboard-message', 'Vehículo eliminado exitosamente', 'success', 3000);

        // Recargar lista
        await loadVehicles(pb);

    } catch (error) {
        const errorMessage = handlePocketBaseError(error);
        showMessage('dashboard-message', `Error al eliminar: ${errorMessage}`, 'error');
        console.error('Error deleting vehicle:', error);
        closeDeleteModal();
    }
}

/**
 * Filtra los vehículos según el término de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 */
function filterVehicles(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
        renderVehicles(window.pb, currentVehicles);
        return;
    }

    const filtered = currentVehicles.filter(vehicle => {
        return (
            vehicle.marca.toLowerCase().includes(term) ||
            vehicle.modelo.toLowerCase().includes(term) ||
            vehicle.placa.toLowerCase().includes(term) ||
            vehicle.tipo.toLowerCase().includes(term)
        );
    });

    renderVehicles(window.pb, filtered);
}
