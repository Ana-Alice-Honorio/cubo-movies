const DEFAULT_API_URL = 'http://localhost:3001';

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
}

export function buildApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`;
}

export async function parseApiError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ignore JSON parse errors and fallback to status text.
  }

  return response.statusText || 'Erro inesperado na requisição';
}