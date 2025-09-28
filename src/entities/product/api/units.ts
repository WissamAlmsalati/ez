import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api";
import { PRODUCT_PATH, productKeysV2 } from "../api";
import type { ProductUnit } from "../types";

// NOTE: Endpoints are assumed; adjust to match backend if different.
// POST   /products/:productId/units
// PUT    /products/:productId/units/:unitRowId
// DELETE /products/:productId/units/:unitRowId

interface UpsertUnitPayload {
  unit_id: number;
  unit_size: number;
  price: number;
  is_active?: boolean;
}

function extract<T>(data: any): T {
  return (data?.data || data) as T;
}

export function useAddProductUnit(productId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertUnitPayload) => {
      const { data } = await apiInstance.post(
        `${PRODUCT_PATH}/${productId}/units`,
        payload
      );
      return extract<ProductUnit>(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.detail(productId) });
    },
  });
}

export function useUpdateProductUnit(
  productId: number | string,
  unitRowId: number | string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UpsertUnitPayload>) => {
      const { data } = await apiInstance.put(
        `${PRODUCT_PATH}/${productId}/units/${unitRowId}`,
        payload
      );
      return extract<ProductUnit>(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.detail(productId) });
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
        `${PRODUCT_PATH}/${productId}/units/${unitRowId}`
      );
      return extract<{ success: boolean }>(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.detail(productId) });
    },
  });
}
