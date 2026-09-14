
(function (global) {
    'use strict';

    var USERS_KEY = 'papitaUsuarios';   // clave en localStorage donde viven todos los usuarios registrados
    var SESSION_KEY = 'papitaSesion';   // clave en localStorage con el usuario que tiene la sesión abierta

    // Ofuscado simple de la contraseña (no es un hash real de seguridad,
    // solo evita que quede 100% legible en el localStorage del navegador).
    function ofuscar(texto) {
        try {
            return btoa(unescape(encodeURIComponent(texto)));
        } catch (e) {
            return texto;
        }
    }

    // Devuelve la lista de usuarios registrados guardada en localStorage.
    function obtenerUsuarios() {
        try {
            var data = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    // Guarda la lista completa de usuarios en localStorage.
    function guardarUsuarios(usuarios) {
        localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
    }

    // Busca un usuario por su correo (sin importar mayúsculas/espacios).
    function buscarPorCorreo(correo) {
        var normalizado = String(correo || '').trim().toLowerCase();
        return obtenerUsuarios().find(function (u) {
            return u.correo === normalizado;
        });
    }

    /**
     * Registra un nuevo cliente.
     * @returns {{exito:boolean, mensaje:string}}
     */
    function registrarUsuario(datos) {
        var correo = String(datos.correo || '').trim().toLowerCase();
        if (!correo || !datos.password || !datos.nombre) {
            return { exito: false, mensaje: 'Completa todos los campos obligatorios.' };
        }
        if (buscarPorCorreo(correo)) {
            return { exito: false, mensaje: 'Ya existe una cuenta registrada con ese correo.' };
        }
        var usuarios = obtenerUsuarios();
        usuarios.push({
            nombre: datos.nombre.trim(),
            correo: correo,
            password: ofuscar(datos.password),
            region: datos.region || '',
            comuna: datos.comuna || '',
            creado: new Date().toISOString()
        });
        guardarUsuarios(usuarios);
        return { exito: true, mensaje: 'Cuenta creada correctamente. Ya puedes iniciar sesión.' };
    }

    /**
     * Valida credenciales e inicia sesión si son correctas.
     * @returns {{exito:boolean, usuario?:object, mensaje?:string}}
     */
    function iniciarSesion(correo, password) {
        var usuario = buscarPorCorreo(correo);
        if (!usuario || usuario.password !== ofuscar(password)) {
            return { exito: false, mensaje: 'Correo o contraseña incorrectos.' };
        }
        var sesion = {
            nombre: usuario.nombre,
            correo: usuario.correo,
            region: usuario.region,
            comuna: usuario.comuna
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
        return { exito: true, usuario: sesion };
    }

    // Cierra la sesión actual (borra la sesión guardada) y actualiza
    // de inmediato el botón "Mi cuenta" de la navbar.
    function cerrarSesion() {
        localStorage.removeItem(SESSION_KEY);
        actualizarUICuenta();
    }

    // Devuelve el usuario que tiene la sesión iniciada, o null si nadie
    // ha iniciado sesión en este navegador.
    function obtenerUsuarioActual() {
        try {
            return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        } catch (e) {
            return null;
        }
    }

    /**
     * Simula el envío de un correo de recuperación: no existe backend de
     * correo real en este proyecto, así que solo confirmamos si el correo
     * está registrado o no, sin revelar más información de la cuenta.
     */
    function solicitarRecuperacion(correo) {
        var usuario = buscarPorCorreo(correo);
        if (!usuario) {
            return { exito: false, mensaje: 'No encontramos una cuenta con ese correo.' };
        }
        return { exito: true, mensaje: 'Si el correo existe, en un entorno real se enviarían las instrucciones a ' + usuario.correo + '. Este proyecto no envía correos reales.' };
    }

    // Actualiza el botón "Mi cuenta" de la barra de navegación según haya o no sesión activa
    function actualizarUICuenta() {
        var toggle = document.getElementById('accountToggle');
        var usuario = obtenerUsuarioActual();

        if (toggle) {
            var label = toggle.querySelector('span');
            if (usuario) {
                toggle.classList.add('is-logged-in');
                toggle.setAttribute('title', 'Sesión iniciada como ' + usuario.correo);
                if (label) label.textContent = usuario.nombre.split(' ')[0];
            } else {
                toggle.classList.remove('is-logged-in');
                toggle.removeAttribute('title');
                if (label) label.textContent = 'Mi cuenta';
            }
        }

        var sessionBox = document.getElementById('accountSession');
        var sessionEmail = document.getElementById('accountSessionEmail');
        var tabs = document.getElementById('accountTabs');
        var loginView = document.getElementById('loginView');
        var registerView = document.getElementById('registerView');
        if (sessionBox) {
            sessionBox.style.display = usuario ? 'block' : 'none';
            if (usuario && sessionEmail) sessionEmail.textContent = usuario.correo;
            if (tabs) tabs.style.display = usuario ? 'none' : 'flex';
            if (loginView) loginView.classList.toggle('active', !usuario);
            if (registerView) registerView.classList.remove('active');
        }
    }

    // Todo lo que sigue necesita que el HTML ya esté cargado en el DOM
    // (los formularios de login/registro/recuperación).
    document.addEventListener('DOMContentLoaded', function () {
        actualizarUICuenta();

        var loginForm = document.getElementById('loginView');
        var registerForm = document.getElementById('registerView');
        var recoveryForm = document.getElementById('recoveryView');
        var message = document.getElementById('accountMessage');
        var logoutBtn = document.getElementById('accountLogout');

        // Muestra un mensaje dentro del panel de cuenta: en rojo si es
        // un error, en verde si es un mensaje de éxito.
        function mostrarMensaje(texto, esError) {
            if (!message) return;
            message.style.color = esError ? 'var(--primary)' : 'var(--green)';
            message.textContent = texto;
        }

        // Envío del formulario de LOGIN
        if (loginForm) {
            loginForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var correo = document.getElementById('loginEmail').value;
                var password = document.getElementById('loginPassword').value;
                var resultado = iniciarSesion(correo, password);
                if (!resultado.exito) {
                    mostrarMensaje(resultado.mensaje, true);
                    return;
                }
                mostrarMensaje('¡Bienvenido/a, ' + resultado.usuario.nombre + '!', false);
                actualizarUICuenta();
                // Si el checkout está esperando datos de contacto, se los completamos
                if (typeof global.prellenarDatosCliente === 'function') {
                    global.prellenarDatosCliente(resultado.usuario);
                }
                setTimeout(function () {
                    var accountPanel = document.getElementById('accountPanel');
                    if (accountPanel && typeof global.cerrarPanelCuenta === 'function') {
                        global.cerrarPanelCuenta();
                    } else if (accountPanel) {
                        accountPanel.classList.remove('open');
                        accountPanel.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }
                }, 700);
            });
        }

        // Envío del formulario de REGISTRO
        if (registerForm) {
            registerForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var nombre = document.getElementById('registerName').value.trim();
                var correo = document.getElementById('registerEmail').value.trim();
                var password = document.getElementById('registerPassword').value;
                var confirmar = document.getElementById('registerConfirm').value;
                var region = document.getElementById('registerRegion').value;
                var comuna = document.getElementById('registerCommune').value;

                var reglas = typeof global.evaluarReglasPassword === 'function'
                    ? global.evaluarReglasPassword(password)
                    : { length: password.length >= 8, uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password), number: /\d/.test(password), special: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password) };
                var reglasOk = Object.keys(reglas).every(function (r) { return reglas[r]; });

                if (!registerForm.checkValidity()) {
                    mostrarMensaje('Completa los campos con datos válidos.', true);
                    return;
                }
                if (password !== confirmar) {
                    mostrarMensaje('Las contraseñas no coinciden.', true);
                    return;
                }
                if (!reglasOk) {
                    mostrarMensaje('La contraseña no cumple todos los requisitos.', true);
                    return;
                }

                var resultado = registrarUsuario({ nombre: nombre, correo: correo, password: password, region: region, comuna: comuna });
                mostrarMensaje(resultado.mensaje, !resultado.exito);
                if (resultado.exito) {
                    registerForm.reset();
                    if (typeof global.mostrarVistaCuenta === 'function') {
                        setTimeout(function () { global.mostrarVistaCuenta('login'); }, 900);
                    }
                }
            });
        }

        // Envío del formulario de RECUPERACIÓN de contraseña
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var correo = document.getElementById('recoveryEmail').value;
                var resultado = solicitarRecuperacion(correo);
                mostrarMensaje(resultado.mensaje, !resultado.exito);
            });
        }

        // Botón de CERRAR SESIÓN
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                cerrarSesion();
                mostrarMensaje('Sesión cerrada.', false);
            });
        }
    });

    // API pública mínima para que main.js (carrito / checkout) pueda usarla
    global.PapitaAuth = {
        obtenerUsuarioActual: obtenerUsuarioActual,
        iniciarSesion: iniciarSesion,
        registrarUsuario: registrarUsuario,
        cerrarSesion: cerrarSesion,
        actualizarUICuenta: actualizarUICuenta
    };
})(window);
