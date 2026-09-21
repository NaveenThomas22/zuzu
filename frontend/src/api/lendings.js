import apiClient from './client';

/** POST /api/lendings */
export function createLending(data) {
  return apiClient.post('/api/lendings', data);
}

/**
 * GET /api/lendings
 * @param {object} [params] - { status_?, start_date?, end_date? }
 */
export function listLendings(params = {}) {
  return apiClient.get('/api/lendings', { params });
}

/** GET /api/lendings/:id */
export function getLending(lendingId) {
  return apiClient.get(`/api/lendings/${lendingId}`);
}

/** PUT /api/lendings/:id */
export function updateLending(lendingId, data) {
  return apiClient.put(`/api/lendings/${lendingId}`, data);
}

/** DELETE /api/lendings/:id */
export function deleteLending(lendingId) {
  return apiClient.delete(`/api/lendings/${lendingId}`);
}

// ---- Repayments ----

/** POST /api/lendings/:id/repayments */
export function createRepayment(lendingId, data) {
  return apiClient.post(`/api/lendings/${lendingId}/repayments`, data);
}

/** GET /api/lendings/:id/repayments */
export function listRepayments(lendingId) {
  return apiClient.get(`/api/lendings/${lendingId}/repayments`);
}

/** GET /api/lendings/:lid/repayments/:rid */
export function getRepayment(lendingId, repaymentId) {
  return apiClient.get(`/api/lendings/${lendingId}/repayments/${repaymentId}`);
}

/** PUT /api/lendings/:lid/repayments/:rid */
export function updateRepayment(lendingId, repaymentId, data) {
  return apiClient.put(`/api/lendings/${lendingId}/repayments/${repaymentId}`, data);
}

/** DELETE /api/lendings/:lid/repayments/:rid */
export function deleteRepayment(lendingId, repaymentId) {
  return apiClient.delete(`/api/lendings/${lendingId}/repayments/${repaymentId}`);
}
