// app.js - Punto de entrada principal de la aplicación

import { initAuth, isAuthenticated, getCurrentUser } from './auth.js';
import { initVehicles } from './vehicles.js';

// Configuración de PocketBase
// Detectar automáticamente si estamos en local o producción
const PB_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8090'
    : 'https://optiauto.agarnet.duckdns.org';

// Inicializar PocketBase (disponible globalmente desde el CDN)
const pb = new PocketBase(PB_URL);

// Hacer pb disponible globalmente para uso en otros módulos
window.pb = pb;

/**
 * Función principal de inicialización
 */
function init() {
    console.log('Inicializando OPTIAUTO...');
    console.log('PocketBase URL:', PB_URL);

    // Configurar autenticación persistente
    pb.authStore.onChange((token, model) => {
        console.log('Auth state changed:', model ? 'authenticated' : 'logged out');
    });

    // Verificar si hay sesión activa
    checkAuth();

    // Inicializar módulo de autenticación
    initAuth(pb);

    // Escuchar eventos de autenticación
    window.addEventListener('auth-success', handleAuthSuccess);
    window.addEventListener('auth-logout', handleLogout);
}

/**
 * Verifica si hay una sesión activa al cargar la página
 */
function checkAuth() {
    if (isAuthenticated(pb)) {
        console.log('Sesión activa encontrada');
        const user = getCurrentUser(pb);
        console.log('Usuario:', user.username, '| Rol:', user.role);
        showDashboard();
    } else {
        console.log('No hay sesión activa');
        showAuthScreen();
    }
}

/**
 * Maneja el evento de autenticación exitosa
 * @param {Event} e - Evento con datos del usuario
 */
function handleAuthSuccess(e) {
    console.log('Autenticación exitosa');
    showDashboard();
}

/**
 * Maneja el cierre de sesión
 */
function handleLogout() {
    console.log('Cerrando sesión...');
    showAuthScreen();
}

/**
 * Muestra la pantalla de autenticación
 */
function showAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    authScreen?.classList.remove('hidden');
    dashboardScreen?.classList.add('hidden');
}

/**
 * Muestra el dashboard y carga los vehículos
 */
function showDashboard() {
    const authScreen = document.getElementById('auth-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    authScreen?.classList.add('hidden');
    dashboardScreen?.classList.remove('hidden');

    // Inicializar módulo de vehículos
    initVehicles(pb);
}

/**
 * Manejo de errores globales
 */
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

/**
 * Manejo de promesas rechazadas no capturadas
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Inicializar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exportar pb para que esté disponible en la consola de desarrollo
window.PocketBase = pb;

console.log('OPTIAUTO app.js cargado');
