/**
 * auth.js - Manejo de Autenticación, Sesión y Roles para la Pasteleria
 * Roles: Administrador, Vendedor, Cliente
 */

//AUTH_KEY sirve para almacenar la sesión del usuario en localStorage, mientras que USERS_KEY se utiliza para almacenar la base de datos de usuarios
const AUTH_KEY = 'tienda_usuario_sesion';
const USERS_KEY = 'tienda_usuarios_db';

// Usuarios de prueba predeterminados si no existen
const USUARIOS_DEFAULT = [
    {
        run: "19011022K",
        nombre: "Alan",
        apellidos: "Brito Delgado",
        correo: "alan.brito@duoc.cl",
        password: "Admin@2026",
        rol: "Administrador",
        region: "Región Metropolitana de Santiago",
        comuna: "Santiago",
        direccion: "Av. España 123"
    },
    {
        run: "184561234",
        nombre: "Lola",
        apellidos: "Mento Rojas",
        correo: "lola.mento@profesor.duoc.cl",
        password: "Ventas#2026",
        rol: "Vendedor",
        region: "Región Metropolitana de Santiago",
        comuna: "Providencia",
        direccion: "Av. Providencia 456"
    },
    {
        run: "201239875",
        nombre: "Armando",
        apellidos: "Esteban Quito",
        correo: "armando.quito@gmail.com",
        password: "Cliente!2026",
        rol: "Cliente",
        region: "Región del Biobío",
        comuna: "Concepción",
        direccion: "Calle Prat 789"
    }
];

// Inicializar base de datos de usuarios en localStorage
function inicializarUsuariosDB() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(USUARIOS_DEFAULT)); // Lo convierte a texto para guardarlo en localStorage
    }
}

// Obtener lista de usuarios
function obtenerUsuarios() {
    inicializarUsuariosDB();
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []; //Lo convierte de vuelta a array para poder seguir con js, si no hay usuarios devuelve un array vacio
}

// Guardar nuevo usuario
function guardarUsuario(nuevoUsuario) {
    //Devuelve el arreglo desde localStorage, si no hay usuarios devuelve un arreglo vacio
    const usuarios = obtenerUsuarios();
    // Reemplazar si existe el mismo RUN o agregar
    const index = usuarios.findIndex(u => u.run.toUpperCase() === nuevoUsuario.run.toUpperCase());
    //Si el usuario no existe, lo agrega al arreglo, si existe lo reemplaza con los nuevos datos
    if (index !== -1) {
        usuarios[index] = { ...usuarios[index], ...nuevoUsuario };
    } else {
        usuarios.push(nuevoUsuario);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
}

// Eliminar usuario
function eliminarUsuario(run) {
    const usuarios = obtenerUsuarios();
    //Filtra el arreglo y mantiene solo los usuarios cuyo run no coincida con el run inggresado
    const filtrados = usuarios.filter(u => u.run.toUpperCase() !== run.trim().toUpperCase());
    //el arreglo filtrado SIN el usuario eliminado se guarda en localStorage
    localStorage.setItem(USERS_KEY, JSON.stringify(filtrados));
}

// Iniciar sesión
function iniciarSesion(correo, password) {
    const usuarios = obtenerUsuarios();
    //Busca al usuario cuyo correo y contraseña coincidan con los ingredados
    const usuario = usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase() && u.password === password);
    //Si encuentra al usuario guarda la sesión en localStorage y devuelve un objeto con exito true y el usuario, si no lo encuentra devuelve exito false y un mensaje de error
    if (usuario) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(usuario));
        return { exito: true, usuario };
    }
    return { exito: false, mensaje: "Correo o contraseña incorrectos" };
}

// Obtener usuario actualmente conectado
function obtenerUsuarioActual() {
    const sesion = localStorage.getItem(AUTH_KEY);
    if (sesion) {
        return JSON.parse(sesion);
    }
    // Por defecto sesión como Administrador para probar todo el panel
    return USUARIOS_DEFAULT[0];
}

// Cerrar sesión
//borra la sesion almacenada y redirige al login
function cerrarSesion() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = window.location.pathname.includes('/admin/') ? '../login.html' : 'login.html';
}

// Cambiar rol activo (admin, vendedor, cliente) y actualiza sus permisos
function cambiarRolActivo(nuevoRol) {
    const usuario = obtenerUsuarioActual();
    usuario.rol = nuevoRol;
    localStorage.setItem(AUTH_KEY, JSON.stringify(usuario));
    aplicarPermisosRol();
    window.location.reload();
}

// Aplicar permisos según el rol en la vista del administrador
function aplicarPermisosRol() {
    const usuario = obtenerUsuarioActual();
    const rolActualElemento = document.getElementById('usuario-rol-actual');
    const nombreActualElemento = document.getElementById('usuario-nombre-actual');

    //Revisa si el rol y el nombre del usuario actual existen en el DOM y si existen los actualiza con la información del usuario actual
    if (rolActualElemento) rolActualElemento.textContent = usuario.rol;
    if (nombreActualElemento) nombreActualElemento.textContent = `${usuario.nombre} ${usuario.apellidos || ''}`;

    //Revisa si esta en el panel de admin
    const path = window.location.pathname.toLowerCase();
    const esZonaAdmin = path.includes('/admin/') || path.includes('\\admin\\') || path.endsWith('/admin') || path.endsWith('/admin/index.html');

    // Redirección según rol y zona de acceso
    // Cliente: Solo puede acceder a la tienda.
    if (usuario.rol === 'Cliente') {
        if (esZonaAdmin) {
            window.location.href = '../index.html';
            return;
        }
    }

    // El Vendedor solo puede ver Productos y Órdenes. Todos los demás accesos no deben aparecer
    const accesosOcultos = document.querySelectorAll('.solo-admin');
    if (usuario.rol === 'Vendedor') {
        accesosOcultos.forEach(el => el.style.setProperty('display', 'none', 'important'));
        
        // Guard de redirección si el Vendedor intenta acceder directamente a páginas protegidas de administración
        if (path.includes('usuarios.html') || path.includes('usuario-form.html') || path.includes('producto-form.html')) {
            window.location.href = 'productos.html';
            return;
        }
        //Si no, entonces se muestran todos los accesos (Admin)
    } else {
        accesosOcultos.forEach(el => el.style.removeProperty('display'));
    }
}

// Ejecuta al cargar la página
// Inicializa la base de datos de usuarios y aplica los permisos según el rol del usuario actual
document.addEventListener('DOMContentLoaded', () => {
    inicializarUsuariosDB();
    aplicarPermisosRol();

    // Maneja enlaces y botones de Cerrar Sesión de forma global
    //Si el usuario hace click se llama a la funcion cerrarSesion y redigire al login
    document.addEventListener('click', (e) => {
    const logout = e.target.closest('[data-action="cerrar-sesion"]');
    if (logout) {
        //preventDefault evita que se rediriga a otra pagina en caso de ser un enlace, y llama a la funcion cerrarSesion en vez.
        e.preventDefault();
        cerrarSesion();
    }
});
});

