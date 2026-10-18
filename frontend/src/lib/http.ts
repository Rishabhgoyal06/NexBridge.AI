import { supabase } from './supabase';

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/** Resolves Supabase access token or local auth token */
export async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      return data.session.access_token;
    }
  } catch (err) {
    // Session retrieval error fallback
  }
  return localStorage.getItem('nexbridge_token');
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = await getAccessToken();
  if (token) {
    (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorBody = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorBody);
      } catch {
        parsedError = { message: errorBody || `HTTP error! status: ${response.status}` };
      }
      throw new Error(parsedError.message || parsedError.detail || `Request failed with status ${response.status}`);
    }

    const json = await response.json();
    return json as T;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/** Helper to simulate network latency for mock services */
export function delay(min = 400, max = 900): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
