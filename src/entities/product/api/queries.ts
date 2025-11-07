// src/entities/product/api/queries.ts
import { apiInstance } from '@/shared/api';
import type { GetProductsParams, ProductsApiResponse } from './types';

// كائن لتمرير الفلاتر مثل البحث أو التصفح

export const getProducts = async (params: GetProductsParams): Promise<ProductsApiResponse> => {
  // لاحظ كيف يتم تمرير params إلى axios، الذي سيقوم بتحويلها إلى query string
  // مثال: /api/products?search=...&page=...
  const response = await apiInstance.get<ProductsApiResponse>('/products', {
    params,
  });
  // الـ API الخاص بك يضع الأصناف داخل حقل 'data'
  return response.data;
};