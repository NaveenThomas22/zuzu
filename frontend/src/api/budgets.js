import apiClient from './client';

/** POST /api/budgets */
export function createBudget(data) {
  return apiClient.post('/api/budgets', data);
}

/**
 * GET /api/budgets
 * @param {object} [params] - { year?, month?, category_id? }
 */
export function listBudgets(params = {}) {
  return apiClient.get('/api/budgets', { params });
}

/** GET /api/budgets/:id */
export function getBudget(budgetId) {
  return apiClient.get(`/api/budgets/${budgetId}`);
}

/** PUT /api/budgets/:id */
export function updateBudget(budgetId, data) {
  return apiClient.put(`/api/budgets/${budgetId}`, data);
}

/** DELETE /api/budgets/:id */
export function deleteBudget(budgetId) {
  return apiClient.delete(`/api/budgets/${budgetId}`);
}
