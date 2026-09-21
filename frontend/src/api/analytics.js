import apiClient from './client';

/**
 * GET /api/analytics
 * @param {object} [params] - { start_date?, end_date? }
 * @returns {Promise<{ overview, income_vs_expense, expense_by_category, expense_by_subcategory, monthly_income_expense, account_summary, budget_vs_actual, lending, bills }>}
 */
export function getAnalytics(params = {}) {
  return apiClient.get('/api/analytics', { params });
}
