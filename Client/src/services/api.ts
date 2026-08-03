// Base API Client & Services module for Client-Server communication

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return envUrl || 'http://localhost:5000/api';
    }
    // Auto-detect local Wi-Fi LAN IP (e.g. 192.168.x.x) for phone/laptop connectivity
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) {
      return `http://${host}:5000/api`;
    }
  }
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('svv_token');
  }

  public setToken(token: string) {
    localStorage.setItem('svv_token', token);
  }

  public removeToken() {
    localStorage.removeItem('svv_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type') || '';
      let data: any = {};

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          if (!response.ok) {
            throw new Error(`Server connection error (${response.status}). Please ensure backend API is running.`);
          }
          throw new Error('Invalid response format received from server.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `API Error (${response.status})`);
      }

      return data as T;
    } catch (error: any) {
      if (error?.message === 'Failed to fetch' || error?.name === 'TypeError') {
        if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http:')) {
          throw new Error('Mixed Content Block: Web App (HTTPS) cannot request insecure local HTTP server (localhost:5000). Please ensure backend server API URL is configured with HTTPS on Render.');
        }
        throw new Error('Network Connection Failed: Backend server is unreachable or offline.');
      }
      throw error;
    }
  }


  public get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public patch<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Service Helper Modules
export const authService = {
  login: (data: { phone: string; password: string }) => api.post<{ success: boolean; token: string; user: any }>('/auth/login', data),
  register: (data: any) => api.post<{ success: boolean; token: string; user: any }>('/auth/register', data),
  getProfile: () => api.get<{ success: boolean; user: any }>('/auth/profile'),
  updateProfile: (data: any) => api.put<{ success: boolean; user: any }>('/auth/profile', data)
};

export const studentService = {
  getAll: () => api.get<{ success: boolean; data: any[] }>('/students'),
  create: (data: any) => api.post<{ success: boolean; data: any }>('/students', data),
  update: (id: string, data: any) => api.put<{ success: boolean; data: any }>(`/students/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/students/${id}`)
};

export const staffService = {
  getAll: () => api.get<{ success: boolean; data: any[] }>('/staff'),
  create: (data: any) => api.post<{ success: boolean; data: any }>('/staff', data),
  update: (id: string, data: any) => api.put<{ success: boolean; data: any }>(`/staff/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/staff/${id}`)
};

export const attendanceService = {
  getAttendance: (params?: { classId?: string; sectionId?: string; date?: string; studentId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get<{ success: boolean; data: any[] }>(`/attendance${query ? `?${query}` : ''}`);
  },
  submit: (records: any[]) => api.post<{ success: boolean; data: any[] }>('/attendance/submit', { records }),
  update: (id: string, status: string, remarks?: string) => api.put<{ success: boolean; data: any }>(`/attendance/${id}`, { status, remarks })
};

export const leaveService = {
  getAll: () => api.get<{ success: boolean; data: any[] }>('/leaves'),
  apply: (data: any) => api.post<{ success: boolean; data: any }>('/leaves', data),
  updateStatus: (id: string, status: string, remarks?: string) => api.patch<{ success: boolean; data: any }>(`/leaves/${id}/status`, { status, remarks })
};

export const announcementService = {
  getAll: () => api.get<{ success: boolean; data: any[] }>('/announcements'),
  create: (data: any) => api.post<{ success: boolean; data: any }>('/announcements', data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/announcements/${id}`)
};

export const classService = {
  getAll: () => api.get<{ success: boolean; data: any[] }>('/classes'),
  create: (data: { name: string; sections?: string[] }) => api.post<{ success: boolean; data: any }>('/classes', data),
  update: (id: string, data: { name?: string; sections?: any[] }) => api.put<{ success: boolean; data: any }>(`/classes/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/classes/${id}`)
};

export const settingService = {
  get: () => api.get<{ success: boolean; data: any }>('/settings'),
  update: (data: any) => api.put<{ success: boolean; data: any }>('/settings', data)
};

export default api;

