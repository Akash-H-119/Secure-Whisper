// src/api.ts
const API_BASE = import.meta.env.VITE_API_URL || '';

function buildUrl(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = { ...(opts.headers as any) };

  if (opts.body && !(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = buildUrl(path);
  const fetchOpts: RequestInit = { ...opts, headers };

  if (fetchOpts.body && typeof fetchOpts.body === 'object' && !(fetchOpts.body instanceof FormData)) {
    fetchOpts.body = JSON.stringify(fetchOpts.body);
  }

  const res = await fetch(url, fetchOpts);
  const text = await res.text();
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson && text ? JSON.parse(text) : text;

  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${JSON.stringify(data)}`);
  }

  return data;
}
