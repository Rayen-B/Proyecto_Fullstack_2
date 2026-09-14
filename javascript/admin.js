/**
 * admin.js - Lógica del Panel de Administración, Dashboard, Órdenes y Menú Lateral
 */

// Funcion que inicializa el modal de VER ORDEN
function inicializarModalOrdenes() {
    const modalEl = document.getElementById('modalMostrarOrden');
    if (!modalEl) return;

    // Delegación de clic para que funcione en cualquier botón .btn-ver-orden
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ver-orden');
        if (!btn) return;

        // Obtiene los datos de la fila, si algún dato viene vacío le asigna un valor por defecto
        const orden = btn.getAttribute('data-orden') || '#ORD-1000'; 
        const cliente = btn.getAttribute('data-cliente') || 'Cliente';
        const correo = btn.getAttribute('data-correo') || 'correo@ejemplo.com';
        const fecha = btn.getAttribute('data-fecha') || '2026-06-01';
        const estado = btn.getAttribute('data-estado') || 'Enviado';
        const total = btn.getAttribute('data-total') || '$0';
        const items = btn.getAttribute('data-items') || '';

        // Busca los elementos de texto dentro del modal y actualiza el contenido
        const idEl = document.getElementById('modal-ord-id');
        const estadoEl = document.getElementById('modal-ord-estado');
        const clienteEl = document.getElementById('modal-ord-cliente');
        const correoEl = document.getElementById('modal-ord-correo');
        const fechaEl = document.getElementById('modal-ord-fecha');
        const totalEl = document.getElementById('modal-ord-total');
        const itemsCont = document.getElementById('modal-ord-items');

        // Dependiendo del estado el color del badge cambia
        if (idEl) idEl.textContent = orden;
        if (estadoEl) {
            estadoEl.textContent = estado;
            if (estado === 'Enviado') estadoEl.className = 'badge-soft-success';
            else if (estado === 'Pendiente') estadoEl.className = 'badge-soft-warning';
            else if (estado === 'Cancelado') estadoEl.className = 'badge-soft-danger';
            else estadoEl.className = 'badge-soft-info';
        }
        if (clienteEl) clienteEl.textContent = cliente;
        if (correoEl) correoEl.textContent = correo;
        if (fechaEl) fechaEl.textContent = fecha;
        if (totalEl) totalEl.textContent = total;

        if (itemsCont) {
            // Limpia el contenido
            itemsCont.innerHTML = '';
            // Separa la cadena de texto de productos por punto y coma
            const lista = items ? items.split(';') : [items];
            // Por cada producto, crea dinámicamente un elemento con formato de lista y lo añade al modal
            lista.forEach(it => {
                const div = document.createElement('div');
                div.className = 'list-group-item d-flex justify-content-between align-items-center py-2';
                div.innerHTML = `<span><i class="ti ti-cake me-2 text-secundario"></i> ${it.trim()}</span><span class="badge bg-light text-dark">Confirmado</span>`;
                itemsCont.appendChild(div);
            });
        }
        
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    });
}
//Inicializa el buscador para las ordenes
function inicializarBuscadorOrdenes() {
    //Obtiene el campo de texto del buscador
    const inputBuscador = document.getElementById('buscador-ordenes');
    if (!inputBuscador) return;

    //Localiza la tabla asociada
    const tabla = inputBuscador.closest('.card')?.querySelector('table') || document.querySelector('table');
    if (!tabla) return;
    //Obtiene el cuerpo de la tabla donde estan las filas de datos
    const tbody = tabla.querySelector('tbody');
    if (!tbody) return;
    //Convierte la lista de filas (<tr>) en un array para poder usar métodos
    const filas = Array.from(tbody.querySelectorAll('tr:not(.fila-sin-resultados)'));
    const total = filas.length; //Cantidad de ordenes registradas originalmente
    //Obtiene el elemento donde se muestra el conteo de productos
    const conteoEl = inputBuscador.closest('.card')?.querySelector('.card-footer small');
    const paginacion = inputBuscador.closest('.card')?.querySelector('.pagination');

    //input, este evento escucha cada vez que el usuario escribe o borra
    inputBuscador.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        var visibles = 0; //Contador de ordenes que coincidan con la búsqueda

        //Recorre las filas para saber si muestra u oculta
        filas.forEach(fila => {
            const btnVer = fila.querySelector('.btn-ver-orden');
            const items = btnVer ? (btnVer.getAttribute('data-items') || '') : '';
            // Texto de la fila más los nombres de los productos comprados
            const texto = (fila.textContent + ' ' + items).toLowerCase();

            //Verifica si el texto de la fila INCLUYE la palabra o término buscado
            if (!query || texto.includes(query)) {
                fila.classList.remove('d-none');
                fila.style.removeProperty('display'); //hace visible la fila
                visibles++;
            } else {
                fila.classList.add('d-none');
                fila.style.setProperty('display', 'none', 'important'); //Oculta la fila que no coincide
            }
        });

        //Mensaje cuando no hay coincidencias
        var filaSinResultados = tbody.querySelector('.fila-sin-resultados');
        //Si ninguna fila es visible y aún no existe el mensaje, se crea e inserta en la tabla
        if (visibles === 0) {
            if (!filaSinResultados) {
                filaSinResultados = document.createElement('tr');
                filaSinResultados.className = 'fila-sin-resultados';
                filaSinResultados.innerHTML = `<td colspan="6" class="text-center py-4 text-muted"><i class="ti ti-alert-circle me-1"></i> No se encontraron órdenes coincidentes con "<b>${query}</b>".</td>`;
                tbody.appendChild(filaSinResultados);
            } else {
                filaSinResultados.querySelector('td').innerHTML = `<i class="ti ti-alert-circle me-1"></i> No se encontraron órdenes coincidentes con "<b>${query}</b>".`;
                filaSinResultados.classList.remove('d-none');
                filaSinResultados.style.removeProperty('display');
            }
        } else if (filaSinResultados) {
            filaSinResultados.remove();
        }

        // Actualiza el contador de ordenes en el footer de la tabla
        if (conteoEl) {
            conteoEl.textContent = `Mostrando ${visibles} de ${total} órdenes registradas`;
        }

        // Ocultar paginación mientras se está buscando
        if (paginacion) {
            paginacion.style.display = query ? 'none' : '';
        }
    });
}

//Actualiza las estadisticas y tablas de resumen del dashboard
function actualizarDashboardAdmin() {
    //Obtiene los elementos HTML donde se mostraran las metricas y la tabla
    const totalProdEl = document.getElementById('dash-total-productos');
    const stockCritEl = document.getElementById('dash-stock-critico');
    const totalUsrEl = document.getElementById('dash-total-usuarios');
    const totalOrdEl = document.getElementById('dash-total-ordenes');
    const tablaResumenBody = document.getElementById('dash-tabla-resumen-body');

    // Si no estamos en el dashboard (index.html), salir
    if (!totalProdEl && !tablaResumenBody) return;

    //Obtiene la lista de productos
    const productos = window.obtenerProductos ? obtenerProductos() : [];
    //Filtra cuales productos estan en o por debajo de su stock critico
    const criticos = productos.filter(p => p.stock <= (p.stockCritico || 0));

    //Obtiene la lista de usuarios registrados O carga los usuarios por defecto
    var usuarios = window.obtenerUsuarios ? obtenerUsuarios() : [];
    if (usuarios.length === 0 && window.USUARIOS_DEFAULT) {
        usuarios = USUARIOS_DEFAULT;
    }

    //Escribe los valores calculados en las tarjetas de estadisticas (KPIs)
    if (totalProdEl) totalProdEl.textContent = productos.length;
    if (stockCritEl) stockCritEl.textContent = criticos.length;
    if (totalUsrEl) totalUsrEl.textContent = usuarios.length;
    //Cantidad fija de ejemplo
    if (totalOrdEl) totalOrdEl.textContent = '5';

    //Renderiza las tablas de resumen con los primeros productos del catálogo
    if (tablaResumenBody) {
        tablaResumenBody.innerHTML = '';
        if (productos.length === 0) {
            // Mensaje informativo si el inventario está vacío
            tablaResumenBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><i class="ti ti-alert-circle me-1"></i> No hay productos registrados.</td></tr>`;
        } else {
            // Mostrar los primeros 5 productos
            // Toma una muestra de solo los primeros 5 productos para el resumen
            const resumen = productos.slice(0, 5);
            resumen.forEach(p => {
                 // Comprueba si este producto individual se encuentra en estado crítico
                const esCritico = p.stock <= (p.stockCritico || 0);
                const rutaImg = typeof obtenerRutaImagenAdmin === 'function' ? obtenerRutaImagenAdmin(p.imagen) : (p.imagen || '../assets/images/torta-generica.webp');
                 // Crea la fila dinámica con los datos del producto
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-semibold font-monospace">${p.codigo}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${rutaImg}" alt="${p.nombre}" class="avatar-producto me-2">
                            <span class="fw-semibold">${p.nombre}</span>
                        </div>
                    </td>
                    <td><span class="badge-soft-primary">${p.categoria || 'Pastelería'}</span></td>
                    <td class="fw-bold">$${p.precio.toLocaleString('es-CL')}</td>
                    <td><span class="fw-bold ${esCritico ? 'text-danger' : ''}">${p.stock}</span></td>
                    <td>
                        ${esCritico 
                            ? `<span class="badge-soft-danger"><i class="ti ti-alert-triangle me-1"></i> Crítico</span>` 
                            : `<span class="badge-soft-success">Normal</span>`}
                    </td>
                `;
                tablaResumenBody.appendChild(tr);
            });
        }
    }
}

// Asigna data-label y estructura las celdas para que no se superpongan en móviles
function adaptarTablasMovil() {
    document.querySelectorAll('.table-responsive table').forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        if (!headers.length) return;
        table.querySelectorAll('tbody tr').forEach(tr => {
            if (tr.classList.contains('fila-sin-resultados') || tr.querySelector('td[colspan]')) return;
            tr.querySelectorAll('td').forEach((td, i) => {
                if (headers[i] && !td.getAttribute('data-label')) {
                    td.setAttribute('data-label', headers[i]);
                }
                // Si la celda tiene más de un elemento hijo (ej: nombre y correo sueltos),
                // agruparlos en un contenedor vertical a la derecha
                if (td.children.length > 1 && !td.querySelector('.d-inline-flex') && !td.classList.contains('text-end')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'd-flex flex-column text-end';
                    while (td.firstChild) {
                        wrapper.appendChild(td.firstChild);
                    }
                    td.appendChild(wrapper);
                }
            });
        });
    });
}
window.adaptarTablasMovil = adaptarTablasMovil;


// Inicializar botón de imprimir reportes
function inicializarBotonImprimir() {
    const btnImprimir = document.querySelector('.btn-imprimir');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            window.print();
        });
    }
}

function initAdmin() {
    actualizarDashboardAdmin();
    inicializarModalOrdenes();
    inicializarBuscadorOrdenes();
    inicializarBotonImprimir();

    // Control de Sidebar y Overlay
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const topbar = document.getElementById('topbar');
    const toggleBtn = document.getElementById('toggleBtn'); // Botón para colapsar en desktop
    const mobileBtn = document.getElementById('mobileBtn'); // Botón hamburguesa en móvil
    const overlay = document.getElementById('overlay'); // Capa oscura de fondo para móvil

    // Alternar colapsado/expandido de la barra lateral en pantallas de escritorio
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (sidebar) sidebar.classList.toggle('collapsed');
            if (content) content.classList.toggle('full');
            if (topbar) topbar.classList.toggle('full');
        });
    }
    // Mostrar la barra lateral y la cortina oscura en pantallas móviles
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            if (sidebar) sidebar.classList.add('mobile-show');
            if (overlay) overlay.classList.add('show');
        });
    }
    // Cerrar la barra lateral al hacer clic fuera del menú
    if (overlay) {
        overlay.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('mobile-show');
            if (overlay) overlay.classList.remove('show');
        });
    }

    // Adaptación de tablas en móvil
    adaptarTablasMovil();

    // Observador para tablas dinámicas
    const tbodies = document.querySelectorAll('.table-responsive table tbody');
    if (tbodies.length && window.MutationObserver) {
        const observer = new MutationObserver(() => {
            adaptarTablasMovil();
        });
        tbodies.forEach(tbody => {
            observer.observe(tbody, { childList: true });
        });
    }
}

// Ejecuta la inicialización de inmediato si el DOM ya está listo, o espera el evento
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}

