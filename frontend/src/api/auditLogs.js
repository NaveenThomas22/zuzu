import apiClient from './client';

/**
 * GET /api/audit-logs
 * @param {object} [params] - { entity_type?, entity_id?, action?, start_date?, end_date?, page?, page_size? }
 */
export function listAuditLogs(params = {}) {
  return apiClient.get('/api/audit-logs', { params });
}
