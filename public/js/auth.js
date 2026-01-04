// auth.js - Manejo de autenticación

import { showMessage, hideMessage, isValidEmail, handlePocketBaseError } from './utils.js';

/**
 * Inicializa el módulo de autenticación
 * @param {object} pb - Instancia de PocketBase
 */
export function initAuth(pb) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');

    // Eventos para cambiar entre login y registro
    showRegisterBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForms('register');
        hideMessage('auth-message');
    });

    showLoginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForms('login');
        hideMessage('auth-message');
    });

    // Manejar login
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin(pb);
    });

    // Manejar registro
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister(pb);
    });

    // Manejar logout
    logoutBtn?.addEventListener('click', () => {
        handleLogout(pb);
    });
}

/**
 * Cambia entre formularios de login y registro
 * @param {string} form - 'login' o 'register'
 */
function toggleAuthForms(form) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (form === 'register') {
        loginForm?.classList.remove('active');
        registerForm?.classList.add('active');
    } else {
        registerForm?.classList.remove('active');
        loginForm?.classList.add('active');
    }
}

/**
 * Maneja el inicio de sesión
 * @param {object} pb - Instancia de PocketBase
 */
async function handleLogin(pb) {
    const emailOrUsername = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!emailOrUsername || !password) {
        showMessage('auth-message', 'Por favor completa todos los campos', 'error');
        return;
    }

    try {
        // Autenticar con PocketBase
        const authData = await pb.collection('users').authWithPassword(
            emailOrUsername,
            password
        );

        console.log('Login exitoso:', authData);

        // Verificar que el usuario tenga el campo 'role'
        if (!authData.record.role) {
            showMessage('auth-message', 'Usuario sin rol asignado. Contacta al administrador.', 'error');
            pb.authStore.clear();
            return;
        }

        showMessage('auth-message', 'Inicio de sesión exitoso', 'success', 2000);

        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('auth-success', {
                detail: authData
            }));
        }, 500);

    } catch (error) {
        const errorMessage = handlePocketBaseError(error);
        showMessage('auth-message', errorMessage, 'error');
    }
}

/**
 * Maneja el registro de nuevos usuarios
 * @param {object} pb - Instancia de PocketBase
 */
async function handleRegister(pb) {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    // Validaciones
    if (!username || !email || !password || !passwordConfirm) {
        showMessage('auth-message', 'Por favor completa todos los campos', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('auth-message', 'Email inválido', 'error');
        return;
    }

    if (password.length < 8) {
        showMessage('auth-message', 'La contraseña debe tener al menos 8 caracteres', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        showMessage('auth-message', 'Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        // Crear usuario en PocketBase
        const userData = {
            username: username,
            email: email,
            password: password,
            passwordConfirm: passwordConfirm,
            role: 'user' // Por defecto todos son usuarios normales
        };

        const record = await pb.collection('users').create(userData);

        console.log('Usuario registrado:', record);

        showMessage('auth-message', 'Registro exitoso. Ahora puedes iniciar sesión.', 'success', 3000);

        // Cambiar al formulario de login después de 1.5 segundos
        setTimeout(() => {
            toggleAuthForms('login');
            // Pre-llenar el email en el login
            document.getElementById('login-email').value = email;
        }, 1500);

    } catch (error) {
        const errorMessage = handlePocketBaseError(error);
        showMessage('auth-message', errorMessage, 'error');
    }
}

/**
 * Maneja el cierre de sesión
 * @param {object} pb - Instancia de PocketBase
 */
function handleLogout(pb) {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        pb.authStore.clear();

        // Disparar evento de logout
        window.dispatchEvent(new Event('auth-logout'));

        console.log('Sesión cerrada');
    }
}

/**
 * Verifica si hay una sesión activa
 * @param {object} pb - Instancia de PocketBase
 * @returns {boolean}
 */
export function isAuthenticated(pb) {
    return pb.authStore.isValid;
}

/**
 * Obtiene el usuario actual
 * @param {object} pb - Instancia de PocketBase
 * @returns {object|null}
 */
export function getCurrentUser(pb) {
    return pb.authStore.model;
}

/**
 * Verifica si el usuario actual es admin
 * @param {object} pb - Instancia de PocketBase
 * @returns {boolean}
 */
export function isAdmin(pb) {
    const user = getCurrentUser(pb);
    return user?.role === 'admin';
}

/**
 * Refresca la autenticación del usuario
 * Útil para verificar que la sesión sigue siendo válida
 * @param {object} pb - Instancia de PocketBase
 */
export async function refreshAuth(pb) {
    try {
        if (pb.authStore.isValid) {
            await pb.collection('users').authRefresh();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error al refrescar auth:', error);
        pb.authStore.clear();
        return false;
    }
}
