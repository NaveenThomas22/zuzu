import apiClient from './client';

export function getCategories() {
  return apiClient.get('/api/categories');
}

export function getCategorySubcategories(categoryId) {
  return apiClient.get(`/api/categories/${categoryId}/subcategories`);
}
