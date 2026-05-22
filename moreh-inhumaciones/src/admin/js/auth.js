/* ============================================================
   Moreh Admin — Auth & Layout
   ============================================================ */

// Proteger todas las páginas excepto login.html
const PUBLIC_PAGES = ['login.html'];
const currentPage = location.pathname.split('/').pop();
if (!PUBLIC_PAGES.includes(currentPage) && !Api.token()) {
  location.href = 'login.html';
}

// Cargar datos del usuario en el sidebar
async function loadUserInfo() {
  try {
    const user = await Api.get('/auth/me');
    const name = user.nombre ?? user.email ?? '';
    const email = user.email ?? '';
    const initials = name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
    if (window.AdminLayout) window.AdminLayout.setUser(name, email, initials);
  } catch {}
}

// Logout
function logout() {
  Api.clearToken();
  location.href = 'login.html';
}

// Sidebar toggle (mobile)
function initSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

// Mark active link
function markActiveLink() {
  const page = location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop();
    link.classList.toggle('active', href === page);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  markActiveLink();
  if (Api.token()) loadUserInfo();
  document.getElementById('btn-logout')?.addEventListener('click', logout);
});
