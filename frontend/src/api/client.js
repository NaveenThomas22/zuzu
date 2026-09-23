import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

// Create a separate Axios instance for refresh to avoid interceptor loops
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

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
  async (error) => {
    const originalRequest = error.config;
    
    // Ignore 401s for login/logout (refresh is handled by a separate client anyway)
    if (
      originalRequest.url === '/api/auth/login' ||
      originalRequest.url === '/api/auth/logout' ||
      originalRequest.url === '/api/auth/refresh'
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          // Call refresh endpoint with separate client
          const res = await refreshClient.post('/api/auth/refresh');
          const newToken = res.data.access_token;
          
          localStorage.setItem('pocket_pal_token', newToken);
          
          isRefreshing = false;
          onRefreshed(newToken);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          localStorage.removeItem('pocket_pal_token');
          // Redirect to login if not already there
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
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

