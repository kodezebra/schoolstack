import { API_URL } from '@/config';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const baseUrl = API_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  const url = path.startsWith('http') ? path : `${baseUrl}/${cleanPath}`;
  
  const headers: any = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    // Default to include for auth cookies
    credentials: options.credentials || 'include',
  });

  return response;
}
