const BASE_URL = "http://localhost:8000";

export async function searchPapers(topic, limit = 50) {
  try {
    const url = `${BASE_URL}/api/search?topic=${encodeURIComponent(topic)}&limit=${limit}`;
    console.log('Fetching from URL:', url);
    const response = await fetch(url);
    console.log('Fetch response status:', response.status);
    if (!response.ok) {
      let message = "could not reach backend. Make sure the server is running at localhost:8000";
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
    throw new Error(error?.message || "could not reach backend. Make sure the server is running at localhost:8000");
  }
}
