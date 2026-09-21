import apiClient from './client';

/**
 * POST /api/transactions
 * @param {object} data - { account_id?, transaction_date, transaction_type, category_id?, subcategory_id?, item_name?, amount, need_or_want?, description? }
 */
export function createTransaction(data) {
  return apiClient.post('/api/transactions', data);
}

/**
 * GET /api/transactions
 * @param {object} [params] - { transaction_type?, account_id?, category_id?, subcategory_id?, start_date?, end_date? }
 */
export function listTransactions(params = {}) {
  return apiClient.get('/api/transactions', { params });
}

/** GET /api/transactions/:id */
export function getTransaction(transactionId) {
  return apiClient.get(`/api/transactions/${transactionId}`);
}

/** PUT /api/transactions/:id */
export function updateTransaction(transactionId, data) {
  return apiClient.put(`/api/transactions/${transactionId}`, data);
}

/** DELETE /api/transactions/:id */
export function deleteTransaction(transactionId) {
  return apiClient.delete(`/api/transactions/${transactionId}`);
}
