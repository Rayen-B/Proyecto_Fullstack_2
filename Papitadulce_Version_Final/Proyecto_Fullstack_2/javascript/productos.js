/**
 * productos.js - Catálogo de Productos, Gestión de Inventario y Formulario de Productos
 */

const PRODUCTOS_KEY = 'pasteleria_productos_db';

// 1. CATÁLOGO INICIAL DE PASTELERÍA

//Productos por defecto
const PRODUCTOS_DEFAULT = [
    {
        codigo: "TC001",
        nombre: "Torta Selva Negra",
        categoria: "Tortas",
        precio: 45000,
        stock: 12,
        stockCritico: 4,
        imagen: "assets/images/Torta_Selva_Negra.webp",
        descripcion: "Torta de bizcocho de chocolate rellena con crema, cerezas y dulce de guinda."
    },
    {
        codigo: "TM002",
        nombre: "Torta Panqueque de naranja",
        categoria: "Tortas",
        precio: 38000,
        stock: 8,
        stockCritico: 3,
        imagen: "assets/images/Torta_Panqueque_Naranja.jpg",
        descripcion: "Deliciosa torta de panqueque con sabor a naranja."
    },
    {
        codigo: "TT003",
        nombre: "Torta Tres Leches",
        categoria: "Tortas",
        precio: 36000,
        stock: 15,
        stockCritico: 5,
        imagen: "assets/images/Torta_Tres_Leches.webp",
        descripcion: "Bizcochuelo esponjoso remojado en infusión de tres leches y cubierto con merengue."
    },
    {
        codigo: "TL004",
        nombre: "Torta de Trufa",
        categoria: "Tortas",
        precio: 42000,
        stock: 2,
        stockCritico: 4,
        imagen: "assets/images/Torta_Trufa.jpeg",
        descripcion: "Deliciosa torta de trufa artesanal con ganache."
    },
    {
        codigo: "TF005",
        nombre: "Empolvados",
        categoria: "Pastelería Chilena",
        precio: 25000,
        stock: 6,
        stockCritico: 2,
        imagen: "assets/images/Empolvados.jpeg",
        descripcion: "Delicados bizcochos rellenos con manjar y espolvoreados con azúcar flor."
    },
    {
        codigo: "PI006",
        nombre: "Arroz con Leche",
        categoria: "Postres",
        precio: 5000,
        stock: 1,
        stockCritico: 5,
        imagen: "assets/images/Arroz_con_Leche.webp",
        descripcion: "Postre a base de arroz, leche, azúcar y canela."
    }
];

// Inicializar productos en localStorage y sincronizar con los nombres oficiales
function inicializarProductosDB() {
    const guardados = localStorage.getItem(PRODUCTOS_KEY);
    //Si no hay productos guardados, se guardan los productos por defecto. Si hay productos guardados, se revisa si tienen nombres antiguos y se reemplazan por los nombres oficiales.
    if (!guardados) {
        localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(PRODUCTOS_DEFAULT));
    } else {
        //El try catch evita errores si el JSON no funciona correctamente, si eso pasa se reemplaza por los productos por defecto
        try {
            const prods = JSON.parse(guardados);
            const tieneNombresAntiguos = prods.some(p => 
                p.nombre.includes("Cuadrada") || 
                p.nombre.includes("Milhojas") || 
                p.nombre.includes("Mousse") || 
                p.nombre.includes("Tartaleta")
            );
            if (tieneNombresAntiguos) {
                localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(PRODUCTOS_DEFAULT));
            }
        } catch (e) {
            localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(PRODUCTOS_DEFAULT));
        }
    }
}

//Devuelve el array de productos guardados en localStorage, si no devuelve el array por defecto
function obtenerProductos() {
    inicializarProductosDB();
    return JSON.parse(localStorage.getItem(PRODUCTOS_KEY)) || PRODUCTOS_DEFAULT;
}
//guarda un nuevo producto, primero obtiene el array de productos guardados,
function guardarProducto(producto) {
    const productos = obtenerProductos();
    // luego busca si existe un producto con el mismo código, si existe lo reemplaza, si no lo agrega al final del array
    const index = productos.findIndex(p => p.codigo.toUpperCase() === producto.codigo.toUpperCase());
    if (index !== -1) {
        productos[index] = { ...productos[index], ...producto };
        //finalmente guarda el array actualizado en localStorage
    } else {
        productos.push(producto);
    }
    localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
}
//sobreescribe el array de productos guardados en localStorage con el array que se le pasa como parámetro
function guardarProductos(lista) {
    localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(lista));
}

function eliminarProducto(codigo) {
    const productos = obtenerProductos();
    const filtrados = productos.filter(p => p.codigo.toUpperCase() !== codigo.trim().toUpperCase());
    guardarProductos(filtrados);
}
//Construye la ruta dependiendo de como venga la imagen
function obtenerRutaImagenAdmin(ruta) {
    if (!ruta) return '../assets/images/Torta_Selva_Negra.webp'; //BUSCAR UNA FOTO POR DEFECTO!!!!!!
    if (ruta.startsWith('http') || ruta.startsWith('data:')) return ruta;
    if (ruta.startsWith('../')) return ruta;
    if (ruta.startsWith('assets/')) return '../' + ruta;
    return '../assets/images/' + ruta;
}
//MOSTRAR PRODUCTO
function abrirModalProducto(codigo) {
    //Si no existe devuelve return
    const modalEl = document.getElementById('modalMostrarProducto');
    if (!modalEl) return;
    //Busca el producto con ese codigo
    const productos = obtenerProductos();
    const prod = productos.find(p => p.codigo.toUpperCase() === codigo.trim().toUpperCase());
    if (!prod) return;

    //En donde se insertaran los datos del producto
    const imgEl = document.getElementById('modal-prod-img');
    const codEl = document.getElementById('modal-prod-codigo');
    const catEl = document.getElementById('modal-prod-categoria');
    const nomEl = document.getElementById('modal-prod-nombre');
    const descEl = document.getElementById('modal-prod-desc');
    const precioEl = document.getElementById('modal-prod-precio');
    const stockEl = document.getElementById('modal-prod-stock');
    const criticoEl = document.getElementById('modal-prod-critico');
    const alertaEl = document.getElementById('modal-prod-alerta');
    const btnEditar = document.getElementById('modal-prod-btn-editar');

    if (imgEl) imgEl.src = obtenerRutaImagenAdmin(prod.imagen);
    if (codEl) codEl.textContent = prod.codigo;
    if (catEl) catEl.textContent = prod.categoria || 'Pastelería';
    if (nomEl) nomEl.textContent = prod.nombre;
    if (descEl) descEl.textContent = prod.descripcion || 'Sin descripción disponible.';
    //miles de pesos chilenos
    if (precioEl) precioEl.textContent = '$' + prod.precio.toLocaleString('es-CL');
    if (stockEl) {
        stockEl.textContent = prod.stock;
        //si el stock es mmenor o igual al critico lo pinta rojo, si no verde
        stockEl.className = prod.stock <= (prod.stockCritico || 0) ? 'fw-bold fs-5 text-danger' : 'fw-bold fs-5 text-success';
    }
    if (criticoEl) criticoEl.textContent = prod.stockCritico || 0;

    if (alertaEl) {
        const esCritico = prod.stock <= (prod.stockCritico || 0);
        //Si el stock es critico despliega además una advertencia en el modal
        if (esCritico) {
            alertaEl.className = 'alert alert-danger py-2 px-3 mb-0 small';
            alertaEl.innerHTML = `<i class="ti ti-alert-triangle me-1"></i> <strong>Atención:</strong> Stock en nivel crítico (mínimo: ${prod.stockCritico || 0}).`;
            //Caso contrario
        } else {
            alertaEl.className = 'alert alert-success py-2 px-3 mb-0 small';
            alertaEl.innerHTML = `<i class="ti ti-check-circle me-1"></i> Stock en nivel adecuado.`;
        }
    }
    //El boton editar lleva directamente a ese producto
    if (btnEditar) btnEditar.href = `producto-form.html?codigo=${prod.codigo}`;

    if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}
//FORMULARIO DE PRODUCTO
function inicializarFormularioProducto() {
    const form = document.getElementById('form-producto');
    if (!form) return;

    const inputCodigo = document.getElementById('codigo');
    const inputNombre = document.getElementById('nombre');
    const inputPrecio = document.getElementById('precio');
    const inputStock = document.getElementById('stock');
    const inputStockCritico = document.getElementById('stock-critico');
    const selectCategoria = document.getElementById('categoria');
    const textareaDesc = document.getElementById('descripcion');
    const contadorDesc = document.getElementById('contador-desc');
    const alerta = document.getElementById('alerta-producto');

    // MODO EDICIÓN DE PRODUCTO
    //  UrlSearchParams etecta ?codigo= en la URL y lo extrae, si no retorna null
    var urlParams = new URLSearchParams(window.location.search);
    var codigoParam = urlParams.get('codigo');
    var esEdicionProducto = false;
    var prodAEditar = null;

    //Si hay un codigo en la URL lo busca en el inventario, si lo encuentra se activa el modo edición
    if (codigoParam) {
        const productos = obtenerProductos();
        prodAEditar = productos.find(p => p.codigo.toUpperCase() === codigoParam.trim().toUpperCase());
        if (prodAEditar) {
            esEdicionProducto = true;
            //Se cambia el titulo y nombre al adecuado (editando)
            const tituloCard = document.querySelector('.card-header h5.card-title');
            if (tituloCard) {
                tituloCard.innerHTML = `<i class="ti ti-edit me-2 text-secundario"></i> Editar Producto: ${prodAEditar.nombre}`;
            }
            const tituloTopbar = document.querySelector('#topbar h5');
            if (tituloTopbar) {
                tituloTopbar.textContent = 'Editar Producto';
            }
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.innerHTML = `<i class="ti ti-device-floppy me-1"></i> GUARDAR CAMBIOS`;
            }

            if (inputCodigo) {
                inputCodigo.value = prodAEditar.codigo;
                inputCodigo.readOnly = true; //readOnly ya que la ID no se debe modificar
            }
            //Rellena los input con los valores que tenia guardado
            if (inputNombre) inputNombre.value = prodAEditar.nombre || '';
            if (inputPrecio) inputPrecio.value = prodAEditar.precio || 0;
            if (inputStock) inputStock.value = prodAEditar.stock || 0;
            if (inputStockCritico) inputStockCritico.value = prodAEditar.stockCritico || 0;
            if (selectCategoria) selectCategoria.value = prodAEditar.categoria || 'Tortas';
            if (textareaDesc) {
                textareaDesc.value = prodAEditar.descripcion || '';
                
                if (contadorDesc) contadorDesc.textContent = `${textareaDesc.value.length} / 500 caracteres`;
            }
        }
    }
    //Calcula los caracteres ingresados apenas se escriba
    if (textareaDesc && contadorDesc) {
        textareaDesc.addEventListener('input', () => {
            contadorDesc.textContent = `${textareaDesc.value.length} / 500 caracteres`;
        });
    }
    //Valida y muestra feedback apenas se escriba
    if (inputCodigo) {
        inputCodigo.addEventListener('input', () => {
            mostrarFeedback(inputCodigo, validarCodigoProducto(inputCodigo.value));
        });
    }
    //Valida y muestra feedback apenas se escriba
    if (inputNombre) {
        inputNombre.addEventListener('input', () => {
            const valido = inputNombre.value.trim() !== '' && inputNombre.value.length <= 100;
            mostrarFeedback(inputNombre, { valido, mensaje: valido ? "Nombre correcto" : "Requerido (máx 100 caracteres)" });
        });
    }
    //Valida y muestra feedback apenas se escriba
    if (inputPrecio) {
        inputPrecio.addEventListener('input', () => {
            mostrarFeedback(inputPrecio, validarPrecio(inputPrecio.value));
        });
    }

    // Validación y alerta interactiva de Stock Crítico
    function verificarAlertaStockCritico() {
        if (!inputStock || !inputStockCritico) return;
        const valStock = parseInt(inputStock.value, 10); //Stock , numero entero en base decimal
        const valCritico = parseInt(inputStockCritico.value, 10); //Critico , numero entero en base decimal
        if (!isNaN(valStock) && !isNaN(valCritico) && valCritico > 0) {
            if (valStock <= valCritico) { // Si la cantidad es menor o igual al limite, inserta una advertencia
                if (alerta) {
                    alerta.className = "alert alert-warning alert-dismissible fade show";
                    alerta.innerHTML = `<i class="ti ti-alert-triangle me-1"></i> <strong>Aviso de Stock Crítico:</strong> El stock ingresado (${valStock}) es menor o igual al límite crítico (${valCritico}).`;
                    alerta.classList.remove('d-none'); 
                }
                // Si aumenta el stock se ocutla
            } else if (alerta && alerta.classList.contains('alert-warning')) {
                alerta.classList.add('d-none');
            }
        }
    }
    //Valida que sea positivo y si es stock critico
    if (inputStock) {
        inputStock.addEventListener('input', () => {
            mostrarFeedback(inputStock, validarStock(inputStock.value));
            verificarAlertaStockCritico();
        });
    }
    //Verifica si hay alerta o no
    if (inputStockCritico) {
        inputStockCritico.addEventListener('input', verificarAlertaStockCritico);
    }
    //Impide que la pagina recargue en blanco
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        //Valida todo nuevamente al presionar guardar
        const valCodigo = validarCodigoProducto(inputCodigo.value);
        const valPrecio = validarPrecio(inputPrecio.value);
        const valStock = validarStock(inputStock.value);
        const valNombre = inputNombre.value.trim() !== '' && inputNombre.value.length <= 100;
        const valCategoria = selectCategoria.value !== '';

        mostrarFeedback(inputCodigo, valCodigo);
        mostrarFeedback(inputPrecio, valPrecio);
        mostrarFeedback(inputStock, valStock);
        //Si TODAS las validaciones son TRUE se guarda
        if (valCodigo.valido && valPrecio.valido && valStock.valido && valNombre && valCategoria) {
            var rutaImagen = "assets/images/Torta_Selva_Negra.webp"; //CAMBIAR FOTO POR DEFECTO
            //Si no se subio una foto nueva se conserva la antigua
            if (prodAEditar && prodAEditar.imagen) {
                rutaImagen = prodAEditar.imagen;
            }//Si se sube una foto nueva, le extrae el nombre del archivo y lo rutea
            const inputImagen = document.getElementById('imagen');
            if (inputImagen && inputImagen.files && inputImagen.files.length > 0) {
                rutaImagen = "assets/images/" + inputImagen.files[0].name;
            }
            //Crea objeto JSON con los datos limpios
            const nuevoProducto = {
                codigo: inputCodigo.value.trim().toUpperCase(),
                nombre: inputNombre.value.trim(),
                categoria: selectCategoria.value,
                precio: parseFloat(inputPrecio.value),
                stock: parseInt(inputStock.value, 10),
                stockCritico: parseInt(inputStockCritico.value, 10) || 0,
                descripcion: textareaDesc ? textareaDesc.value.trim() : '',
                imagen: rutaImagen
            };
            //Lo guarda o actualiza
            guardarProducto(nuevoProducto);

            //Cartel de confirmacion guardado/actualizado
            if (alerta) {
                alerta.className = "alert alert-success alert-dismissible fade show";
                alerta.innerHTML = `<i class="ti ti-check-circle me-1"></i> ¡Producto <strong>${nuevoProducto.nombre}</strong> ${esEdicionProducto ? 'actualizado' : 'guardado'} correctamente!`;
                alerta.classList.remove('d-none');
            }
            //Si es registro nuevo, borra el formulario y los colores, si no los conserva
            if (!esEdicionProducto) {
                form.reset();
                document.querySelectorAll('.feedback-msg').forEach(el => el.remove());
                document.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
            }
            //Mensaje de alerta general
        } else if (alerta) {
            alerta.className = "alert alert-danger alert-dismissible fade show";
            alerta.innerHTML = `<i class="ti ti-alert-triangle me-1"></i> Por favor verifique los campos marcados en rojo.`;
            alerta.classList.remove('d-none');
        }
    });
}

/**
 * Abre el modal de detalle del producto con sus datos completos.
 * @param {string} codigo - Código del producto a consultar.
 */
function abrirModalProducto(codigo) {
    const modalEl = document.getElementById('modalMostrarProducto');
    if (!modalEl) return;

    const productos = obtenerProductos();
    const p = productos.find(item => item.codigo.toUpperCase() === codigo.trim().toUpperCase());
    if (!p) return;

    const imgEl = document.getElementById('modal-prod-img');
    const codigoEl = document.getElementById('modal-prod-codigo');
    const catEl = document.getElementById('modal-prod-categoria');
    const nombreEl = document.getElementById('modal-prod-nombre');
    const descEl = document.getElementById('modal-prod-desc');
    const precioEl = document.getElementById('modal-prod-precio');
    const stockEl = document.getElementById('modal-prod-stock');
    const criticoEl = document.getElementById('modal-prod-critico');
    const alertaEl = document.getElementById('modal-prod-alerta');
    const btnEditar = document.getElementById('modal-prod-btn-editar');

    const esCritico = p.stock <= (p.stockCritico || 0);

    if (imgEl) {
        imgEl.src = obtenerRutaImagenAdmin(p.imagen);
        imgEl.alt = p.nombre;
    }
    if (codigoEl) codigoEl.textContent = p.codigo;
    if (catEl) catEl.textContent = p.categoria || 'Pastelería';
    if (nombreEl) nombreEl.textContent = p.nombre;
    if (descEl) descEl.textContent = p.descripcion || 'Sin descripción disponible para este producto.';
    if (precioEl) precioEl.textContent = '$' + p.precio.toLocaleString('es-CL');
    if (stockEl) {
        stockEl.textContent = p.stock;
        stockEl.className = 'fw-bold fs-5 ' + (esCritico ? 'text-danger' : 'text-success');
    }
    if (criticoEl) criticoEl.textContent = p.stockCritico || 0;

    if (alertaEl) {
        if (esCritico) {
            alertaEl.className = 'alert alert-danger py-2 px-3 mb-0 small d-flex align-items-center';
            alertaEl.innerHTML = `<i class="ti ti-alert-triangle me-2 fs-5"></i> <span><strong>¡Stock Crítico!</strong> Quedan solo ${p.stock} unidad(es) en inventario.</span>`;
        } else {
            alertaEl.className = 'alert alert-success py-2 px-3 mb-0 small d-flex align-items-center';
            alertaEl.innerHTML = `<i class="ti ti-circle-check me-2 fs-5"></i> <span>Nivel de stock óptimo (${p.stock} disponibles).</span>`;
        }
    }

    if (btnEditar) {
        btnEditar.href = `producto-form.html?codigo=${p.codigo}`;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

function renderizarTablaProductosAdmin() {
    const tbody = document.getElementById('tabla-productos-body');
    if (!tbody) return;

    const buscador = document.getElementById('buscador-productos');
    const conteoEl = document.getElementById('conteo-productos');

    //Toma todos los productos y busca si el texto ingresado coincide con codigo nombre o categoría
    function pintarFilas(filtro = '') {
        const productos = obtenerProductos();
        const textoFiltro = filtro.toLowerCase().trim();
        const filtrados = productos.filter(p => 
            p.nombre.toLowerCase().includes(textoFiltro) ||
            p.codigo.toLowerCase().includes(textoFiltro) ||
            (p.categoria && p.categoria.toLowerCase().includes(textoFiltro))
        );
        //Vacia la tabla para evitar duplicados
        tbody.innerHTML = '';

        if (filtrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted"><i class="ti ti-alert-circle me-1"></i> No se encontraron productos que coincidan</td></tr>`;
        } else {
            //Para cada producto crea una fila con sus datos

            filtrados.forEach(p => {
                const esCritico = p.stock <= (p.stockCritico || 0); //Si el stock es critico agrega badge
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-bold font-monospace">${p.codigo}</td>
                    <td><img src="${obtenerRutaImagenAdmin(p.imagen)}" alt="${p.nombre}" class="avatar-producto"></td>
                    <td>
                        <div class="d-flex flex-column text-end">
                            <span class="fw-bold">${p.nombre}</span>
                            <small class="text-muted mt-1">${p.descripcion || ''}</small>
                        </div>
                    </td>
                    <td><span class="badge-soft-primary">${p.categoria || 'Pastelería'}</span></td>
                    <td class="fw-bold">$${p.precio.toLocaleString('es-CL')}</td>
                    <td><span class="fw-bold ${esCritico ? 'text-danger' : ''}">${p.stock}</span></td>
                    <td>
                        ${esCritico 
                            ? `<span class="badge-soft-danger"><i class="ti ti-alert-triangle me-1"></i> Crítico (Min: ${p.stockCritico || 0})</span>` 
                            : `<span class="badge-soft-success">Normal</span>`} 
                    </td>
                    <td class="text-end">
                        <div class="d-inline-flex gap-2">
                            <button type="button" class="btn btn-outline-info btn-sm btn-ver-producto" data-codigo="${p.codigo}"><i class="ti ti-eye"></i> Ver</button>
                            <a href="producto-form.html?codigo=${p.codigo}" class="btn btn-outline-pasteleria btn-sm solo-admin"><i class="ti ti-edit"></i> Editar</a> 
                            <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-producto solo-admin" data-codigo="${p.codigo}"><i class="ti ti-trash"></i> Eliminar</button>
                        </div>
                    </td>
                `; //Arriba, editar y eliminar tienen la clase SOLO ADMIN para cumplir con la visibilidad de los roles
                tbody.appendChild(tr);
            });
        }
        //Cuenta los elementos para mostrar la cantidad actual en vivo
        if (conteoEl) {
            conteoEl.textContent = `Mostrando ${filtrados.length} de ${productos.length} productos`;
        }

        //Oculta lo de solo admin
        aplicarPermisosRol();
        if (window.adaptarTablasMovil) window.adaptarTablasMovil();
    }

    pintarFilas();
    //Cada vez que se escribe se vuelve a llamar la funcion pintarFilas para filtrar
    if (buscador) {
        buscador.addEventListener('input', (e) => {
            pintarFilas(e.target.value);
        });
    }

    // Delegación de clic para botones Ver Producto, abre el modal con los detalles
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ver-producto');
        if (btn) {
            const cod = btn.getAttribute('data-codigo');
            if (cod) abrirModalProducto(cod);
        }
    });

    // Delegación de clic para botones Eliminar Producto
    var codigoAEliminar = null;

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-eliminar-producto');
        if (btn) {
            const cod = btn.getAttribute('data-codigo');
            if (!cod) return;
            //Para asegurarse de que realmente se quiera borrar, primero se guarda el codigo en una variable temporal
            codigoAEliminar = cod;
            const prods = obtenerProductos();
            const prod = prods.find(p => p.codigo.toUpperCase() === cod.toUpperCase());
            const nombre = prod ? prod.nombre : cod;

            const modalEl = document.getElementById('modalConfirmarEliminar');
            const tituloEl = document.getElementById('modal-eliminar-titulo');
            const mensajeEl = document.getElementById('modal-eliminar-mensaje');
            //Se muestra el producto a eliminar
            if (tituloEl) tituloEl.textContent = '¿Eliminar producto?';
            if (mensajeEl) mensajeEl.innerHTML = `¿Estás seguro de que deseas eliminar permanentemente <strong>${nombre}</strong> (<code>${cod}</code>)? Esta acción no se puede deshacer.`;

            if (modalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show();
            }
        }
    });
    //Si se pulsa, se elimina de localStorage
    const btnConfirmar = document.getElementById('btn-confirmar-eliminar-definitivo');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            if (!codigoAEliminar) return;
            eliminarProducto(codigoAEliminar);
            codigoAEliminar = null;

            const modalEl = document.getElementById('modalConfirmarEliminar');
            if (modalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                //cierra el modal
                modal.hide();
            }
            //pintarFilas refresca la tabla en vez de recargar toda la pagina
            pintarFilas(buscador ? buscador.value : '');
        });
    }
}

// Inicializar en DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    inicializarProductosDB();
    inicializarFormularioProducto();
    renderizarTablaProductosAdmin();
});

