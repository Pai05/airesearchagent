export function getApiBaseUrl() {
  const candidates = [
    window.__API_BASE_URL__,
    window.API_BASE_URL,
    document.documentElement?.dataset?.apiBaseUrl,
    document.body?.dataset?.apiBaseUrl,
  ];

  const value = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim());
  if (value) {
    return value.trim().replace(/\/$/, '');
  }

  // Fallback to local API server if running on localhost:3000
  if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '3000') {
    return 'http://127.0.0.1:8000';
  }

  return '';
}

export function apiUrl(path) {
  const baseUrl = getApiBaseUrl();
  return new URL(path, baseUrl || window.location.origin).toString();
}