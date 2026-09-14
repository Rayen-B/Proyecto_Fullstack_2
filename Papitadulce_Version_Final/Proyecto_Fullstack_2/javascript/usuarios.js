/**
 * usuarios.js - Gestión de Usuarios, Tabla Administrativa y Ficha de Usuario
 */

//Busca a un usuario por su RUN y muestra todos sus datos detallados en una ventana modal.
function abrirModalUsuario(run) {
    //Obtiene el elemento del modal en el HTML
    const modalEl = document.getElementById('modalMostrarUsuario');
    if (!modalEl) return;

    // Obtener la lista de usuarios registrados o cargar los datos por defecto
    var usuarios = [];
     usuarios = obtenerUsuarios();
    if (usuarios.length === 0) usuarios = USUARIOS_DEFAULT;

    //Buscar al usuario específico en el arreglo que coincida con el RUN recibido (ignorando puntos y guiones)
    const runLimpio = run.replace(/[\.\-]/g, '').trim().toUpperCase();
    const usr = usuarios.find(u => u.run.replace(/[\.\-]/g, '').trim().toUpperCase() === runLimpio);
    if (!usr) return;

    //Captura los elementos internos del modal donde se insertara la información
    const nomEl = document.getElementById('modal-usr-nombre');
    const rolEl = document.getElementById('modal-usr-rol');
    const runEl = document.getElementById('modal-usr-run');
    const correoEl = document.getElementById('modal-usr-correo');
    const fechaEl = document.getElementById('modal-usr-fecha');
    const ubicacionEl = document.getElementById('modal-usr-ubicacion');
    const dirEl = document.getElementById('modal-usr-direccion');
    const btnEditar = document.getElementById('modal-usr-btn-editar');

     // Inserta nombre completo
    if (nomEl) nomEl.textContent = `${usr.nombre} ${usr.apellidos || ''}`;
    //Depeindiendo del rol, le asigna un color de badge diferente
    if (rolEl) {
        rolEl.textContent = usr.rol || 'Cliente';
        if (usr.rol === 'Administrador') rolEl.className = 'badge-soft-secondary';
        else if (usr.rol === 'Vendedor') rolEl.className = 'badge-soft-primary';
        else rolEl.className = 'badge-soft-info';
    }
    //Inserta datos personales
    if (runEl) runEl.textContent = usr.run;
    if (correoEl) correoEl.textContent = usr.correo;
    if (fechaEl) fechaEl.textContent = usr.fechaNacimiento || 'No registrada';
    if (ubicacionEl) ubicacionEl.textContent = `${usr.comuna || 'Santiago'}, ${usr.region || 'Región Metropolitana'}`;
    if (dirEl) dirEl.textContent = usr.direccion || 'Sin dirección registrada';
    if (btnEditar) btnEditar.href = `usuario-form.html?run=${usr.run}`;
    //Muestra el modal
    if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}
// Inicializa formulario de usuario
function inicializarFormularioUsuario() {
    //Obtiene el formulario, si no existe en la página actual, termina
    const form = document.getElementById('form-usuario');
    if (!form) return;

    // Inicializar el selector de Regiones y Comunas
    
        inicializarSelectorRegiones('select-region', 'select-comuna');
    
    //Captura todos los campos del formulario
    const inputRun = document.getElementById('run');
    const inputNombre = document.getElementById('nombre');
    const inputApellidos = document.getElementById('apellidos');
    const inputCorreo = document.getElementById('correo');
    const inputPass = document.getElementById('password');
    const inputFechaNac = document.getElementById('fechaNacimiento');
    const selectRegion = document.getElementById('select-region');
    const selectComuna = document.getElementById('select-comuna');
    const selectRol = document.getElementById('rol');
    const inputDireccion = document.getElementById('direccion');
    const alerta = document.getElementById('alerta-usuario');

    // MODO EDICIÓN DE USUARIO: Detectar ?run= en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const runParam = urlParams.get('run'); // Lee el valor del parámetro run
    var esEdicionUsuario = false;

    if (runParam) {
        // Obtener los usuarios registrados para buscar al que se va a editar
        var usuarios = [];
         {
            usuarios = obtenerUsuarios();
        }
        if (usuarios.length === 0) {
            usuarios = USUARIOS_DEFAULT;
        }

        const usuarioAEditar = usuarios.find(u => u.run.toUpperCase() === runParam.trim().toUpperCase());
        
        if (usuarioAEditar) {
            esEdicionUsuario = true; // Marcamos que esta en modo editar
            
            // Cambiar títulos y botón para que refleje modo edici´on
            const tituloCard = document.querySelector('.card-header h5.card-title');
            if (tituloCard) {
                tituloCard.innerHTML = `<i class="ti ti-user-check me-2 text-secundario"></i> Editar Usuario: ${usuarioAEditar.nombre} ${usuarioAEditar.apellidos || ''}`;
            }
            const tituloTopbar = document.querySelector('#topbar h5');
            if (tituloTopbar) {
                tituloTopbar.textContent = 'Editar Usuario';
            }
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.innerHTML = `<i class="ti ti-device-floppy me-1"></i> GUARDAR CAMBIOS`;
            }

            // Llenar campos con los datos del usuario
            if (inputRun) {
                inputRun.value = usuarioAEditar.run;
                inputRun.readOnly = true; // El RUN queda bloqueado para no alterar la identificación
            }
            if (inputNombre) inputNombre.value = usuarioAEditar.nombre || '';
            if (inputApellidos) inputApellidos.value = usuarioAEditar.apellidos || '';
            if (inputCorreo) inputCorreo.value = usuarioAEditar.correo || '';
            if (inputPass) inputPass.value = usuarioAEditar.password || '';
            if (inputFechaNac && usuarioAEditar.fechaNacimiento) inputFechaNac.value = usuarioAEditar.fechaNacimiento;
            if (selectRol) selectRol.value = usuarioAEditar.rol || 'Cliente';
            if (inputDireccion) inputDireccion.value = usuarioAEditar.direccion || '';

            // Cargar Región y Comuna correspondiente
            if (selectRegion && usuarioAEditar.region) {
                selectRegion.value = usuarioAEditar.region;
                selectRegion.dispatchEvent(new Event('change')); // ejecuta la carga de comunas
                if (selectComuna && usuarioAEditar.comuna) {
                    selectComuna.value = usuarioAEditar.comuna;  // Selecciona la comuna del usuario
                }
            }
        }
    }
    //VALIDACIÓN CON INPUT

    if (inputRun) {
        inputRun.addEventListener('input', () => {
            mostrarFeedback(inputRun, validarRUN(inputRun.value));
        });
    }

    if (inputNombre) {
        inputNombre.addEventListener('input', () => {
            const valido = inputNombre.value.trim() !== '' && inputNombre.value.length <= 50;
            mostrarFeedback(inputNombre, { valido, mensaje: valido ? "Nombre correcto" : "Requerido (máx 50 caracteres)" });
        });
    }

    if (inputApellidos) {
        inputApellidos.addEventListener('input', () => {
            const valido = inputApellidos.value.trim() !== '' && inputApellidos.value.length <= 100;
            mostrarFeedback(inputApellidos, { valido, mensaje: valido ? "Apellidos correctos" : "Requerido (máx 100 caracteres)" });
        });
    }

    if (inputCorreo) {
        inputCorreo.addEventListener('input', () => {
            mostrarFeedback(inputCorreo, validarEmail(inputCorreo.value));
        });
    }

    if (inputPass) {
        inputPass.addEventListener('input', () => {
            mostrarFeedback(inputPass, validarPassword(inputPass.value));
        });
    }

    if (inputDireccion) {
        inputDireccion.addEventListener('input', () => {
            const valido = inputDireccion.value.trim() !== '' && inputDireccion.value.length <= 300;
            mostrarFeedback(inputDireccion, { valido, mensaje: valido ? "Dirección válida" : "Requerido (máx 300 caracteres)" });
        });
    }

//Procesamiento y envio del formulario con submit

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar que la página se recargue


        // Verificar el cumplimiento de cada regla de validación
        const vRun = validarRUN(inputRun.value);
        const vCorreo = validarEmail(inputCorreo.value);
        const vPass = validarPassword(inputPass.value);
        const vNombre = inputNombre.value.trim() !== '' && inputNombre.value.length <= 50;
        const vApellidos = inputApellidos.value.trim() !== '' && inputApellidos.value.length <= 100;
        const vDir = inputDireccion.value.trim() !== '' && inputDireccion.value.length <= 300;
        const vReg = selectRegion.value !== '';
        const vCom = selectComuna.value !== '';


        
        // Refrescar los mensajes visuales en pantalla
        mostrarFeedback(inputRun, vRun);
        mostrarFeedback(inputCorreo, vCorreo);
        mostrarFeedback(inputPass, vPass);

        // Si todos los campos cumplen las condiciones se guarda el objeto con los datos limpios
        if (vRun.valido && vCorreo.valido && vPass.valido && vNombre && vApellidos && vDir && vReg && vCom) {
            const nuevo = {
                run: inputRun.value.trim().toUpperCase().replace(/[\.\-]/g, ''),
                nombre: inputNombre.value.trim(),
                apellidos: inputApellidos.value.trim(),
                correo: inputCorreo.value.trim(),
                password: inputPass.value,
                fechaNacimiento: inputFechaNac ? inputFechaNac.value : '',
                rol: selectRol ? selectRol.value : 'Cliente',
                region: selectRegion.value,
                comuna: selectComuna.value,
                direccion: inputDireccion.value.trim()
            };

                // Guardar o actualizar en el listado de usuarios
                if (window.guardarUsuario) {
                guardarUsuario(nuevo);
                }

            
                //Mostrar mensaje exitoso
            if (alerta) {
                alerta.className = "alert alert-success alert-dismissible fade show";
                alerta.innerHTML = `<i class="ti ti-check-circle me-1"></i> ¡Usuario <b>${nuevo.nombre} ${nuevo.apellidos}</b> ${esEdicionUsuario ? 'actualizado' : 'registrado'} exitosamente!`;
                alerta.classList.remove('d-none');
            }

            //Si era un registro nuevo y no una edición, limpia el formulario
            if (!esEdicionUsuario) {
                form.reset();
                document.querySelectorAll('.feedback-msg').forEach(el => el.remove());
                document.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
            }
             // Si hubo errores, mostrar alerta en rojo
        } else if (alerta) {
            alerta.className = "alert alert-danger alert-dismissible fade show";
            alerta.innerHTML = `<i class="ti ti-alert-triangle me-1"></i> Por favor verifique los campos requeridos marcados en rojo.`;
            alerta.classList.remove('d-none');
        }
    });
} 

//Renderiza y gestiona la tabla completa de administración de usuarios
function renderizarTablaUsuariosAdmin() {
    // Obteiene el cuerpo de la tabla, si no existe en la vista actual, salir
    const tbody = document.getElementById('tabla-usuarios-body');
    if (!tbody) return;

    const buscador = document.getElementById('buscador-usuarios');
    const conteoEl = document.getElementById('conteo-usuarios');

    
    function pintarFilas(filtro = '') {
        // Obtener usuarios del localStorage o usar los por defecto
        var usuarios = window.obtenerUsuarios ? obtenerUsuarios() : [];
        if (usuarios.length === 0 && window.USUARIOS_DEFAULT) {
            usuarios = USUARIOS_DEFAULT;
        }

         // Limpiar el texto de búsqueda
        const textoFiltro = filtro.toLowerCase().trim();
        // Filtrar usuarios por RUN, Nombre, Apellidos o Correo
        const filtrados = usuarios.filter(u => 
            u.run.toLowerCase().includes(textoFiltro) ||
            u.nombre.toLowerCase().includes(textoFiltro) ||
            (u.apellidos && u.apellidos.toLowerCase().includes(textoFiltro)) ||
            (u.correo && u.correo.toLowerCase().includes(textoFiltro))
        );

        tbody.innerHTML = ''; // Limpiar la tabla antes de dibujar

        if (filtrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><i class="ti ti-alert-circle me-1"></i> No se encontraron usuarios coincidentes.</td></tr>`;
            // Recorrer cada usuario filtrado y construir su fila HTML
        } else {
            filtrados.forEach(u => {
                var badgeClass = 'badge-soft-info'; // Define colores e iconos según el rol
                var iconClass = 'ti-user';
                if (u.rol === 'Administrador') {
                    badgeClass = 'badge-soft-secondary';
                    iconClass = 'ti-shield';
                } else if (u.rol === 'Vendedor') {
                    badgeClass = 'badge-soft-primary';
                    iconClass = 'ti-user';
                }

                //Crear la fila tr
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-bold font-monospace">${u.run}</td>
                    <td>
                        <div>
                            <div class="fw-semibold">${u.nombre} ${u.apellidos || ''}</div>
                            <small class="text-muted">${u.direccion || 'Sin dirección'}</small>
                        </div>
                    </td>
                    <td><a href="mailto:${u.correo}" class="text-decoration-none text-secundario">${u.correo}</a></td>
                    <td><span class="${badgeClass}"><i class="ti ${iconClass} me-1"></i> ${u.rol || 'Cliente'}</span></td>
                    <td>${u.comuna || (u.region ? u.region.split(' ')[0] : 'Santiago')}</td>
                    <td class="text-end">
                        <div class="d-inline-flex gap-2">
                            <button type="button" class="btn btn-outline-info btn-sm btn-ver-usuario" data-bs-toggle="modal" data-bs-target="#modalMostrarUsuario" data-run="${u.run}"><i class="ti ti-eye"></i> Ver</button>
                            <a href="usuario-form.html?run=${u.run}" class="btn btn-outline-pasteleria btn-sm solo-admin"><i class="ti ti-edit"></i> Editar</a>
                            <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-usuario solo-admin" data-run="${u.run}"><i class="ti ti-trash"></i> Eliminar</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
         // Actualizar el contador inferior
        if (conteoEl) {
            conteoEl.textContent = `Mostrando ${filtrados.length} usuarios registrados`;
        }
        // Aplicar permisos visuales según el rol
        if (window.aplicarPermisosRol) {
            aplicarPermisosRol();
        }
        if (window.adaptarTablasMovil) window.adaptarTablasMovil();
    }
    
        // Dibujar las filas inicialmente al cargar la vista
    pintarFilas();

    if (buscador) {
        buscador.addEventListener('input', (e) => {
            pintarFilas(e.target.value);
        });
    }

    // Delegación de click para botones Ver Usuario
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ver-usuario');
        if (btn) {
            const run = btn.getAttribute('data-run');
            if (run) abrirModalUsuario(run);
        }
    });

    // Delegación de click para botones Eliminar Usuario
    var runAEliminar = null; // Variable temporal para recordar a quién se va a borrar


    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-eliminar-usuario');
        if (btn) {
            const run = btn.getAttribute('data-run');
            if (!run) return;

            //Evita que el administrador conectado se borre a sí mismo
            var usuarioActual = window.obtenerUsuarioActual ? obtenerUsuarioActual() : null;
            if (usuarioActual && usuarioActual.run && usuarioActual.run.toUpperCase() === run.toUpperCase()) {
                alert('No puedes eliminar tu propio usuario activo actualmente conectado.');
                return;
            }

            runAEliminar = run;
            var usuarios = window.obtenerUsuarios ? obtenerUsuarios() : [];
            const usr = usuarios.find(u => u.run.toUpperCase() === run.toUpperCase());
            const nombre = usr ? `${usr.nombre} ${usr.apellidos || ''}` : run;
            // Rellenar los textos de advertencia del modal
            const modalEl = document.getElementById('modalConfirmarEliminar');
            const tituloEl = document.getElementById('modal-eliminar-titulo');
            const mensajeEl = document.getElementById('modal-eliminar-mensaje');

            if (tituloEl) tituloEl.textContent = '¿Eliminar usuario?';
            if (mensajeEl) mensajeEl.innerHTML = `¿Estás seguro de que deseas eliminar al usuario <b>${nombre}</b> (RUN: <code>${run}</code>)? Esta acción no se puede deshacer.`;
            // Abrir el modal de confirmación con Bootstrap
            if (modalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show();
            }
        }
    });
     // Confirmación definitiva dentro del botón del modal
    const btnConfirmarUsr = document.getElementById('btn-confirmar-eliminar-definitivo');
    if (btnConfirmarUsr) {
        btnConfirmarUsr.addEventListener('click', () => {
            if (!runAEliminar) return;
            // Elimina el usuario en LocalStorage
            if (window.eliminarUsuario) {
                    eliminarUsuario(runAEliminar);
                    runAEliminar = null;
            }
            
            
            // Cerrar el modal
            const modalEl = document.getElementById('modalConfirmarEliminar');
            if (modalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.hide();
            }
            // Refrescar la tabla con los datos actualizados
            pintarFilas(buscador ? buscador.value : '');
        });
    }
}

function initUsuarios() {
    inicializarFormularioUsuario();
    renderizarTablaUsuariosAdmin();
}

// Ejecuta la inicialización de inmediato si el DOM ya está listo, o espera el evento
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUsuarios);
} else {
    initUsuarios();
}

