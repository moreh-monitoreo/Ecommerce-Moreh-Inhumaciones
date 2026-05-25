(function () {
    'use strict';

    var API         = 'http://localhost:3000/api';
    var PLACEHOLDER = '../img/placeholder_thumbnail.png';
    var PER_SLIDE   = 4; /* productos por slide en desktop (2 visibles en mobile) */

    /* ── Imagen principal del producto ─────────────────────────── */
    function getImg(p) {
        if (p.imagen_url && p.imagen_url.startsWith('http')) return p.imagen_url;
        if (p.imagenes && p.imagenes.length > 0)             return p.imagenes[0].url;
        return PLACEHOLDER;
    }

    /* ── Formateador de precio ──────────────────────────────────── */
    function fmt(n) {
        return '$ ' + (+n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /* ── Construir una tarjeta de producto ──────────────────────── */
    function buildCard(p, colClass) {
        var img    = getImg(p);
        var nombre = p.nombre.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var href   = 'sale-product-detail.html?id=' + p.id;

        return [
            '<div class="' + colClass + '">',
            '  <div class="prod-card" style="cursor:pointer;" onclick="location.href=\'' + href + '\'">',
            '    <div class="prod-img-wrap">',
            '      <img loading="lazy" src="' + img + '" alt="' + nombre + '"',
            '           onerror="this.onerror=null;this.src=\'' + PLACEHOLDER + '\'">',
            '    </div>',
            '    <div class="prod-body">',
            '      <div class="prod-price">' + fmt(p.precio) + '</div>',
            '      <div class="prod-name">' + nombre + '</div>',
            '      <a href="' + href + '" class="prod-btn" onclick="event.stopPropagation();">Ver detalles</a>',
            '    </div>',
            '  </div>',
            '</div>',
        ].join('');
    }

    /* ── Construir todos los slides ─────────────────────────────── */
    function buildSlides(products) {
        if (products.length === 0) return '';

        var slides = [];

        for (var i = 0; i < products.length; i += PER_SLIDE) {
            var chunk    = products.slice(i, i + PER_SLIDE);
            var isFirst  = (i === 0);
            var cards    = '';

            chunk.forEach(function (p, idx) {
                /* Los dos últimos slots se ocultan en mobile (d-none d-md-block) */
                var colClass = idx < 2 ? 'col-6 col-md-3' : 'col-6 col-md-3 d-none d-md-block';
                cards += buildCard(p, colClass);
            });

            /* Rellenar con tarjetas vacías si el chunk tiene < 4 productos */
            for (var j = chunk.length; j < PER_SLIDE; j++) {
                var colClass = j < 2 ? 'col-6 col-md-3' : 'col-6 col-md-3 d-none d-md-block';
                cards += '<div class="' + colClass + '"></div>';
            }

            slides.push(
                '<div class="carousel-item' + (isFirst ? ' active' : '') + '">' +
                '  <div class="row g-3">' + cards + '</div>' +
                '</div>'
            );
        }

        return slides.join('');
    }

    /* ── Inicializar/re-inicializar el carousel Bootstrap ───────── */
    function initCarousel() {
        var el = document.getElementById('productosCarousel');
        if (!el) return;
        /* Destruir instancia previa si existe */
        var prev = bootstrap.Carousel.getInstance(el);
        if (prev) prev.dispose();
        new bootstrap.Carousel(el, { interval: 5000, ride: 'carousel' });
    }

    /* ── Renderizar ─────────────────────────────────────────────── */
    function render(products) {
        var inner = document.getElementById('pc-inner');
        if (!inner) return;

        if (products.length === 0) {
            inner.innerHTML =
                '<div class="carousel-item active">' +
                '  <div class="text-center py-5 text-white opacity-75">No hay productos disponibles en este momento.</div>' +
                '</div>';
            initCarousel();
            return;
        }

        inner.innerHTML = buildSlides(products);
        initCarousel();
    }

    /* ── Mostrar/ocultar loading ────────────────────────────────── */
    function setLoading(visible) {
        var el = document.getElementById('pc-loading');
        if (el) el.style.display = visible ? '' : 'none';
        var wrap = document.getElementById('productosCarousel');
        if (wrap) wrap.style.display = visible ? 'none' : '';
    }

    /* ── Fetch productos ────────────────────────────────────────── */
    function loadProducts() {
        setLoading(true);

        fetch(API + '/productos')
            .then(function (res) {
                if (!res.ok) throw new Error('Error ' + res.status);
                return res.json();
            })
            .then(function (body) {
                var products = (body.data || []).filter(function (p) { return p.activo !== false; });
                render(products);
                setLoading(false);
            })
            .catch(function () {
                render([]);
                setLoading(false);
            });
    }

    /* Scripts al final del <body> se ejecutan después de DOMContentLoaded,
       así que readyState ya es 'interactive' o 'complete'. */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadProducts);
    } else {
        loadProducts();
    }
})();
