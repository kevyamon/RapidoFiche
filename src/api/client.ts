import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const API_BASE_URL = rawBaseUrl.endsWith('/api/v1')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// 1. Intercepteur de Requête : Injection du Jeton d'Accès
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAdminEndpoint = config.url?.startsWith('/admin');
    const adminToken = localStorage.getItem('rapidofiche_admin_token');
    const userToken = localStorage.getItem('rapidofiche_access_token');
    
    const token = isAdminEndpoint ? (adminToken || userToken) : (userToken || adminToken);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Intercepteur de Réponse : Rafraîchissement Silencieux du Token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: { code?: string; message?: string } }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register');

    if (
      error.response?.status === 401 &&
      !isAuthRoute &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('rapidofiche_access_token', newAccessToken);
          if (localStorage.getItem('rapidofiche_admin_token')) {
            localStorage.setItem('rapidofiche_admin_token', newAccessToken);
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('rapidofiche_access_token');
        localStorage.removeItem('rapidofiche_user');
        localStorage.removeItem('rapidofiche_admin_token');
        localStorage.removeItem('rapidofiche_admin_user');
        window.dispatchEvent(new CustomEvent('rapidofiche_session_expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
