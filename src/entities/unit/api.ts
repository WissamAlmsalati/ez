import { buildListQuery, catalogKeys } from "@/entities/catalog/api";
import type { Unit } from "./types";
import type { ListParams } from "@/entities/catalog/types";
import { mapUnitApi } from "@/entities/catalog/mapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api";

export const UNIT_PATH = "/units"; // assuming endpoint

export const unitKeys = {
  ...catalogKeys,
  base: () => catalogKeys.byPath(UNIT_PATH),
  list: (params?: ListParams) => catalogKeys.list(UNIT_PATH, params),
};

export const useUnitsQuery = buildListQuery<Unit>(UNIT_PATH, mapUnitApi);

// Create Unit (JSON payload)
export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      symbol?: string | null;
      description?: string | null;
      is_active?: boolean;
    }) => {
      const { data } = await apiInstance.post(UNIT_PATH, payload, {
        headers: { Accept: "application/json" },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: unitKeys.base() });
    },
  });
}

// Update Unit (PUT JSON)
export function useUpdateUnit(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      symbol?: string | null;
      description?: string | null;
      is_active?: boolean;
    }) => {
      const { data } = await apiInstance.put(`${UNIT_PATH}/${id}`, payload, {
        headers: { Accept: "application/json" },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: unitKeys.base() });
    },
  });
}

// Delete Unit
export function useDeleteUnit(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.delete(`${UNIT_PATH}/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: unitKeys.base() });
    },
  });
}
