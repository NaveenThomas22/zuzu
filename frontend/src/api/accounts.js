import apiClient from './client';

/** POST /api/accounts */
export function createAccount(data) {
  return apiClient.post('/api/accounts', data);
}

/** GET /api/accounts */
export function listAccounts() {
  return apiClient.get('/api/accounts');
}

/** GET /api/accounts/:id */
export function getAccount(accountId) {
  return apiClient.get(`/api/accounts/${accountId}`);
}

/** PUT /api/accounts/:id */
export function updateAccount(accountId, data) {
  return apiClient.put(`/api/accounts/${accountId}`, data);
}

/** DELETE /api/accounts/:id */
export function deleteAccount(accountId) {
  return apiClient.delete(`/api/accounts/${accountId}`);
}
