AOS.init({
    duration: 680,
    once: true,
    offset: 55
});

/* NAVBAR SCROLL & ACTIVE LINK  */
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


var searchOv = document.getElementById('searchOv');

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

function searchMenu(query) {
    var normalized = String(query || '').trim().toLowerCase();
    document.querySelectorAll('.mwrap').forEach(function(wrapper) {
        var card = wrapper.querySelector('.mcard');
        var searchable = card ? [
            card.getAttribute('data-title'),
            card.getAttribute('data-cat'),
            card.getAttribute('data-desc'),
            card.getAttribute('data-tags')
        ].join(' ').toLowerCase() : '';
        var matches = !normalized || searchable.indexOf(normalized) !== -1;
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

// Category section cards â†’ scroll + filter
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

function setVariantData(button, data) {
    Object.keys(data).forEach(function(key) {
        button.setAttribute('data-' + key, data[key]);
    });
    button.textContent = data.label;
}

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

function openMenuPop(card) {
    activeMenuCard = card;
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
        '<i class="fas fa-star"></i>'.repeat(full) + 'â˜†'.repeat(empty) +
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

document.querySelectorAll('#mpVariants .mvariant').forEach(function(button) {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
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

function closeMenuPop() {
    menuPop.classList.remove('open');
    document.body.style.overflow = '';
}

// Qty +/-
document.getElementById('mpPlus').addEventListener('click', function() {
    document.getElementById('mpQnum').textContent = ++mpQty;
});
document.getElementById('mpMinus').addEventListener('click', function() {
    if (mpQty > 1) document.getElementById('mpQnum').textContent = --mpQty;
});

function formatPrice(value) {
    return '$' + Number(value).toLocaleString('es-CL');
}

function getCartItem(card) {
    var price = (card.getAttribute('data-price') || '$0').replace(/[^0-9]/g, '');
    return {
        id: card.getAttribute('data-img') + '|' + card.getAttribute('data-title'),
        img: card.getAttribute('data-img'),
        title: card.getAttribute('data-title'),
        price: parseInt(price, 10) || 0,
        quantity: mpQty
    };
}

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

function saveCart() {
    localStorage.setItem('papitaCart', JSON.stringify(cartItems));
}

function updateCartCount() {
    var count = cartItems.reduce(function(total, item) {
        return total + item.quantity;
    }, 0);
    document.getElementById('cartCount').textContent = count;
}

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

function buildOrderSummary(items) {
    return items.map(function(item) {
        return '<div><strong>' + item.quantity + ' x</strong> ' + item.title + ' <span>' + formatPrice(item.price * item.quantity) + '</span></div>';
    }).join('');
}

function openCart() {
    renderCart();
    document.getElementById('cartPanel').classList.add('open');
    document.getElementById('cartPanel').setAttribute('aria-hidden', 'false');
    document.getElementById('cartToggle').setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

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
document.getElementById('cartCheckout').addEventListener('click', function() {
    if (!cartItems.length) return;
    document.getElementById('paymentTotal').textContent = document.getElementById('cartSubtotal').textContent;
    document.getElementById('paymentOrderSummary').innerHTML = '<strong>Detalle de tu compra</strong>' + buildOrderSummary(cartItems);
    document.getElementById('paymentSuccess').style.display = 'none';
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
document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('payName').value.trim();
    var email = document.getElementById('payEmail').value.trim();
    var card = document.getElementById('payCard').value.replace(/\s/g, '');
    var expiry = document.getElementById('payExpiry').value.trim();
    var cvv = document.getElementById('payCvv').value.trim();
    var error = document.getElementById('paymentError');
    if (name.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{16}$/.test(card) || !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvv)) {
        error.textContent = 'Completa los datos usando el formato de prueba indicado.';
        return;
    }
    var purchasedItems = cartItems.map(function(item) {
        return { title: item.title, price: item.price, quantity: item.quantity };
    });
    var orderTotal = purchasedItems.reduce(function(total, item) {
        return total + item.price * item.quantity;
    }, 0);
    var orderNumber = 'PD-' + Date.now().toString().slice(-6);
    var submit = document.getElementById('paySubmit');
    submit.disabled = true;
    submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    error.textContent = '';
    setTimeout(function() {
        cartItems = [];
        saveCart();
        renderCart();
        document.getElementById('paymentPanel').classList.remove('open');
        document.getElementById('paymentPanel').setAttribute('aria-hidden', 'true');
        document.querySelector('#cartEmpty p').innerHTML = '<strong>Pago exitoso</strong><br>Pedido ' + orderNumber + '<br><small>El detalle de tu compra fue preparado para enviarse a ' + email + '.</small>';
        document.getElementById('cartNotice').innerHTML = '<strong>Compra confirmada:</strong> ' + formatPrice(orderTotal) + ' para ' + name + '. Envío de correo simulado.';
        openCart();
        document.getElementById('cartEmpty p').innerHTML = '<strong>Pago exitoso</strong><br>Pedido ' + orderNumber + '<br><small>El detalle de tu compra fue preparado para enviarse a ' + email + '.</small>';
        document.getElementById('cartNotice').innerHTML = '<strong>Compra confirmada:</strong> ' + formatPrice(orderTotal) + ' para ' + name + '. Envío de correo simulado.';
        document.getElementById('cartSummary').textContent = purchasedItems.length + ' línea(s) confirmada(s)';
        document.getElementById('cartFoot').style.display = 'block';
        document.getElementById('cartCheckout').style.display = 'none';
        document.getElementById('cartClear').style.display = 'none';
        submit.disabled = false;
        submit.innerHTML = '<i class="fas fa-lock"></i>Simular pago';
        document.getElementById('paymentForm').reset();
    }, 900);
});

var accountPanel = document.getElementById('accountPanel');
function closeAccount() {
    accountPanel.classList.remove('open');
    accountPanel.setAttribute('aria-hidden', 'true');
    document.getElementById('accountToggle').setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}
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
Object.keys(chileRegions).forEach(function(region) {
    regionSelect.add(new Option(region, region));
});
regionSelect.addEventListener('change', function() {
    communeSelect.innerHTML = '<option value="">Selecciona tu comuna</option>';
    (chileRegions[this.value] || []).forEach(function(commune) {
        communeSelect.add(new Option(commune, commune));
    });
    communeSelect.disabled = !this.value;
});
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
document.querySelectorAll('.account-view').forEach(function(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var message = document.getElementById('accountMessage');
        var password = document.getElementById('registerPassword').value;
        var confirmPassword = document.getElementById('registerConfirm').value;
        var passwordRules = updatePasswordRules();
        var invalidPassword = this.id === 'registerView' && (!Object.keys(passwordRules).every(function(rule) { return passwordRules[rule]; }) || password !== confirmPassword);
        if (!this.checkValidity() || invalidPassword) {
            message.style.color = 'var(--primary)';
            message.textContent = invalidPassword && password !== confirmPassword ? 'Las contraseñas no coinciden.' : 'Completa los campos con datos válidos.';
            return;
        }
        message.style.color = 'var(--green)';
        if (this.id === 'loginView') message.textContent = 'Inicio de sesión simulado correctamente.';
        if (this.id === 'registerView') message.textContent = 'Cuenta creada correctamente. Ya puedes iniciar sesión.';
        if (this.id === 'recoveryView') message.textContent = 'Enlace de recuperación simulado enviado a tu correo.';
    });
});
renderCart();

// Add to cart button
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


var galPop = document.getElementById('galPop');
var galData = [];
var galIdx = 0;

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
galPop.addEventListener('click', function(e) {
    if (e.target === this) closeGal();
});

function closeGal() {
    galPop.classList.remove('open');
    document.body.style.overflow = '';
}

document.getElementById('gpPrev').addEventListener('click', function() {
    openGal((galIdx - 1 + galData.length) % galData.length);
});
document.getElementById('gpNext').addEventListener('click', function() {
    openGal((galIdx + 1) % galData.length);
});

/*  ESC key closes everything */
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

/* â”€â”€ NEWSLETTER â”€â”€ */
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

/*  NUMBER COUNTER ANIMATION*/
var numAnimated = false;
window.addEventListener('scroll', function() {
    var hero = document.getElementById('hero');
    if (!numAnimated && hero && window.scrollY > hero.offsetHeight - 300) {
        numAnimated = true;
        document.querySelectorAll('.snum').forEach(function(el) {
            var txt = el.textContent;
            var num = parseInt(txt);
            var suf = txt.replace(/[0-9]/g, '');
            if (isNaN(num)) return;
            var start = 0;
            var step = Math.ceil(num / 55);
            var iv = setInterval(function() {
                start += step;
                if (start >= num) {
                    start = num;
                    clearInterval(iv);
                }
                el.textContent = start + suf;
            }, 1400 / 55);
        });
    }
});