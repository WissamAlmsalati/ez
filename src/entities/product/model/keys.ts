// src/entities/product/model/keys.ts
import { GetProductsParams } from '../api/types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  // المفتاح سيتغير بناءً على الفلاتر، مما يضمن تخزين كل بحث بشكل منفصل
  list: (filters: GetProductsParams) => [...productKeys.lists(), filters] as const,
};