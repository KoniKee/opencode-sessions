const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:9001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data as T;
}

export const api = {
  projects: {
    list: () => fetchApi<import('../types').Project[]>('/projects'),
    get: (id: string) => fetchApi<import('../types').Project>(`/projects/${id}`),
    getStats: () => fetchApi<{ overview: import('../types').ProjectStats }>('/projects/stats/overview'),
  },

  sessions: {
    list: (projectId: string) =>
      fetchApi<import('../types').SessionTreeNode[]>(`/sessions/project/${projectId}`),
    get: (id: string) => fetchApi<import('../types').Session>(`/sessions/${id}`),
    getMessages: (id: string) => fetchApi<import('../types').Message[]>(`/sessions/${id}/messages`),
    getDiff: (id: string) => fetchApi<import('../types').DiffFile[]>(`/sessions/${id}/diff`),
    getChildren: (id: string) => fetchApi<import('../types').Session[]>(`/sessions/${id}/children`),
    getTree: (id: string) => fetchApi<import('../types').SessionTreeNode>(`/sessions/${id}/tree`),
    getStats: (id: string) => fetchApi<import('../types').SessionStats>(`/sessions/${id}/stats`),
    update: (id: string, title: string) =>
      fetchApi<void>(`/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title }),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/sessions/${id}`, { method: 'DELETE' }),
    batchDelete: (ids: string[]) =>
      fetchApi<{ success: number; failed: number }>(`/sessions/batch-delete`, {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
  },

  config: {
    getDatabase: () => fetchApi<{ path: string; exists: boolean; connected: boolean }>('/config/database'),
    testDatabase: (path: string) =>
      fetchApi<{ path: string; exists: boolean; message: string }>('/config/database/test', {
        method: 'POST',
        body: JSON.stringify({ path }),
      }),
    updateDatabase: (path: string) =>
      fetchApi<{ path: string }>('/config/database', {
        method: 'PUT',
        body: JSON.stringify({ path }),
      }),
  },
};

export default api;
