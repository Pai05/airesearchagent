import { apiUrl } from './runtime.js';

export async function searchPapers(topic, limit = 50, sources = []) {
  try {
    const sourcesParam = sources.length > 0 ? `&sources=${sources.join(',')}` : '';
    const url = apiUrl(`/api/search?topic=${encodeURIComponent(topic)}&limit=${limit}${sourcesParam}`);
    console.log('Fetching from URL:', url);
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Fetch response status:', response.status);
    console.log('Fetch response headers:', {
      'content-type': response.headers.get('content-type'),
      'access-control-allow-origin': response.headers.get('access-control-allow-origin')
    });
    
    if (!response.ok) {
      let message = `Backend returned ${response.status}. Check the deployed API URL or backend status.`;
      try {
        const errorPayload = await response.json();
        if (errorPayload?.detail) {
          message = String(errorPayload.detail);
        }
      } catch {
        // Keep default message when error body is not JSON
      }
      throw new Error(message);
    }
    
    const data = await response.json();
    console.log('Parsed response data:', data);
    
    if (!data.papers || !Array.isArray(data.papers)) {
      throw new Error('Invalid response format: expected papers array');
    }
    
    return data;
    
  } catch (error) {
    console.error('Search error details:', error);
    throw new Error(error?.message || "could not reach backend. Check the deployed API URL or backend status.");
  }
}
