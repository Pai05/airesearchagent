import { apiUrl } from './runtime.js';

export async function searchPapers(topic, limit = 50, sources = []) {
  try {
    const sourcesParam = sources.length > 0 ? `&sources=${sources.join(',')}` : '';
    const url = apiUrl(`/api/search?topic=${encodeURIComponent(topic)}&limit=${limit}${sourcesParam}`);
    console.log('Fetching from URL:', url);
    const token = localStorage.getItem('auth_token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Fetch response status:', response.status);
      if (!response.ok) {
      let message = "could not reach backend. Check the deployed API URL or backend status.";
      try {
        const errorPayload = await response.json();
        if (errorPayload?.detail) {
          message = String(errorPayload.detail);
        }
      } catch {
        // Keep default message when error body is not JSON.
      }
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error?.message || "could not reach backend. Check the deployed API URL or backend status.");
  }
}
