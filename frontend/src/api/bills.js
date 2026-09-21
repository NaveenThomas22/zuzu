import apiClient from './client';

/** POST /api/bills */
export function createBill(data) {
  return apiClient.post('/api/bills', data);
}

/**
 * GET /api/bills
 * @param {object} [params] - { status?, bill_type?, frequency?, start_date?, end_date? }
 */
export function listBills(params = {}) {
  return apiClient.get('/api/bills', { params });
}

/** GET /api/bills/:id */
export function getBill(billId) {
  return apiClient.get(`/api/bills/${billId}`);
}

/** PUT /api/bills/:id */
export function updateBill(billId, data) {
  return apiClient.put(`/api/bills/${billId}`, data);
}

/** DELETE /api/bills/:id */
export function deleteBill(billId) {
  return apiClient.delete(`/api/bills/${billId}`);
}

/** POST /api/bills/:id/pay */
export function payBill(billId, data = {}) {
  return apiClient.post(`/api/bills/${billId}/pay`, data);
}

/** POST /api/bills/:id/cancel */
export function cancelBill(billId) {
  return apiClient.post(`/api/bills/${billId}/cancel`);
}
