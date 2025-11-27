import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api";
import { PRODUCT_PATH, productKeysV2 } from "../api";
import type { ProductUnit } from "../types";

// NOTE: Endpoints are assumed; adjust to match backend if different.
// POST   /products/:productId/units
// PUT    /products/:productId/units/:unitRowId
// DELETE /products/:productId/units/:unitRowId

interface CreateUnitJsonPayload {
  unit_id: number;
  price: number;
  min_qty: number;
  step_qty: number;
  is_default?: boolean;
}

function extract<T>(data: any): T {
  return (data?.data || data) as T;
}

// API response shape for units listing under a product
export interface ProductUnitRowApi {
  id: number;
  productId: number;
  unitId: number;
  unit: null | { id: number; name: string; symbol?: string };
  price: string | number;
  formattedPrice?: string;
  minQty?: string | number;
  stepQty?: string | number;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useProductUnits(productId: number | string | undefined) {
  return useQuery({
    queryKey: productId
      ? [...productKeysV2.detail(productId), "units"]
      : [PRODUCT_PATH, "detail", null, "units"],
    enabled: !!productId,
    queryFn: async () => {
      const { data } = await apiInstance.get(
        `dashboard/products/${productId}/units`
      );
      return extract<ProductUnitRowApi[]>(data);
    },
  });
}

export function useAddProductUnit(productId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUnitJsonPayload) => {
      const { data } = await apiInstance.post(
        `dashboard/products/${productId}/units`,
        payload
      );
      return extract<ProductUnit>(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.detail(productId) });
      qc.invalidateQueries({
        queryKey: [...productKeysV2.detail(productId), "units"],
      });
    },
  });
}

export function useUpdateProductUnit(
  productId: number | string,
  unitRowId: number | string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CreateUnitJsonPayload>) => {
      const { data } = await apiInstance.put(
        `dashboard/products/${productId}/units/${unitRowId}`,
        payload
      );
      return extract<ProductUnit>(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.detail(productId) });
      qc.invalidateQueries({
        queryKey: [...productKeysV2.detail(productId), "units"],
      });
    },
  });
}

export function useDeleteProductUnit(
  productId: number | string,
  unitRowId: number | string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.delete(
        `dashboard/products/${productId}/units/${unitRowId}`
      );
      return extract<{ success: boolean }>(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.detail(productId) });
      qc.invalidateQueries({
        queryKey: [...productKeysV2.detail(productId), "units"],
      });
    },
  });
}
