// src/shared/api/client.ts

const API_BASE = 'http://localhost:5000/api';
export const WS_URL = 'ws://localhost:5000/ws';

interface FetchOptions extends RequestInit {
  body?: any;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers);
  
  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body) {
    headers.set('Content-Type', 'application/json');
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || `HTTP error! status: ${response.status}`);
  }

  return json.data as T;
}
