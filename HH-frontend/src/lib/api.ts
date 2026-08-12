const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export { API_BASE };

interface ApiOptions extends RequestInit {
  json?: unknown;
}

async function request<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { json, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(json);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', json: body }),

  postForm: async <T = unknown>(path: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorBody.detail || `API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
  },

  getBlob: async (path: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    return res.blob();
  },
};
