// src/entities/product/lib/use-products-query.ts
import { useQuery } from '@tanstack/react-query';
import { getProducts,  } from '../api/queries';
import { productKeys } from '../model/keys';
import { GetProductsParams } from '../api/types';

export const useProductsQuery = (params: GetProductsParams) => {
  return useQuery({
    // المفتاح الديناميكي من المصنع
    queryKey: productKeys.list(params),
    // الدالة التي ستجلب البيانات
    queryFn: () => getProducts(params),
  });
};