/**
 * main.js — Papita Dulce
 * ------------------------------------------------------------------
 * Este archivo tiene toda la lógica del sitio principal (la página
 * que ve el cliente): animaciones al hacer scroll, la barra de
 * búsqueda, el menú de productos con sus filtros, el popup con el
 * detalle de cada producto, el carrito de compras, el checkout
 * (pago) por pasos, el panel de "Mi cuenta", la galería de fotos,
 * el contador de reserva, el testimonio (Swiper) y el newsletter.
 *
 * Todo el "carrito" y los "pedidos" se guardan en localStorage
 * (la memoria del navegador), no hay una base de datos real detrás.
 * Por eso, si el usuario borra los datos del navegador, pierde el
 * carrito y su historial de pedidos.
 *
 * El módulo de inicio de sesión / registro vive aparte, en auth.js.
 */

// Inicializa la librería AOS ("Animate On Scroll"), que es la que
// hace aparecer los elementos con animación cuando bajamos la página.
AOS.init({
    duration: 680, // duración de la animación en milisegundos
    once: true,    // la animación ocurre una sola vez (no se repite al subir/bajar)
    offset: 55     // píxeles antes de que el elemento entre en pantalla para dispararla
});

/* NAVBAR SCROLL & ACTIVE LINK  */
// Cada vez que el usuario hace scroll:
// 1) le agregamos la clase "scrolled" a la navbar para que cambie de estilo,
// 2) mostramos el botón "volver arriba" (btt) si ya bajó bastante,
// 3) recorremos cada sección de la página para saber en cuál estamos parados
//    y así marcar el link correspondiente del menú como "activo".
window.addEventListener('scroll', function() {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
    document.getElementById('btt').classList.toggle('show', window.scrollY > 300);
    document.querySelectorAll('section[id]').forEach(function(sec) {
        var top = sec.offsetTop - 110,
            bot = top + sec.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bot) {
            document.querySelectorAll('.nav-link').forEach(function(l) {
                l.classList.remove('active');
            });
            var lnk = document.querySelector('.nav-link[href="#' + sec.id + '"]');
            if (lnk) lnk.classList.add('active');
        }
    });
});

/*  SMOOTH SCROLL + MOBILE NAV CLOSE  */
// Todos los links que empiezan con "#" (anclas internas, ej: "#menu")
// hacen scroll suave hacia esa sección en vez de saltar de golpe.
// Si el link venía del menú hamburguesa en celular, además lo cerramos.
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var t = document.querySelector(href);
        if (t) {
            e.preventDefault();
            if (this.getAttribute('data-menu-action') === 'show-all') {
                filterMenu('all');
            }
            // Close Bootstrap mobile navbar if open
            var navCollapse = document.getElementById('navmenu');
            if (navCollapse && navCollapse.classList.contains('show')) {
                var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                } else {
                    navCollapse.classList.remove('show');
                }
            }
            // Scroll after slight delay to let navbar close
            setTimeout(function() {
                window.scrollTo({
                    top: t.offsetTop - 78,
                    behavior: 'smooth'
                });
            }, 50);
        }
    });
});


/* ===================== BUSCADOR (overlay de pantalla completa) ===================== */
var searchOv = document.getElementById('searchOv'); // el fondo/overlay del buscador

// Al hacer clic en la lupa de la navbar, se abre el buscador y se bloquea
// el scroll del body (para que no se pueda seguir navegando la página de fondo).
document.getElementById('navSearchBtn').addEventListener('click', function() {
    searchOv.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function() {
        document.getElementById('searchInput').focus();
    }, 220);
});

document.getElementById('searchClose').addEventListener('click', closeSearch);

// Close when clicking backdrop
searchOv.addEventListener('click', function(e) {
    if (e.target === searchOv) closeSearch();
});

// Cierra el buscador y devuelve el scroll normal a la página.
function closeSearch() {
    searchOv.classList.remove('open');
    document.body.style.overflow = '';
}

// Category buttons inside search box
document.querySelectorAll('.sovcat').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sovcat').forEach(function(b) {
            b.classList.remove('active');
        });
        this.classList.add('active');
        var f = this.getAttribute('data-cat');
        closeSearch();
        setTimeout(function() {
            filterMenu(f);
            document.getElementById('menu').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    });
});

// Trending tags fill the search input
document.querySelectorAll('.sovtrend .ttag').forEach(function(t) {
    t.addEventListener('click', function() {
        document.getElementById('searchInput').value = this.textContent.trim();
        document.getElementById('searchInput').focus();
    });
});

/**
 * Filtra las tarjetas del menú según lo que el usuario escribió en el buscador.
 * Busca coincidencias en el título, la categoría, la descripción y las
 * etiquetas (tags) del producto. Si el texto viene vacío, muestra todo.
 */
function searchMenu(query) {
    var normalized = String(query || '').trim().toLowerCase();
    document.querySelectorAll('.mwrap').forEach(function(wrapper) {
        var card = wrapper.querySelector('.mcard');
        // Juntamos todos los datos del producto en un solo texto para buscar
        var searchable = card ? [
            card.getAttribute('data-title'),
            card.getAttribute('data-cat'),
            card.getAttribute('data-desc'),
            card.getAttribute('data-tags')
        ].join(' ').toLowerCase() : '';
        var matches = !normalized || searchable.indexOf(normalized) !== -1;
        // La clase "gone" oculta la tarjeta con CSS cuando no coincide
        wrapper.classList.toggle('gone', !matches);
    });
}

document.getElementById('searchSubmit').addEventListener('click', function() {
    searchMenu(document.getElementById('searchInput').value);
    closeSearch();
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('searchSubmit').click();
});


// Configura la librería Magnific Popup (usa jQuery) para que las imágenes
// con la clase "magnific_popup" se abran en grande, tipo lightbox.
$(document).ready(function() {
    $('.magnific_popup').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,
        fixedContentPos: false,
        disableOn: 300,
        image: {
            verticalFit: true
        }
    });
});


/* ===================== MENÚ: FILTROS POR CATEGORÍA ===================== */
/**
 * Muestra solo los productos de la categoría indicada (por ejemplo "postres")
 * y deja el resto ocultos. Si "cat" es "all" (o "todo"), muestra todos.
 * También se encarga de dejar "activo" el botón de filtro y la tarjeta de
 * categoría que corresponda, para que el usuario vea en qué filtro está parado.
 */
function filterMenu(cat) {
    var normalized = String(cat || 'all').trim().toLowerCase();
    if (normalized === 'todo') normalized = 'all';

    // sync filter buttons
    document.querySelectorAll('.filtbtn').forEach(function(b) {
        var value = (b.getAttribute('data-f') || '').trim().toLowerCase();
        var isAll = normalized === 'all' && (value === 'all' || value === 'todo');
        b.classList.toggle('active', value === normalized || isAll);
    });

    // sync category cards
    document.querySelectorAll('.catcard').forEach(function(c) {
        var value = (c.getAttribute('data-filter') || '').trim().toLowerCase();
        var isAll = normalized === 'all' && (value === 'all' || value === 'todo');
        c.classList.toggle('active', value === normalized || isAll);
    });

    // show/hide menu cards
    document.querySelectorAll('.mwrap').forEach(function(w) {
        var c = (w.getAttribute('data-c') || '').trim().toLowerCase();
        if (normalized === 'all' || c === normalized) {
            w.classList.remove('gone');
            w.style.opacity = '0';
            w.style.transform = 'translateY(16px)';
            setTimeout(function() {
                w.style.transition = 'opacity .38s,transform .38s';
                w.style.opacity = '1';
                w.style.transform = 'translateY(0)';
            }, 60);
        } else {
            w.classList.add('gone');
        }
    });
}

// Filter buttons
document.querySelectorAll('.filtbtn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        filterMenu(this.getAttribute('data-f'));
    });
});

// Category section cards → scroll + filter
document.querySelectorAll('.catcard').forEach(function(card) {
    card.addEventListener('click', function() {
        var f = this.getAttribute('data-filter');
        window.scrollTo({
            top: document.getElementById('menu').offsetTop - 80,
            behavior: 'smooth'
        });
        setTimeout(function() {
            filterMenu(f);
        }, 480);
    });
});

var menuPop = document.getElementById('menuPop');
var mpQty = 1;
var activeMenuCard = null;
var cartItems = [];
try {
    var storedCart = JSON.parse(localStorage.getItem('papitaCart') || '[]');
    if (Array.isArray(storedCart)) cartItems = storedCart.filter(function(item) {
        return item && item.id && item.title && Number(item.price) >= 0 && Number(item.quantity) > 0;
    });
} catch (error) {
    localStorage.removeItem('papitaCart');
}

/* ===================== POPUP DE DETALLE DE PRODUCTO ===================== */
/* Cuando el producto es una torta o tartaleta, se puede elegir entre
   "torta completa" o "trozo". Estas funciones calculan y guardan los
   datos de cada variante (precio, descripción, etc.) en los botones. */

// Vuelca todos los datos (precio, imagen, descripción, etc.) dentro de
// los atributos "data-*" del botón de variante, y pone el texto visible.
function setVariantData(button, data) {
    Object.keys(data).forEach(function(key) {
        button.setAttribute('data-' + key, data[key]);
    });
    button.textContent = data.label;
}

/**
 * Genera automáticamente los datos del botón "Trozo" a partir del
 * producto completo: el precio del trozo es aprox. un 20% del precio
 * de la torta completa (con un mínimo de $500), las calorías se
 * calculan como 1/4 y el tiempo de preparación como el 40% del original.
 * Si el producto ya trae variantes especiales definidas a mano
 * (data-special-variants="true"), no se sobreescribe nada.
 */
function configureProductVariants(card, variants) {
    if (card.getAttribute('data-special-variants') === 'true') return;

    var fullButton = variants.querySelector('.mvariant:first-of-type');
    var sliceButton = variants.querySelector('.mvariant:nth-of-type(2)');
    var basePrice = parseInt((card.getAttribute('data-price') || '$0').replace(/[^0-9]/g, ''), 10) || 0;
    var oldPrice = parseInt((card.getAttribute('data-old') || '').replace(/[^0-9]/g, ''), 10) || 0;
    var slicePrice = Math.max(500, Math.round(basePrice * 0.2 / 100) * 100);
    var sliceOldPrice = oldPrice ? Math.round(oldPrice * 0.2 / 100) * 100 : 0;
    var baseTitle = card.getAttribute('data-variant-full-title') || card.getAttribute('data-title');
    var baseImage = card.getAttribute('data-variant-full-img') || card.getAttribute('data-img');
    var baseDesc = card.getAttribute('data-variant-full-desc') || card.getAttribute('data-desc');
    var baseTags = card.getAttribute('data-variant-full-tags') || card.getAttribute('data-tags') || '';
    var baseCal = card.getAttribute('data-variant-full-cal') || card.getAttribute('data-cal');
    var baseTime = card.getAttribute('data-variant-full-time') || card.getAttribute('data-time');
    var baseRating = card.getAttribute('data-variant-full-rating') || card.getAttribute('data-rating');
    var baseReviews = card.getAttribute('data-variant-full-reviews') || card.getAttribute('data-reviews');

    card.setAttribute('data-variant-full-title', baseTitle);
    card.setAttribute('data-variant-full-img', baseImage);
    card.setAttribute('data-variant-full-desc', baseDesc);
    card.setAttribute('data-variant-full-tags', baseTags);
    card.setAttribute('data-variant-full-cal', baseCal);
    card.setAttribute('data-variant-full-time', baseTime);
    card.setAttribute('data-variant-full-rating', baseRating);
    card.setAttribute('data-variant-full-reviews', baseReviews);

    setVariantData(fullButton, {
        label: 'Torta completa',
        img: baseImage,
        title: baseTitle,
        price: card.getAttribute('data-price'),
        old: card.getAttribute('data-old') || '',
        desc: baseDesc,
        tags: baseTags,
        cal: baseCal,
        time: baseTime,
        rating: baseRating,
        reviews: baseReviews
    });
    setVariantData(sliceButton, {
        label: 'Trozo',
        img: baseImage,
        title: 'Trozo de ' + baseTitle,
        price: formatPrice(slicePrice),
        old: sliceOldPrice ? formatPrice(sliceOldPrice) : '',
        desc: 'Porción individual de ' + baseDesc,
        tags: baseTags + ',Porción',
        cal: Math.max(80, Math.round(parseInt(baseCal, 10) * 0.25)),
        time: Math.max(5, Math.round(parseInt(baseTime, 10) * 0.4)),
        rating: baseRating,
        reviews: Math.max(1, Math.round(parseInt(baseReviews, 10) * 0.55))
    });
}

/**
 * Abre el popup con el detalle de un producto (imagen, precio, estrellas,
 * calorías, tiempo de preparación, tags, etc.), tomando todos esos datos
 * desde los atributos "data-*" que tiene la tarjeta del producto en el HTML.
 */
function openMenuPop(card) {
    activeMenuCard = card; // guardamos referencia: la usamos al "Añadir al carrito"
    var img = card.getAttribute('data-img');
    var title = card.getAttribute('data-title');
    var cat = card.getAttribute('data-cat');
    var price = card.getAttribute('data-price');
    var old = card.getAttribute('data-old');
    var rating = parseFloat(card.getAttribute('data-rating'));
    var reviews = card.getAttribute('data-reviews');
    var cal = card.getAttribute('data-cal');
    var time = card.getAttribute('data-time');
    var desc = card.getAttribute('data-desc');
    var tags = card.getAttribute('data-tags') || '';

    document.getElementById('mpImg').setAttribute('src', img);
    document.getElementById('mpCat').textContent = cat;
    document.getElementById('mpTitle').textContent = title;

    var full = Math.round(rating),
        empty = 5 - full;
    document.getElementById('mpStars').innerHTML =
        '<i class="fas fa-star"></i>'.repeat(full) + '☆'.repeat(empty) +
        ' <span style="color:#bbb;font-size:.78rem;">' + rating + ' (' + reviews + ' reseñas)</span>';

    document.getElementById('mpDesc').textContent = desc;

    var variants = document.getElementById('mpVariants');
    var variantCategory = ['tortas', 'tartaletas'].indexOf(cat.trim().toLowerCase()) !== -1;
    variants.style.display = card.getAttribute('data-has-variants') === 'true' || variantCategory ? 'flex' : 'none';
    if (variantCategory) configureProductVariants(card, variants);
    variants.querySelectorAll('.mvariant').forEach(function(option) {
        option.classList.toggle('active', option.getAttribute('data-title') === title);
    });

    document.getElementById('mpPrice').innerHTML =
        price + (old ? '<small style="color:#ccc;text-decoration:line-through;margin-left:8px;font-size:1rem;">' + old + '</small>' : '');

    document.getElementById('mpMeta').innerHTML =
        '<div class="mpm"><div class="mpmv">' + cal + ' kcal</div><div class="mpml">Calorías</div></div>' +
        '<div class="mpm"><div class="mpmv">' + time + ' min</div><div class="mpml">Preparación</div></div>' +
        '<div class="mpm"><div class="mpmv">' + rating + '/5</div><div class="mpml">Valoración</div></div>';

    document.getElementById('mpTags').innerHTML =
        tags.split(',').filter(Boolean).map(function(t) {
            return '<span class="mptag">' + t.trim() + '</span>';
        }).join('');

    mpQty = 1;
    document.getElementById('mpQnum').textContent = 1;
    document.getElementById('mpAddCart').innerHTML = '<i class="fas fa-shopping-cart"></i> Añadir al carrito';
    document.getElementById('mpAddCart').style.background = '';

    menuPop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Al hacer clic en "Torta completa" o "Trozo" dentro del popup, actualizamos
// tanto la tarjeta del producto (para que el carrito use el precio correcto)
// como lo que se ve en pantalla (imagen, título, precio, estrellas).
document.querySelectorAll('#mpVariants .mvariant').forEach(function(button) {
    button.addEventListener('click', function(e) {
        e.stopPropagation(); // evita que el clic cierre el popup o abra otra cosa
        var card = activeMenuCard;
        var image = document.getElementById('mpImg');
        var title = this.getAttribute('data-title');
        var rating = parseFloat(this.getAttribute('data-rating'));
        var reviews = this.getAttribute('data-reviews');
        var full = Math.round(rating);

        card.setAttribute('data-img', this.getAttribute('data-img'));
        card.setAttribute('data-title', title);
        card.setAttribute('data-price', this.getAttribute('data-price'));
        card.setAttribute('data-old', this.getAttribute('data-old'));
        card.setAttribute('data-desc', this.getAttribute('data-desc'));
        card.setAttribute('data-tags', this.getAttribute('data-tags'));
        card.setAttribute('data-cal', this.getAttribute('data-cal'));
        card.setAttribute('data-time', this.getAttribute('data-time'));
        card.setAttribute('data-rating', this.getAttribute('data-rating'));
        card.setAttribute('data-reviews', reviews);

        image.src = this.getAttribute('data-img');
        image.alt = title;
        document.getElementById('mpTitle').textContent = title;
        document.getElementById('mpDesc').textContent = this.getAttribute('data-desc');
        document.getElementById('mpPrice').innerHTML = this.getAttribute('data-price') +
            '<small style="color:#ccc;text-decoration:line-through;margin-left:8px;font-size:1rem;">' + this.getAttribute('data-old') + '</small>';
        document.getElementById('mpStars').innerHTML =
            '<i class="fas fa-star"></i>'.repeat(full) +
            ' <span style="color:#bbb;font-size:.78rem;">' + rating + ' (' + reviews + ' reseñas)</span>';

        document.getElementById('mpVariants').querySelectorAll('.mvariant').forEach(function(option) {
            option.classList.toggle('active', option === button);
        });
    });
});

// Card click open popup
document.querySelectorAll('.mcard').forEach(function(card) {
    card.addEventListener('click', function() {
        openMenuPop(this);
    });
});

// Heart toggle (no popup)
document.querySelectorAll('.mhrt').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var ico = this.querySelector('i');
        ico.classList.toggle('far');
        ico.classList.toggle('fas');
        this.style.color = ico.classList.contains('fas') ? 'var(--primary)' : '#ccc';
    });
});

// Close popup
document.getElementById('mpClose').addEventListener('click', closeMenuPop);
menuPop.addEventListener('click', function(e) {
    if (e.target === this) closeMenuPop();
});

// Cierra el popup de detalle del producto.
function closeMenuPop() {
    menuPop.classList.remove('open');
    document.body.style.overflow = '';
}

// Qty +/- (botones para subir o bajar la cantidad dentro del popup)
document.getElementById('mpPlus').addEventListener('click', function() {
    document.getElementById('mpQnum').textContent = ++mpQty;
});
document.getElementById('mpMinus').addEventListener('click', function() {
    if (mpQty > 1) document.getElementById('mpQnum').textContent = --mpQty; // nunca menos de 1
});

// Da formato de precio chileno, ej: 3200 -> "$3.200"
function formatPrice(value) {
    return '$' + Number(value).toLocaleString('es-CL');
}

// Construye el objeto "ítem de carrito" a partir de la tarjeta del producto.
// El "id" combina imagen + título para poder identificar si ya existe ese
// mismo producto (y variante) dentro del carrito.
function getCartItem(card) {
    var price = (card.getAttribute('data-price') || '$0').replace(/[^0-9]/g, ''); // deja solo números
    return {
        id: card.getAttribute('data-img') + '|' + card.getAttribute('data-title'),
        img: card.getAttribute('data-img'),
        title: card.getAttribute('data-title'),
        price: parseInt(price, 10) || 0,
        quantity: mpQty
    };
}

/**
 * Agrega un producto al carrito. Si ese mismo producto ya estaba
 * agregado, en vez de duplicarlo suma la cantidad al ítem existente.
 * Al final guarda el carrito en localStorage y vuelve a dibujarlo.
 */
function addItemToCart(card, quantity) {
    var previousQty = mpQty;
    mpQty = quantity;
    var newItem = getCartItem(card);
    mpQty = previousQty;
    var existing = cartItems.find(function(item) {
        return item.id === newItem.id;
    });
    if (existing) {
        existing.quantity += newItem.quantity;
    } else {
        cartItems.push(newItem);
    }
    document.querySelector('#cartEmpty p').textContent = 'Tu carrito está vacío.';
    document.getElementById('cartNotice').textContent = '';
    document.getElementById('cartCheckout').style.display = '';
    document.getElementById('cartClear').style.display = '';
    saveCart();
    renderCart();
}

// Guarda el arreglo "cartItems" (el carrito completo) en localStorage,
// para que no se pierda si el usuario recarga la página.
function saveCart() {
    localStorage.setItem('papitaCart', JSON.stringify(cartItems));
}

// Suma la cantidad de todos los productos del carrito y actualiza el
// número rojo (badge) que se ve sobre el ícono del carrito.
function updateCartCount() {
    var count = cartItems.reduce(function(total, item) {
        return total + item.quantity;
    }, 0);
    document.getElementById('cartCount').textContent = count;
}

/**
 * Vuelve a dibujar el panel del carrito completo: la lista de productos
 * con sus botones de +/- y eliminar, el subtotal, y muestra u oculta
 * el mensaje de "carrito vacío" según corresponda.
 */
function renderCart() {
    var items = document.getElementById('cartItems');
    var empty = document.getElementById('cartEmpty');
    var foot = document.getElementById('cartFoot');
    var subtotal = cartItems.reduce(function(total, item) {
        return total + item.price * item.quantity;
    }, 0);

    items.innerHTML = cartItems.map(function(item, index) {
        return '<div class="cartitem">' +
            '<img src="' + item.img + '" alt="' + item.title + '">' +
            '<div><h5>' + item.title + '</h5>' +
            '<div class="cartitem-price">' + formatPrice(item.price) + '</div>' +
            '<div class="cartqty">' +
            '<button type="button" data-cart-action="decrease" data-cart-index="' + index + '" aria-label="Disminuir cantidad">-</button>' +
            '<span>' + item.quantity + '</span>' +
            '<button type="button" data-cart-action="increase" data-cart-index="' + index + '" aria-label="Aumentar cantidad">+</button>' +
            '</div></div>' +
            '<button class="cartremove" type="button" data-cart-action="remove" data-cart-index="' + index + '" aria-label="Eliminar ' + item.title + '"><i class="fas fa-trash-alt"></i></button>' +
            '</div>';
    }).join('');

    empty.classList.toggle('show', cartItems.length === 0);
    foot.style.display = cartItems.length ? 'block' : 'none';
    document.getElementById('cartSummary').textContent = cartItems.length ?
        cartItems.reduce(function(total, item) { return total + item.quantity; }, 0) + ' producto(s) en tu pedido' : '';
    document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
    updateCartCount();
}

// Genera el resumen del pedido (lista "2 x Torta ... $6.400") que se
// muestra en el paso de pago, a partir de los ítems del carrito.
function buildOrderSummary(items) {
    return items.map(function(item) {
        return '<div><strong>' + item.quantity + ' x</strong> ' + item.title + ' <span>' + formatPrice(item.price * item.quantity) + '</span></div>';
    }).join('');
}

// Abre el panel lateral del carrito (y lo redibuja por si cambió algo).
function openCart() {
    renderCart();
    document.getElementById('cartPanel').classList.add('open');
    document.getElementById('cartPanel').setAttribute('aria-hidden', 'false');
    document.getElementById('cartToggle').setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

// Cierra el panel lateral del carrito.
function closeCart() {
    document.getElementById('cartPanel').classList.remove('open');
    document.getElementById('cartPanel').setAttribute('aria-hidden', 'true');
    document.getElementById('cartToggle').setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartPanel').addEventListener('click', function(e) {
    if (e.target === this) closeCart();
});
document.getElementById('cartContinue').addEventListener('click', function() {
    closeCart();
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('cartItems').addEventListener('click', function(e) {
    var button = e.target.closest('[data-cart-action]');
    if (!button) return;
    var index = parseInt(button.getAttribute('data-cart-index'), 10);
    var action = button.getAttribute('data-cart-action');
    if (action === 'increase') cartItems[index].quantity += 1;
    if (action === 'decrease') cartItems[index].quantity -= 1;
    if (action === 'remove' || cartItems[index].quantity < 1) cartItems.splice(index, 1);
    saveCart();
    renderCart();
});
document.getElementById('cartClear').addEventListener('click', function() {
    cartItems = [];
    saveCart();
    renderCart();
});
/* ============================================================
   CHECKOUT: entrega, método de pago y confirmación (por pasos)
   ============================================================ */
var deliveryMethod = 'retiro';   // 'retiro' (en tienda) o 'despacho' (a domicilio)
var paymentMethod = 'tarjeta';   // 'tarjeta', 'transferencia' o 'efectivo'
var currentCheckoutStep = 1;     // paso actual del wizard: 1, 2 o 3

// Texto de ayuda que se muestra en el paso 3 según el método de pago elegido
var metodoHints = {
    tarjeta: 'Completa los datos de tu tarjeta.',
    transferencia: 'Realiza la transferencia y confírmala aquí.',
    efectivo: 'Revisa el monto a pagar en efectivo.'
};

// Muestra el panel del paso indicado (1, 2 o 3) y oculta los demás,
// además de marcar en el indicador de pasos cuáles ya se completaron.
function goToCheckoutStep(step) {
    currentCheckoutStep = step;
    document.querySelectorAll('.checkout-panel').forEach(function(panel) {
        panel.classList.toggle('active', parseInt(panel.getAttribute('data-step-panel'), 10) === step);
    });
    document.querySelectorAll('.checkout-step').forEach(function(item) {
        var n = parseInt(item.getAttribute('data-step'), 10);
        item.classList.toggle('active', n === step);
        item.classList.toggle('done', n < step);
    });
    var form = document.getElementById('paymentForm');
    if (form) form.scrollTop = 0;
    if (step === 1) document.getElementById('payName').focus();
}

// Deja el wizard de pago en su estado inicial: método "tarjeta"
// seleccionado y de vuelta en el paso 1.
function resetCheckoutWizard() {
    paymentMethod = 'tarjeta';
    document.querySelectorAll('.payment-method-card').forEach(function(c) {
        c.classList.toggle('active', c.getAttribute('data-method') === 'tarjeta');
    });
    document.getElementById('panelTarjeta').style.display = 'block';
    document.getElementById('panelTransferencia').style.display = 'none';
    document.getElementById('panelEfectivo').style.display = 'none';
    document.getElementById('stepDetalleHint').textContent = metodoHints.tarjeta;
    document.getElementById('paymentError').textContent = '';
    goToCheckoutStep(1);
}

// Botón "Ir a pagar" del carrito: prepara el resumen del pedido,
// reinicia el wizard y abre el panel de pago (cerrando antes el carrito).
document.getElementById('cartCheckout').addEventListener('click', function() {
    if (!cartItems.length) return; // no se puede pagar un carrito vacío
    var subtotalText = document.getElementById('cartSubtotal').textContent;
    document.getElementById('paymentTotal').textContent = subtotalText;
    document.getElementById('cashAmountHint').textContent = subtotalText;
    document.getElementById('paymentOrderSummary').innerHTML = '<strong>Detalle de tu compra</strong>' + buildOrderSummary(cartItems);
    document.getElementById('paymentSuccess').style.display = 'none';
    resetCheckoutWizard();

    // Autocompleta los datos si el cliente ya inició sesión
    if (window.PapitaAuth) {
        var usuario = window.PapitaAuth.obtenerUsuarioActual();
        if (usuario) window.prellenarDatosCliente(usuario);
    }

    closeCart();
    document.getElementById('paymentPanel').classList.add('open');
    document.getElementById('paymentPanel').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('payName').focus();
});
document.getElementById('paymentBack').addEventListener('click', function() {
    document.getElementById('paymentPanel').classList.remove('open');
    document.getElementById('paymentPanel').setAttribute('aria-hidden', 'true');
    openCart();
});

// Valida los campos del paso 1 (nombre, correo, teléfono y, si el
// método de entrega es "despacho", también la dirección) antes de avanzar.
function validarPasoDatos() {
    var error = document.getElementById('paymentError');
    var name = document.getElementById('payName').value.trim();
    var email = document.getElementById('payEmail').value.trim();
    var phone = document.getElementById('payPhone').value.trim();
    var address = document.getElementById('payAddress').value.trim();

    if (name.length < 3) { alertPasoDatos('Ingresa tu nombre completo.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alertPasoDatos('Ingresa un correo electrónico válido.'); return false; }
    if (!/^[+0-9 ]{8,15}$/.test(phone)) { alertPasoDatos('Ingresa un teléfono de contacto válido.'); return false; }
    if (deliveryMethod === 'despacho' && address.length < 5) { alertPasoDatos('Ingresa la dirección de despacho.'); return false; }
    return true;
}
// Muestra un mensaje de error en rojo bajo el paso 1, y lo vuelve
// a la ayuda normal después de unos segundos.
function alertPasoDatos(mensaje) {
    var hint = document.querySelector('[data-step-panel="1"] .paymenthint');
    hint.textContent = mensaje;
    hint.style.color = 'var(--primary)';
    setTimeout(function() {
        hint.textContent = 'Datos de contacto para tu pedido.';
        hint.style.color = '';
    }, 2600);
}

// Botones "Continuar" / "Atrás" del wizard
document.querySelectorAll('.step-next').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var destino = parseInt(this.getAttribute('data-goto'), 10);
        if (currentCheckoutStep === 1 && !validarPasoDatos()) return;
        goToCheckoutStep(destino);
    });
});
document.querySelectorAll('.step-prev').forEach(function(btn) {
    btn.addEventListener('click', function() {
        goToCheckoutStep(parseInt(this.getAttribute('data-goto'), 10));
    });
});

// Selector de método de entrega
document.querySelectorAll('.delivery-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
        deliveryMethod = this.getAttribute('data-delivery');
        document.querySelectorAll('.delivery-tab').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        var addressBox = document.getElementById('deliveryAddressBox');
        var addressInput = document.getElementById('payAddress');
        addressBox.style.display = deliveryMethod === 'despacho' ? 'block' : 'none';
        addressInput.required = deliveryMethod === 'despacho';
    });
});

// Selector de método de pago (paso 2): al elegir, se avanza directo al paso 3
document.querySelectorAll('.payment-method-card').forEach(function(card) {
    card.addEventListener('click', function() {
        paymentMethod = this.getAttribute('data-method');
        document.querySelectorAll('.payment-method-card').forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
        document.getElementById('panelTarjeta').style.display = paymentMethod === 'tarjeta' ? 'block' : 'none';
        document.getElementById('panelTransferencia').style.display = paymentMethod === 'transferencia' ? 'block' : 'none';
        document.getElementById('panelEfectivo').style.display = paymentMethod === 'efectivo' ? 'block' : 'none';
        document.getElementById('stepDetalleHint').textContent = metodoHints[paymentMethod];
        document.getElementById('paymentError').textContent = '';
        var cardRequired = paymentMethod === 'tarjeta';
        document.getElementById('payCard').required = cardRequired;
        document.getElementById('payExpiry').required = cardRequired;
        document.getElementById('payCvv').required = cardRequired;
        goToCheckoutStep(3);
    });
});

// Validación tipo Luhn para el número de tarjeta (detecta errores de digitación típicos).
// Recorre los dígitos de derecha a izquierda, duplica uno de cada dos y,
// si el número final es múltiplo de 10, la tarjeta "pasa" la validación.
function pasaLuhn(numero) {
    var suma = 0, alternar = false;
    for (var i = numero.length - 1; i >= 0; i--) {
        var digito = parseInt(numero.charAt(i), 10);
        if (alternar) {
            digito *= 2;
            if (digito > 9) digito -= 9;
        }
        suma += digito;
        alternar = !alternar;
    }
    return suma % 10 === 0;
}

// Revisa si la fecha de vencimiento (formato "MM/AA") ya pasó.
function tarjetaVencida(expiry) {
    var partes = expiry.split('/');
    var mes = parseInt(partes[0], 10);
    var anio = parseInt('20' + partes[1], 10);
    if (mes < 1 || mes > 12) return true; // mes inválido, la tratamos como vencida
    var hoy = new Date();
    var finMes = new Date(anio, mes, 0, 23, 59, 59); // último instante del mes de vencimiento
    return finMes < hoy;
}

// Guarda el pedido confirmado en el historial de "papitaPedidos" (localStorage).
function guardarPedido(pedido) {
    var pedidos = [];
    try {
        pedidos = JSON.parse(localStorage.getItem('papitaPedidos') || '[]');
        if (!Array.isArray(pedidos)) pedidos = [];
    } catch (e) {
        pedidos = [];
    }
    pedidos.push(pedido);
    localStorage.setItem('papitaPedidos', JSON.stringify(pedidos));
}

/**
 * Notifica al cliente que su pago fue confirmado, mostrando su correo.
 * Usa un toast visible siempre en pantalla y, si el navegador lo permite,
 * también una notificación nativa del sistema operativo.
 */
function notificarPagoConfirmado(correo, orderNumber, totalTexto) {
    var toast = document.getElementById('paymentToast');
    toast.innerHTML = '<strong><i class="fas fa-check-circle"></i> Pago confirmado</strong>' +
        'Pedido ' + orderNumber + ' por ' + totalTexto + '.<br>' +
        'Confirmación enviada a <span class="toast-email">' + correo + '</span>.';
    toast.classList.add('show');
    clearTimeout(notificarPagoConfirmado._timer);
    notificarPagoConfirmado._timer = setTimeout(function() {
        toast.classList.remove('show');
    }, 7000);

    if ('Notification' in window) {
        var lanzarNotificacion = function() {
            new Notification('Papita Dulce · Pago confirmado', {
                body: 'Pedido ' + orderNumber + ' por ' + totalTexto + '. Confirmación enviada a ' + correo + '.',
                icon: 'img/logopapita.png'
            });
        };
        if (Notification.permission === 'granted') {
            lanzarNotificacion();
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(permiso) {
                if (permiso === 'granted') lanzarNotificacion();
            });
        }
    }
}

// Envío del formulario de pago (paso 3): valida todos los campos según
// el método de pago elegido, "procesa" el pago (con un pequeño retraso
// simulado) y, si todo sale bien, guarda el pedido, limpia el carrito
// y muestra la confirmación al cliente.
document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('payName').value.trim();
    var email = document.getElementById('payEmail').value.trim();
    var phone = document.getElementById('payPhone').value.trim();
    var address = document.getElementById('payAddress').value.trim();
    var error = document.getElementById('paymentError');
    error.textContent = '';

    if (name.length < 3) { error.textContent = 'Ingresa tu nombre completo.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { error.textContent = 'Ingresa un correo electrónico válido.'; return; }
    if (!/^[+0-9 ]{8,15}$/.test(phone)) { error.textContent = 'Ingresa un teléfono de contacto válido.'; return; }
    if (deliveryMethod === 'despacho' && address.length < 5) { error.textContent = 'Ingresa la dirección de despacho.'; return; }

    var card = '', expiry = '', cvv = '';
    if (paymentMethod === 'tarjeta') {
        card = document.getElementById('payCard').value.replace(/\s/g, '');
        expiry = document.getElementById('payExpiry').value.trim();
        cvv = document.getElementById('payCvv').value.trim();
        if (!/^\d{16}$/.test(card) || !pasaLuhn(card)) { error.textContent = 'El número de tarjeta no es válido.'; return; }
        if (!/^\d{2}\/\d{2}$/.test(expiry) || tarjetaVencida(expiry)) { error.textContent = 'La fecha de vencimiento no es válida o la tarjeta está vencida.'; return; }
        if (!/^\d{3,4}$/.test(cvv)) { error.textContent = 'El CVV no es válido.'; return; }
    } else if (paymentMethod === 'transferencia') {
        if (!document.getElementById('payTransferConfirm').checked) { error.textContent = 'Confirma que realizaste la transferencia para continuar.'; return; }
    }
    // "efectivo" no requiere datos adicionales

    var purchasedItems = cartItems.map(function(item) {
        return { title: item.title, price: item.price, quantity: item.quantity };
    });
    var orderTotal = purchasedItems.reduce(function(total, item) {
        return total + item.price * item.quantity;
    }, 0);
    var orderNumber = 'PD-' + Date.now().toString().slice(-6);
    var totalTexto = formatPrice(orderTotal);
    var submit = document.getElementById('paySubmit');
    submit.disabled = true;
    submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    setTimeout(function() {
        guardarPedido({
            orderNumber: orderNumber,
            fecha: new Date().toISOString(),
            cliente: { nombre: name, correo: email, telefono: phone },
            entrega: { metodo: deliveryMethod, direccion: deliveryMethod === 'despacho' ? address : 'Retiro en tienda' },
            pago: { metodo: paymentMethod },
            items: purchasedItems,
            total: orderTotal
        });

        cartItems = [];
        saveCart();
        renderCart();
        document.getElementById('paymentPanel').classList.remove('open');
        document.getElementById('paymentPanel').setAttribute('aria-hidden', 'true');

        var metodoTexto = { tarjeta: 'tarjeta', transferencia: 'transferencia bancaria', efectivo: 'efectivo' }[paymentMethod];
        var entregaTexto = deliveryMethod === 'despacho' ? 'Despacho a domicilio' : 'Retiro en tienda';
        document.querySelector('#cartEmpty p').innerHTML = '<strong>Pago exitoso</strong><br>Pedido ' + orderNumber + ' (' + metodoTexto + ')<br><small>' + entregaTexto + '. Confirmación enviada a ' + email + '.</small>';
        document.getElementById('cartNotice').innerHTML = '<strong>Compra confirmada:</strong> ' + totalTexto + ' para ' + name + '.';
        openCart();
        document.getElementById('cartSummary').textContent = purchasedItems.length + ' línea(s) confirmada(s)';
        document.getElementById('cartFoot').style.display = 'block';
        document.getElementById('cartCheckout').style.display = 'none';
        document.getElementById('cartClear').style.display = 'none';
        submit.disabled = false;
        submit.innerHTML = '<i class="fas fa-lock"></i>Confirmar pago';
        document.getElementById('paymentForm').reset();
        document.getElementById('deliveryAddressBox').style.display = 'none';

        notificarPagoConfirmado(email, orderNumber, totalTexto);
    }, 900);
});

/* ===================== PANEL "MI CUENTA" ===================== */
var accountPanel = document.getElementById('accountPanel');

// Cierra el panel de cuenta (login/registro/recuperación).
function closeAccount() {
    accountPanel.classList.remove('open');
    accountPanel.setAttribute('aria-hidden', 'true');
    document.getElementById('accountToggle').setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Cambia entre las vistas "login", "register" o "recovery" dentro
// del panel de cuenta, y limpia el mensaje de error/éxito anterior.
function showAccountView(view) {
    document.querySelectorAll('.account-view').forEach(function(form) {
        form.classList.toggle('active', form.getAttribute('data-view') === view);
    });
    document.querySelectorAll('.account-tab').forEach(function(tab) {
        tab.classList.toggle('active', tab.getAttribute('data-account-view') === view);
    });
    document.getElementById('accountMessage').textContent = '';
}
document.getElementById('accountToggle').addEventListener('click', function() {
    showAccountView('login');
    accountPanel.classList.add('open');
    accountPanel.setAttribute('aria-hidden', 'false');
    this.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
});
document.getElementById('accountClose').addEventListener('click', closeAccount);
accountPanel.addEventListener('click', function(e) { if (e.target === accountPanel) closeAccount(); });
document.querySelectorAll('.account-tab').forEach(function(tab) {
    tab.addEventListener('click', function() { showAccountView(this.getAttribute('data-account-view')); });
});
document.getElementById('forgotPassword').addEventListener('click', function() { showAccountView('recovery'); });
document.getElementById('backToLogin').addEventListener('click', function() { showAccountView('login'); });
/* ===================== REGIONES Y COMUNAS (formulario de registro) ===================== */
// Diccionario simple: cada región de Chile con algunas de sus comunas,
// para llenar el segundo selector (comuna) según la región elegida.
var chileRegions = {
    'Arica y Parinacota': ['Arica', 'Camarones', 'Putre', 'General Lagos'],
    'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica'],
    'Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'San Pedro de Atacama'],
    'Atacama': ['Copiapó', 'Caldera', 'Vallenar', 'Huasco', 'Chañaral'],
    'Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña'],
    'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio', 'Los Andes'],
    'Región Metropolitana de Santiago': ['Santiago', 'Puente Alto', 'Maipú', 'Las Condes', 'La Florida', 'Ñuñoa', 'Providencia', 'San Bernardo'],
    "O'Higgins": ['Rancagua', 'San Fernando', 'Rengo', 'Machalí', 'Santa Cruz'],
    'Maule': ['Talca', 'Curicó', 'Linares', 'Constitución', 'Cauquenes'],
    'Ñuble': ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Yungay'],
    'Biobío': ['Concepción', 'Talcahuano', 'Los Ángeles', 'Coronel', 'San Pedro de la Paz', 'Lota'],
    'La Araucanía': ['Temuco', 'Villarrica', 'Angol', 'Pucón', 'Padre Las Casas'],
    'Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Paillaco'],
    'Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas', 'Quellón'],
    'Aysén': ['Coyhaique', 'Aysén', 'Chile Chico', 'Cochrane'],
    'Magallanes y de la Antártica Chilena': ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Cabo de Hornos']
};
var regionSelect = document.getElementById('registerRegion');
var communeSelect = document.getElementById('registerCommune');

// Llena el selector de región con todas las claves del diccionario.
Object.keys(chileRegions).forEach(function(region) {
    regionSelect.add(new Option(region, region));
});

// Cuando el usuario elige una región, se rellena el selector de comuna
// solo con las comunas de esa región (y se habilita el campo).
regionSelect.addEventListener('change', function() {
    communeSelect.innerHTML = '<option value="">Selecciona tu comuna</option>';
    (chileRegions[this.value] || []).forEach(function(commune) {
        communeSelect.add(new Option(commune, commune));
    });
    communeSelect.disabled = !this.value;
});

/* ===================== VALIDACIÓN DE CONTRASEÑA (registro) ===================== */
// Revisa en vivo, mientras el usuario escribe, si la contraseña cumple:
// largo mínimo de 8, al menos una mayúscula, al menos un número y al
// menos un carácter especial. Marca cada regla como cumplida o no en el HTML.
function updatePasswordRules() {
    var password = document.getElementById('registerPassword').value;
    var rules = {
        length: password.length >= 8,
        uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password)
    };
    Object.keys(rules).forEach(function(rule) {
        document.querySelector('[data-rule="' + rule + '"]').classList.toggle('valid', rules[rule]);
    });
    return rules;
}
document.getElementById('registerPassword').addEventListener('input', updatePasswordRules);
// El envío real de los formularios de inicio de sesión, registro y recuperación
// vive en js/auth.js. Aquí solo exponemos utilidades que ese módulo reutiliza.
window.evaluarReglasPassword = updatePasswordRules;
window.mostrarVistaCuenta = showAccountView;
window.cerrarPanelCuenta = closeAccount;
// Si el cliente inicia sesión mientras está pagando, le completamos
// automáticamente su nombre y correo en el formulario de pago (solo
// si esos campos todavía están vacíos, para no pisar lo que ya escribió).
window.prellenarDatosCliente = function(usuario) {
    var nombreInput = document.getElementById('payName');
    var emailInput = document.getElementById('payEmail');
    if (nombreInput && !nombreInput.value) nombreInput.value = usuario.nombre || '';
    if (emailInput && !emailInput.value) emailInput.value = usuario.correo || '';
};
renderCart(); // dibuja el carrito apenas carga la página (por si venía algo guardado)

// Botón "Añadir al carrito" dentro del popup de detalle del producto.
// Cambia el botón a "Añadido" por un instante y luego cierra el popup.
document.getElementById('mpAddCart').addEventListener('click', function() {
    addItemToCart(activeMenuCard, mpQty);
    this.innerHTML = '<i class="fas fa-check"></i> Añadido al carrito';
    this.style.background = 'linear-gradient(135deg,var(--green),#1a4a35)';
    var self = this;
    setTimeout(function() {
        closeMenuPop();
        self.innerHTML = '<i class="fas fa-shopping-cart"></i> Añadir al carrito';
        self.style.background = '';
    }, 1000);
});


/* ===================== FORMULARIO DE RESERVA ===================== */
// Simula el envío de la reserva: muestra un spinner de "Reservando...",
// espera 1.5 segundos y luego muestra el mensaje de confirmación.
// (No hay backend real: es solo una simulación visual).
document.getElementById('resBtn').addEventListener('click', function() {
    var btn = this;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reservando...';
    btn.disabled = true;
    setTimeout(function() {
        btn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirmar Reserva';
        btn.disabled = false;
        var ok = document.getElementById('resOk');
        ok.style.display = 'block';
        ok.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 1500);
});


/* ===================== FORMULARIO DE CONTACTO ===================== */
// Igual que la reserva: simula el envío del mensaje de contacto con
// un spinner y luego el mensaje de "enviado" (sin backend real).
document.getElementById('ctcBtn').addEventListener('click', function() {
    var btn = this;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    btn.disabled = true;
    setTimeout(function() {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
        btn.disabled = false;
        var ok = document.getElementById('ctcOk');
        ok.style.display = 'block';
        ok.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 1500);
});


/* ===================== GALERÍA DE FOTOS (popup) ===================== */
var galPop = document.getElementById('galPop'); // el popup/lightbox de la galería
var galData = [];  // guarda imagen, título y descripción de cada foto
var galIdx = 0;    // índice de la foto que se está mostrando ahora

// Por cada miniatura de la galería, guardamos sus datos en "galData"
// y le agregamos el clic para abrir el popup en esa foto.
document.querySelectorAll('.gitem').forEach(function(item) {
    galData.push({
        img: item.getAttribute('data-gimg'),
        title: item.getAttribute('data-gtitle'),
        desc: item.getAttribute('data-gdesc')
    });
    item.addEventListener('click', function() {
        openGal(parseInt(this.getAttribute('data-gi')));
    });
});

// Abre el popup de la galería mostrando la foto con índice "i".
function openGal(i) {
    galIdx = i;
    var g = galData[i];
    document.getElementById('gpImg').setAttribute('src', g.img);
    document.getElementById('gpTitle').textContent = g.title;
    document.getElementById('gpDesc').innerHTML = g.desc;
    galPop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

document.getElementById('gpClose').addEventListener('click', closeGal);
// Clic en el fondo oscuro (fuera de la foto) también cierra el popup
galPop.addEventListener('click', function(e) {
    if (e.target === this) closeGal();
});

function closeGal() {
    galPop.classList.remove('open');
    document.body.style.overflow = '';
}

// Flechas "anterior" y "siguiente": el "% galData.length" hace que
// la galería sea circular (de la última foto vuelve a la primera y viceversa).
document.getElementById('gpPrev').addEventListener('click', function() {
    openGal((galIdx - 1 + galData.length) % galData.length);
});
document.getElementById('gpNext').addEventListener('click', function() {
    openGal((galIdx + 1) % galData.length);
});

/*  ESC key closes everything */
// Con la tecla Escape se cierran todos los popups y paneles abiertos
// (buscador, detalle de producto, galería, pago, cuenta y carrito).
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSearch();
        closeMenuPop();
        closeGal();
        document.getElementById('paymentPanel').classList.remove('open');
        document.getElementById('paymentPanel').setAttribute('aria-hidden', 'true');
        closeAccount();
        closeCart();
        if (typeof $.magnificPopup !== 'undefined') $.magnificPopup.close();
    }
});


/* ===================== CARRUSEL DE TESTIMONIOS (Swiper) ===================== */
// Configura el carrusel deslizable de testimonios de clientes: se mueve
// solo (autoplay), es infinito (loop) y muestra 1, 2 o 3 testimonios
// a la vez dependiendo del ancho de pantalla (breakpoints).
new Swiper('.tesSwiper', {
    slidesPerView: 1,
    spaceBetween: 22,
    loop: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    breakpoints: {
        640: {
            slidesPerView: 2
        },
        1024: {
            slidesPerView: 3
        }
    }
});


/* ===================== CONTADOR REGRESIVO (oferta / reserva) ===================== */
// Cuenta regresiva decorativa que arranca en 08:45:30 y se reinicia sola
// al llegar a 00:00:00. Es solo visual, no está atada a una fecha real.
var cH = 8,
    cM = 45,
    cS = 30;
setInterval(function() {
    cS--;
    if (cS < 0) {
        cS = 59;
        cM--;
    }
    if (cM < 0) {
        cM = 59;
        cH--;
    }
    if (cH < 0) {
        cH = 8;
        cM = 45;
        cS = 30;
    }
    document.getElementById('cdH').textContent = String(cH).padStart(2, '0');
    document.getElementById('cdM').textContent = String(cM).padStart(2, '0');
    document.getElementById('cdS').textContent = String(cS).padStart(2, '0');
}, 1000);

/* ===================== NEWSLETTER ===================== */
// Al hacer clic en "Suscribirse", si el correo escrito parece válido
// (tiene un "@"), se muestra un mensaje de "¡Suscrito!" por 3 segundos
// y se limpia el campo. No hay envío real a ningún servidor.
document.getElementById('nlBtn').addEventListener('click', function() {
    var email = document.getElementById('nlEmail').value;
    if (email && email.includes('@')) {
        var btn = this;
        btn.textContent = '¡Suscrito!';
        btn.style.background = '#4ade80';
        btn.style.color = '#222';
        document.getElementById('nlEmail').value = '';
        setTimeout(function() {
            btn.textContent = 'Suscribirse';
            btn.style.background = '';
            btn.style.color = '';
        }, 3000);
    }
});

/* ===================== ANIMACIÓN DE CONTADORES NUMÉRICOS ===================== */
// Los números de la sección "hero" (ej: "500+ clientes") empiezan en 0
// y van subiendo de a poquito hasta llegar al número real, apenas el
// usuario hace scroll y pasa esa sección. "numAnimated" evita que la
// animación se repita cada vez que se hace scroll.
var numAnimated = false;
window.addEventListener('scroll', function() {
    var hero = document.getElementById('hero');
    if (!numAnimated && hero && window.scrollY > hero.offsetHeight - 300) {
        numAnimated = true;
        document.querySelectorAll('.snum').forEach(function(el) {
            var txt = el.textContent;
            var num = parseInt(txt);                 // parte numérica (ej: 500)
            var suf = txt.replace(/[0-9]/g, '');      // lo que sobra (ej: "+")
            if (isNaN(num)) return;
            var start = 0;
            var step = Math.ceil(num / 55); // en cuánto sube cada "tick" (55 pasos en total)
            var iv = setInterval(function() {
                start += step;
                if (start >= num) {
                    start = num; // no pasarse del número final
                    clearInterval(iv);
                }
                el.textContent = start + suf;
            }, 1400 / 55); // ~25ms por paso, para que toda la animación dure ~1.4s
        });
    }
});