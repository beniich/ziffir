const BASE_URL = 'http://localhost:5000/api';

export async function fetchJson(endpoint: string, options?: RequestInit) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error on ${endpoint}: ${response.statusText}`);
  }

  return response.json();
}
