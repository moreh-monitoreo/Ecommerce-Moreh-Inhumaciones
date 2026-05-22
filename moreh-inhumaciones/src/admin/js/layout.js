/* ============================================================
   Moreh Admin · Variante B
   layout.js — inyecta sidebar + topbar en cada página
   Drop-in para src/admin/js/layout.js
   ============================================================ */
(function () {
  'use strict';

  // ── Página activa (nombre del archivo HTML) ──
  const PAGE = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();

  // ── Estructura del menú ──
  const NAV = [
    { section: 'Principal' },
    { href: 'dashboard.html',  icon: 'grid',    label: 'Dashboard' },

    { section: 'Catálogos' },
    { href: 'productos.html',  icon: 'package', label: 'Productos',   count: 142 },
    { href: 'categorias.html', icon: 'tag',     label: 'Categorías' },
    { href: 'inventario.html', icon: 'layers',  label: 'Inventario' },

    { section: 'Operaciones' },
    { href: 'ordenes.html',    icon: 'cart',    label: 'Órdenes',     count: 38 },
    { href: 'contratos.html',  icon: 'file',    label: 'Contratos',   count: 12 },
    { href: 'clientes.html',   icon: 'users',   label: 'Clientes' },
    { href: 'leads.html',      icon: 'inbox',   label: 'Leads',       dot: true },

    { section: 'Administración' },
    { href: 'sucursales.html', icon: 'pin',     label: 'Sucursales' },
    { href: 'usuarios.html',   icon: 'user',    label: 'Usuarios' },
    { href: 'roles.html',      icon: 'shield',  label: 'Roles y permisos' },

    { section: 'Contenido' },
    { href: 'cms.html',        icon: 'image',   label: 'CMS / Banners' },
    { href: 'reportes.html',   icon: 'bar',     label: 'Reportes' },
    { href: 'auditoria.html',  icon: 'clock',   label: 'Auditoría' },
  ];

  // ── Set de iconos SVG (single-stroke, 24×24) ──
  const ICONS = {
    grid:    '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    package: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    tag:     '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    layers:  '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    cart:    '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    file:    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    users:   '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    inbox:   '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    pin:     '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    user:    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    shield:  '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    image:   '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    bar:     '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    clock:   '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',

    logout:    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    bell:      '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    search:    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    menu:      '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    chevronD:  '<polyline points="6 9 12 15 18 9"/>',
    chevronR:  '<polyline points="9 18 15 12 9 6"/>',
    dots:      '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  };

  function svg(name, size) {
    size = size || 14;
    const body = ICONS[name] || '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="1.7"
      stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  }

  // ── Construye los links del menú ──
  function buildNav() {
    return NAV.map(item => {
      if (item.section) {
        return `<div class="sidebar-section-label">${item.section}</div>`;
      }
      const active = item.href === PAGE ? ' active' : '';
      const trailing = item.count != null
        ? `<span class="sidebar-link-count">${item.count}</span>`
        : (item.dot ? `<span class="sidebar-link-dot" aria-label="Nuevo"></span>` : '');
      return `
        <a href="${item.href}" class="sidebar-link${active}" data-page="${item.href}">
          ${svg(item.icon, 14)}
          <span>${item.label}</span>
          ${trailing}
        </a>`;
    }).join('');
  }

  // ── Sidebar markup ──
  const sidebarHTML = `
    <aside class="admin-sidebar" id="admin-sidebar">
      <div class="sidebar-head">
        <div class="sidebar-mark">M</div>
        <div class="sidebar-org">
          <span class="sidebar-org-name">Moreh</span>
          <span class="sidebar-org-pill">Admin</span>
        </div>
        <span class="sidebar-org-chevron">${svg('chevronD', 12)}</span>
      </div>

      <div class="sidebar-search" id="sidebar-search">
        ${svg('search', 12)}
        <input type="search" placeholder="Buscar..." aria-label="Buscar en el panel" />
        <span class="kbd">⌘K</span>
      </div>

      <nav class="sidebar-nav" id="sidebar-nav" aria-label="Navegación principal">
        ${buildNav()}
      </nav>

      <div class="sidebar-foot">
        <div class="sidebar-avatar" id="sidebar-avatar">LM</div>
        <div class="sidebar-user">
          <span class="sidebar-user-name" id="sidebar-user-name">Laura Méndez</span>
          <span class="sidebar-user-mail" id="sidebar-user-mail">laura@moreh.mx</span>
        </div>
        <button class="sidebar-user-menu" id="btn-user-menu" aria-label="Menú de usuario">${svg('dots', 13)}</button>
      </div>
    </aside>`;

  // ── Topbar markup ──
  const topbarHTML = `
    <header class="admin-topbar">
      <button class="icon-btn" id="sidebar-toggle" aria-label="Abrir menú">${svg('menu', 16)}</button>
      <div class="topbar-crumb">
        <span>Moreh</span>
        ${svg('chevronR', 11)}
        <b id="topbar-page-title">Panel</b>
      </div>
      <div class="topbar-right">
        <button class="btn btn-ghost" id="btn-cmdk">
          ${svg('search', 12)}
          <span>Buscar...</span>
          <span class="kbd" style="margin-left:4px;">⌘K</span>
        </button>
        <button class="icon-btn" id="btn-notifs" aria-label="Notificaciones">
          ${svg('bell', 14)}
          <span class="bell-dot"></span>
        </button>
        <div style="position:relative;">
          <button class="icon-btn" id="btn-more" aria-label="Más opciones">${svg('dots', 14)}</button>
          <div id="topbar-menu" style="
            display:none; position:absolute; right:0; top:calc(100% + 6px);
            background:var(--surface); border:1px solid var(--border);
            border-radius:var(--r-lg); box-shadow:0 4px 16px rgba(0,0,0,0.08);
            min-width:180px; z-index:200; overflow:hidden;">
            <div style="padding:10px 12px 8px; border-bottom:1px solid var(--border-soft);">
              <div id="topbar-menu-name" style="font-size:12.5px; font-weight:600; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
              <div id="topbar-menu-mail" style="font-size:11px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
            </div>
            <button id="btn-logout" style="
              display:flex; align-items:center; gap:8px; width:100%;
              padding:9px 12px; background:transparent; border:0;
              font-size:12.5px; color:var(--red,#b91c1c); cursor:pointer;
              text-align:left;">
              ${svg('logout', 13)}
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>`;

  // ── Inyectar al DOM ──
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML + topbarHTML);

  // ── Estilos pequeños (mobile toggle button visibility) ──
  const toggleStyle = document.createElement('style');
  toggleStyle.textContent = `
    #sidebar-toggle { display: none; margin-right: 8px; }
    @media (max-width: 768px) { #sidebar-toggle { display: inline-flex; } }
  `;
  document.head.appendChild(toggleStyle);

  // ── Comportamiento: toggle mobile sidebar ──
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // ── Dropdown del botón "más opciones" (cerrar sesión) ──
  const btnMore = document.getElementById('btn-more');
  const topbarMenu = document.getElementById('topbar-menu');
  if (btnMore && topbarMenu) {
    btnMore.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = topbarMenu.style.display === 'block';
      topbarMenu.style.display = open ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
      if (!topbarMenu.contains(e.target) && e.target !== btnMore) {
        topbarMenu.style.display = 'none';
      }
    });
  }

  // ── Cerrar sesión ──
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('moreh_token');
      location.href = 'login.html';
    });
  }

  // ── Cmd/Ctrl + K activa el buscador del sidebar ──
  document.addEventListener('keydown', (e) => {
    const isMod = e.metaKey || e.ctrlKey;
    if (isMod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.querySelector('#sidebar-search input');
      if (input) input.focus();
    }
  });

  // ── Filtrado en vivo del menú al escribir en búsqueda ──
  const searchInput = document.querySelector('#sidebar-search input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      document.querySelectorAll('.sidebar-link').forEach(link => {
        const text = link.textContent.toLowerCase();
        link.style.display = !q || text.includes(q) ? '' : 'none';
      });
    });
  }

  // ── Helper opcional para que las páginas seteen el breadcrumb ──
  window.AdminLayout = {
    setPageTitle(title) {
      const el = document.getElementById('topbar-page-title');
      if (el) el.textContent = title;
      document.title = title + ' · Moreh Admin';
    },
    setUser(name, email, initials) {
      const n = document.getElementById('sidebar-user-name');
      const e = document.getElementById('sidebar-user-mail');
      const a = document.getElementById('sidebar-avatar');
      if (n) n.textContent = name;
      if (e) e.textContent = email;
      if (a) a.textContent = initials || (name || '?').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
      const mn = document.getElementById('topbar-menu-name');
      const me = document.getElementById('topbar-menu-mail');
      if (mn) mn.textContent = name;
      if (me) me.textContent = email;
    },
  };
})();
