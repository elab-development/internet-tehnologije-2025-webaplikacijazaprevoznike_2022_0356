const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const CSRF_TOKEN = 'dev-csrf-token';

export function apiFetch(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
    headers['X-CSRF-Token'] = CSRF_TOKEN;
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

export { API_BASE, CSRF_TOKEN };

