/* ============================================================
   Moreh Admin — API Client
   ============================================================ */
const BASE = (window.MOREH_API ?? '') + '/api';

const Api = {
  BASE,
  token: () => localStorage.getItem('moreh_token'),
  setToken: (t) => localStorage.setItem('moreh_token', t),
  clearToken: () => localStorage.removeItem('moreh_token'),

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = Api.token();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      Api.clearToken();
      window.location.href = '../pages/login.html';
      throw new Error('No autenticado');
    }

    const data = await res.json();

    if (!res.ok) {
      const msg = data.message ?? data.error ?? `Error ${res.status}`;
      throw new Error(msg);
    }

    return data.data ?? data;
  },

  get:    (path)        => Api.request('GET',    path),
  post:   (path, body)  => Api.request('POST',   path, body),
  put:    (path, body)  => Api.request('PUT',    path, body),
  patch:  (path, body)  => Api.request('PATCH',  path, body),
  delete: (path)        => Api.request('DELETE', path),
};

window.Api = Api;

// Toast notifications
window.Toast = {
  show(msg, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' : type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' : '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>'}
      </svg>
      <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },
};

// Format helpers
window.fmt = {
  currency: (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0),
  date: (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  dateTime: (d) => d ? new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
};
