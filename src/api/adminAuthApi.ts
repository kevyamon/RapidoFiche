import { apiClient } from './client';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: string;
}

export interface AdminAuthResponse {
  user: AdminUser;
  accessToken: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AdminRegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  adminPw: string;
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminGoogleAuthDto {
  idToken: string;
  adminPw?: string;
}

export const adminAuthApi = {
  async register(data: AdminRegisterDto): Promise<AdminAuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AdminAuthResponse }>(
      '/admin/auth/register',
      data
    );
    return response.data.data;
  },

  async login(data: AdminLoginDto): Promise<AdminAuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AdminAuthResponse }>(
      '/admin/auth/login',
      data
    );
    return response.data.data;
  },

  async googleAuth(data: AdminGoogleAuthDto): Promise<AdminAuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AdminAuthResponse }>(
      '/admin/auth/google',
      data
    );
    return response.data.data;
  },

  async getAuditLogs(page = 1, limit = 20): Promise<unknown> {
    const response = await apiClient.get('/admin/audit', {
      params: { page, limit },
    });
    return response.data;
  },

  async getDashboardKpis(): Promise<unknown> {
    const response = await apiClient.get('/admin/dashboard/kpis');
    return response.data;
  },
};
