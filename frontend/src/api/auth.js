import apiClient from './client';

/**
 * POST /api/auth/register
 * @param {{ name: string, email: string, password: string, confirm_password: string, gender: string }} data
 */
export function registerUser(data) {
  return apiClient.post('/api/auth/register', data);
}

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ access_token: string, token_type: string }>}
 */
export function loginUser(credentials) {
  return apiClient.post('/api/auth/login', credentials);
}

/**
 * GET /api/auth/me
 * @returns {Promise<{ id, name, email, gender, is_active, created_at, updated_at }>}
 */
export function getCurrentUser() {
  return apiClient.get('/api/auth/me');
}
