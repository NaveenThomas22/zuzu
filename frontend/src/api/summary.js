import apiClient from './client';

/**
 * GET /api/summary
 * @param {object} [params] - { start_date?, end_date? }
 * @returns {Promise<{ opening_balance, total_income, total_expense, total_lending_out, total_lending_repayment, total_investment, total_refund, current_balance }>}
 */
export function getSummary(params = {}) {
  return apiClient.get('/api/summary', { params });
}
