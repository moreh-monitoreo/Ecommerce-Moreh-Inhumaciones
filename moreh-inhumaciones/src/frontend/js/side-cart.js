/* ============================================================
   MOREH — CARRITO LATERAL + MODAL DE CHECKOUT
   Vanilla JS sin dependencias externas.
   Incluir DESPUÉS de Bootstrap y ANTES del script inline de la página.
   ============================================================ */
(function () {
    'use strict';

    var CART_KEY    = 'moreh_cart';
    var API_BASE    = '/api';
    var PLACEHOLDER = '../img/placeholder_thumbnail1.png';

    /* ── Cart helpers ───────────────────────────────────────────── */
    function normalizeItem(i) {
        return {
            id:       i.id       != null ? i.id       : null,
            nombre:   i.nombre   || i.name  || '',
            precio:  +(i.precio  != null ? i.precio   : (i.price  || 0)),
            variante: i.variante || null,
            cantidad:+(i.cantidad!= null ? i.cantidad : (i.qty    || 1)),
            imagen:   i.imagen   || i.image || null,
        };
    }

    function getCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]').map(normalizeItem); }
        catch (e) { return []; }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateBadges(cart);
    }

    function clearCart() {
        saveCart([]);
    }

    function fmt(n) {
        return '$ ' + (+n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function totalItems(cart) {
        return cart.reduce(function (s, i) { return s + i.cantidad; }, 0);
    }

    function totalPrice(cart) {
        return cart.reduce(function (s, i) { return s + i.precio * i.cantidad; }, 0);
    }

    /* ── Badges ─────────────────────────────────────────────────── */
    function updateBadges(cart) {
        cart = cart || getCart();
        var count = totalItems(cart);
        ['cart-badge-desktop','cart-badge-mobile','cart-count','cart-count-m'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            el.textContent = count;
            if (el.classList.contains('cart-badge')) {
                el.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }

    /* ── Inyectar HTML del drawer y modal ───────────────────────── */
    function injectHTML() {
        if (document.getElementById('sc-drawer')) return;

        var wrap = document.createElement('div');
        wrap.innerHTML = [
            /* Overlay */
            '<div class="sc-overlay" id="sc-overlay"></div>',

            /* Drawer */
            '<aside class="sc-drawer" id="sc-drawer" aria-label="Carrito" role="dialog">',
            '  <div class="sc-header">',
            '    <h3>Mi carrito</h3>',
            '    <button class="sc-close" id="sc-close" aria-label="Cerrar carrito">&times;</button>',
            '  </div>',
            '  <div class="sc-items" id="sc-items"></div>',
            '  <div class="sc-footer" id="sc-footer" style="display:none;">',
            '    <div class="sc-totals-row"><span>Subtotal</span><span id="sc-subtotal">$ 0.00</span></div>',
            '    <div class="sc-totals-total"><span>Total</span><span id="sc-total">$ 0.00</span></div>',
            '    <button class="sc-btn-checkout" id="sc-btn-checkout">',
            '      Finalizar compra',
            '    </button>',
            '    <a href="sale-cart.html" class="sc-btn-view-cart" id="sc-view-cart">Ver carrito completo</a>',
            '  </div>',
            '</aside>',

            /* Modal de checkout */
            '<div class="sc-modal-overlay" id="sc-modal-overlay" role="dialog" aria-modal="true" aria-label="Finalizar compra">',
            '  <div class="sc-modal-box">',
            '    <div class="sc-modal-header">',
            '      <h3>Finalizar pedido</h3>',
            '      <button class="sc-modal-close" id="sc-modal-close" aria-label="Cerrar">&times;</button>',
            '    </div>',

            /* ── Formulario ── */
            '    <div class="sc-modal-body" id="sc-modal-form">',
            '      <p class="sc-section-label">Datos de contacto</p>',
            '      <div class="sc-field">',
            '        <label for="co-name">Nombre completo *</label>',
            '        <input type="text" id="co-name" placeholder="Tu nombre completo" autocomplete="name">',
            '      </div>',
            '      <div class="sc-field">',
            '        <label for="co-email">Correo electrónico *</label>',
            '        <input type="email" id="co-email" placeholder="tu@correo.com" autocomplete="email">',
            '      </div>',
            '      <div class="sc-field">',
            '        <label for="co-phone">Teléfono *</label>',
            '        <input type="tel" id="co-phone" placeholder="667 000 0000" autocomplete="tel">',
            '      </div>',
            '      <p class="sc-section-label">Dirección de envío <span style="font-weight:400;text-transform:none;letter-spacing:0;">(opcional)</span></p>',
            '      <div class="sc-field-group">',
            '        <div class="sc-field" style="margin-bottom:0;">',
            '          <label for="co-street">Calle</label>',
            '          <input type="text" id="co-street" placeholder="Av. Insurgentes" autocomplete="address-line1">',
            '        </div>',
            '        <div class="sc-field" style="margin-bottom:0;">',
            '          <label for="co-ext">Núm. ext.</label>',
            '          <input type="text" id="co-ext" placeholder="123">',
            '        </div>',
            '        <div class="sc-field" style="margin-bottom:0;">',
            '          <label for="co-int">Núm. int.</label>',
            '          <input type="text" id="co-int" placeholder="A">',
            '        </div>',
            '      </div>',
            '      <div class="sc-field" style="margin-top:10px;">',
            '        <label for="co-colonia">Colonia</label>',
            '        <input type="text" id="co-colonia" placeholder="Roma Norte">',
            '      </div>',
            '      <div class="sc-field-group-2">',
            '        <div class="sc-field" style="margin-bottom:0;">',
            '          <label for="co-city">Ciudad</label>',
            '          <input type="text" id="co-city" placeholder="Culiacán" autocomplete="address-level2">',
            '        </div>',
            '        <div class="sc-field" style="margin-bottom:0;">',
            '          <label for="co-state">Estado</label>',
            '          <select id="co-state" autocomplete="address-level1">',
            '            <option value="">Estado...</option>',
            '            <option>Aguascalientes</option><option>Baja California</option><option>Baja California Sur</option>',
            '            <option>Campeche</option><option>Chiapas</option><option>Chihuahua</option>',
            '            <option>Ciudad de México</option><option>Coahuila</option><option>Colima</option>',
            '            <option>Durango</option><option>Estado de México</option><option>Guanajuato</option>',
            '            <option>Guerrero</option><option>Hidalgo</option><option>Jalisco</option>',
            '            <option>Michoacán</option><option>Morelos</option><option>Nayarit</option>',
            '            <option>Nuevo León</option><option>Oaxaca</option><option>Puebla</option>',
            '            <option>Querétaro</option><option>Quintana Roo</option><option>San Luis Potosí</option>',
            '            <option>Sinaloa</option><option>Sonora</option><option>Tabasco</option>',
            '            <option>Tamaulipas</option><option>Tlaxcala</option><option>Veracruz</option>',
            '            <option>Yucatán</option><option>Zacatecas</option>',
            '          </select>',
            '        </div>',
            '        <div class="sc-field" style="margin-bottom:0;">',
            '          <label for="co-zip">C.P.</label>',
            '          <input type="text" id="co-zip" placeholder="80000" inputmode="numeric" maxlength="5">',
            '        </div>',
            '      </div>',
            '      <div class="sc-field" style="margin-top:10px;">',
            '        <label for="co-notes">Notas adicionales</label>',
            '        <textarea id="co-notes" placeholder="Instrucciones especiales, referencias..." rows="2"></textarea>',
            '      </div>',
            '      <div class="sc-error" id="co-error" style="display:none;"></div>',
            '      <button class="sc-btn-submit" id="co-submit">',
            '        Confirmar pedido',
            '      </button>',
            '      <p class="sc-payment-note">',
            '        Un asesor de Moreh Inhumaciones confirmará tu pedido y se pondrá en contacto contigo a la brevedad.',
            '      </p>',
            '    </div>',

            /* ── Estado de éxito ── */
            '    <div class="sc-modal-body" id="sc-modal-success" style="display:none; text-align:center; padding:40px 24px;">',
            '      <div style="width:64px;height:64px;border-radius:50%;background:#f0f9f4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">',
            '        <i class="fa fa-check" style="font-size:2rem;color:#22c55e;"></i>',
            '      </div>',
            '      <h4 style="font-size:1.1rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">¡Pedido recibido!</h4>',
            '      <p style="font-size:0.88rem;color:#555;margin-bottom:6px;">Tu pedido ha sido registrado exitosamente.</p>',
            '      <p id="sc-order-id" style="font-size:0.82rem;color:#999;margin-bottom:20px;"></p>',
            '      <p style="font-size:0.82rem;color:#555;margin-bottom:24px;">',
            '        Un asesor de <strong>Moreh Inhumaciones</strong> se comunicará contigo pronto para confirmar los detalles.',
            '      </p>',
            '      <button class="sc-btn-submit" id="sc-success-close" style="max-width:220px;margin:0 auto;">',
            '        Cerrar',
            '      </button>',
            '    </div>',

            '  </div>',
            '</div>',
        ].join('\n');

        document.body.appendChild(wrap);
    }

    /* ── Render drawer ──────────────────────────────────────────── */
    function renderDrawer() {
        var cart     = getCart();
        var itemsEl  = document.getElementById('sc-items');
        var footerEl = document.getElementById('sc-footer');
        if (!itemsEl || !footerEl) return;

        if (cart.length === 0) {
            itemsEl.innerHTML = [
                '<div class="sc-empty">',
                '  <span class="sc-empty-icon"><i class="fa fa-shopping-cart"></i></span>',
                '  <h4>Tu carrito está vacío</h4>',
                '  <p>Agrega productos para comenzar.</p>',
                '</div>',
            ].join('');
            footerEl.style.display = 'none';
            return;
        }

        var html = '';
        cart.forEach(function (item, idx) {
            var lineTotal = item.precio * item.cantidad;
            var img = item.imagen || PLACEHOLDER;
            html += [
                '<div class="sc-item">',
                '  <img class="sc-item-img" src="' + img + '" alt="' + item.nombre + '" onerror="this.onerror=null;this.src=\'' + PLACEHOLDER + '\'">',
                '  <div class="sc-item-info">',
                '    <div class="sc-item-name">' + item.nombre + '</div>',
                item.variante ? '    <div class="sc-item-variant">' + item.variante + '</div>' : '',
                '    <div class="sc-item-unit">' + fmt(item.precio) + ' c/u</div>',
                '    <div class="sc-item-actions">',
                '      <div class="sc-qty">',
                '        <button type="button" data-sc-action="dec" data-sc-idx="' + idx + '" aria-label="Reducir">&#8722;</button>',
                '        <span>' + item.cantidad + '</span>',
                '        <button type="button" data-sc-action="inc" data-sc-idx="' + idx + '" aria-label="Aumentar">+</button>',
                '      </div>',
                '      <button type="button" class="sc-item-remove" data-sc-remove="' + idx + '">Eliminar</button>',
                '    </div>',
                '  </div>',
                '  <div class="sc-item-price">' + fmt(lineTotal) + '</div>',
                '</div>',
            ].join('');
        });

        itemsEl.innerHTML = html;

        var subtotal = totalPrice(cart);
        document.getElementById('sc-subtotal').textContent = fmt(subtotal);
        document.getElementById('sc-total').textContent    = fmt(subtotal);
        footerEl.style.display = 'block';
    }

    /* ── Drawer open / close ────────────────────────────────────── */
    function openDrawer() {
        renderDrawer();
        document.getElementById('sc-overlay').classList.add('sc-open');
        document.getElementById('sc-drawer').classList.add('sc-open');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        document.getElementById('sc-overlay').classList.remove('sc-open');
        document.getElementById('sc-drawer').classList.remove('sc-open');
        document.body.style.overflow = '';
    }

    /* ── Modal open / close ─────────────────────────────────────── */
    function openModal() {
        var overlay = document.getElementById('sc-modal-overlay');
        if (!overlay) return;

        /* Resetear formulario y mostrar solo el form */
        ['co-name','co-email','co-phone','co-street','co-ext','co-int',
         'co-colonia','co-city','co-state','co-zip','co-notes'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById('co-error').style.display = 'none';
        var submitBtn = document.getElementById('co-submit');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Confirmar pedido'; }
        document.getElementById('sc-modal-form').style.display = '';
        document.getElementById('sc-modal-success').style.display = 'none';

        overlay.classList.add('sc-open');
        closeDrawer();
    }

    function closeModal() {
        var overlay = document.getElementById('sc-modal-overlay');
        if (overlay) overlay.classList.remove('sc-open');
        document.body.style.overflow = '';
    }

    /* ── Enviar pedido a la API ─────────────────────────────────── */
    function submitOrder() {
        var errEl   = document.getElementById('co-error');
        var btn     = document.getElementById('co-submit');
        errEl.style.display = 'none';

        function val(id) { return ((document.getElementById(id) || {}).value || '').trim(); }

        var nombre   = val('co-name');
        var email    = val('co-email');
        var telefono = val('co-phone');

        if (!nombre)   { errEl.textContent = 'Por favor ingresa tu nombre completo.';     errEl.style.display = ''; return; }
        if (!email)    { errEl.textContent = 'Por favor ingresa tu correo electrónico.';  errEl.style.display = ''; return; }
        if (!telefono) { errEl.textContent = 'Por favor ingresa tu número de teléfono.';  errEl.style.display = ''; return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errEl.textContent = 'El correo electrónico no es válido.';
            errEl.style.display = '';
            return;
        }

        var cart = getCart();
        if (cart.length === 0) { errEl.textContent = 'Tu carrito está vacío.'; errEl.style.display = ''; return; }

        /* Verificar que todos los items tengan ID de producto válido */
        var invalidItems = cart.filter(function (i) { return !i.id || isNaN(+i.id) || +i.id <= 0; });
        if (invalidItems.length > 0) {
            errEl.textContent = 'Hay productos en tu carrito que no se pueden procesar. Recarga la página.';
            errEl.style.display = '';
            return;
        }

        /* Construir body del request */
        var body = {
            cliente: { nombre: nombre, email: email, telefono: telefono },
            items: cart.map(function (i) {
                return { producto_id: +i.id, cantidad: i.cantidad };
            }),
        };

        btn.disabled    = true;
        btn.textContent = 'Procesando...';

        fetch(API_BASE + '/cotizaciones', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body),
        })
        .then(function (res) {
            return res.json().then(function (data) {
                return { ok: res.ok, status: res.status, data: data };
            });
        })
        .then(function (result) {
            if (!result.ok) {
                throw new Error(result.data && result.data.message
                    ? result.data.message
                    : 'Error al procesar el pedido. Intenta de nuevo.');
            }

            /* Éxito */
            clearCart();
            renderDrawer();

            var orderEl = document.getElementById('sc-order-id');
            if (orderEl && result.data && result.data.data && result.data.data.id) {
                orderEl.textContent = 'Número de pedido: #' + result.data.data.id;
            }

            document.getElementById('sc-modal-form').style.display    = 'none';
            document.getElementById('sc-modal-success').style.display = '';
        })
        .catch(function (err) {
            errEl.textContent   = err.message || 'Error de conexión. Intenta de nuevo.';
            errEl.style.display = '';
            btn.disabled        = false;
            btn.textContent     = 'Confirmar pedido';
        });
    }

    /* ── Eventos ────────────────────────────────────────────────── */
    function bindEvents() {
        document.getElementById('sc-close').addEventListener('click', closeDrawer);
        document.getElementById('sc-overlay').addEventListener('click', closeDrawer);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeDrawer(); closeModal(); }
        });

        /* Qty +/- y eliminar en drawer */
        document.getElementById('sc-items').addEventListener('click', function (e) {
            var btn = e.target.closest('[data-sc-action]');
            if (btn) {
                var cart = getCart();
                var idx  = parseInt(btn.dataset.scIdx, 10);
                if (btn.dataset.scAction === 'inc') {
                    cart[idx].cantidad += 1;
                } else if (btn.dataset.scAction === 'dec' && cart[idx].cantidad > 1) {
                    cart[idx].cantidad -= 1;
                }
                saveCart(cart);
                renderDrawer();
                return;
            }
            var rmBtn = e.target.closest('[data-sc-remove]');
            if (rmBtn) {
                var cart = getCart();
                cart.splice(parseInt(rmBtn.dataset.scRemove, 10), 1);
                saveCart(cart);
                renderDrawer();
            }
        });

        /* Abrir modal de checkout desde el drawer */
        document.getElementById('sc-btn-checkout').addEventListener('click', openModal);

        /* Cerrar modal */
        document.getElementById('sc-modal-close').addEventListener('click', closeModal);
        document.getElementById('sc-modal-overlay').addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });

        /* Confirmar pedido */
        document.getElementById('co-submit').addEventListener('click', submitOrder);

        /* Botón cerrar en pantalla de éxito */
        document.getElementById('sc-success-close').addEventListener('click', function () {
            closeModal();
            /* Si estamos en la página del carrito, refrescar para reflejar el estado vacío */
            if (window.location.pathname.indexOf('sale-cart') !== -1) {
                location.reload();
            }
        });

        /* Interceptar clicks en ícono de carrito para abrir drawer */
        var isSaleCartPage = window.location.pathname.indexOf('sale-cart') !== -1;
        if (!isSaleCartPage) {
            document.querySelectorAll('a[href="sale-cart.html"]').forEach(function (link) {
                if (link.id === 'sc-view-cart') return;
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    openDrawer();
                });
            });
        }
    }

    /* ── Init ───────────────────────────────────────────────────── */
    function init() {
        injectHTML();
        bindEvents();
        updateBadges();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ── API pública ────────────────────────────────────────────── */
    window.MorehCart = {
        open:         openDrawer,
        close:        closeDrawer,
        openModal:    openModal,
        getCart:      getCart,
        saveCart:     saveCart,
        updateBadges: updateBadges,
    };
})();
