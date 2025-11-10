// src/api.js
const API_BASE = import.meta.env.VITE_API_URL || '';

function buildUrl(path) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export async function apiFetch(path, opts = {}) {
  const headers = Object.assign({}, opts.headers || {});
  if (opts.body && !(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = buildUrl(path);
  const fetchOpts = Object.assign({}, opts, { headers });

  if (fetchOpts.body && typeof fetchOpts.body === 'object' && !(fetchOpts.body instanceof FormData)) {
    fetchOpts.body = JSON.stringify(fetchOpts.body);
  }

  const res = await fetch(url, fetchOpts);
  const text = await res.text();
  const cType = res.headers.get('content-type') || '';
  const data = cType.includes('application/json') && text ? JSON.parse(text) : text;

  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}
