import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ---- Request Interceptor: Attach JWT ----
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pocket_pal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor: Handle 401 ----
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pocket_pal_token');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a user-friendly error message from an Axios error.
 */
export function getErrorMessage(error) {
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ');
    }
    return JSON.stringify(detail);
  }
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your connection.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  return error.message || 'An unexpected error occurred.';
}

export default apiClient;
