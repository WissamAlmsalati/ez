import {
  buildListQuery,
  buildToggleMutation,
  catalogKeys,
} from "@/entities/catalog/api";
import type { ListParams } from "@/entities/catalog/types";
import type { User } from "./types";
import { mapUserApi } from "@/entities/catalog/mapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api";
import { notFound } from "next/navigation";

export const USERS_PATH = "/users";

export const userKeys = {
  ...catalogKeys,
  base: () => catalogKeys.byPath(USERS_PATH),
  list: (params?: ListParams) => catalogKeys.list(USERS_PATH, params),
  detail: (id: number | string) => catalogKeys.detail(USERS_PATH, id),
};

export const useUsersQuery = buildListQuery<User>(USERS_PATH, mapUserApi);

export function useUserDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: id ? userKeys.detail(id) : [USERS_PATH, "detail", null],
    enabled: !!id,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const { data } = await apiInstance.get(`${USERS_PATH}/${id}`);
        return mapUserApi(data.data ?? data);
      } catch (e: any) {
        if (e?.response?.status === 404) notFound();
        throw e;
      }
    },
  });
}

export const useToggleUser = buildToggleMutation<User>(USERS_PATH);

export function useUpdateUser(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<User>) => {
      const { data } = await apiInstance.post(`${USERS_PATH}/${id}`, payload);
      return data;
    },
    onMutate: async (variables) => {
      // Optimistic toggle for is_active only
      const keys = Object.keys(variables || {});
      if (keys.length === 1 && keys[0] === "is_active") {
        await qc.cancelQueries({ queryKey: userKeys.detail(id) });
        const previous = qc.getQueryData(userKeys.detail(id));
        qc.setQueryData(userKeys.detail(id), (old: any) =>
          old ? { ...old, is_active: variables.is_active } : old
        );
        return { previous, optimistic: true } as any;
      }
      return {};
    },
    onError: (_err, _vars, ctx) => {
      if (ctx && (ctx as any).optimistic) {
        qc.setQueryData(userKeys.detail(id), (ctx as any).previous);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
      qc.invalidateQueries({ queryKey: userKeys.base() });
    },
  });
}

export function useReAssignPassword(id: number | string) {
  return useMutation({
    mutationFn: async (payload: {password: string}) => {
      const { data } = await apiInstance.post(`${USERS_PATH}/${id}`, payload);
      return data;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<User>) => {
      const { data } = await apiInstance.post(USERS_PATH, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.base() });
    },
  });
}

export function useDeleteUser(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.delete(`${USERS_PATH}/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
      qc.invalidateQueries({ queryKey: userKeys.base() });
    },
  });
}

export function useRestoreUser(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.post(`${USERS_PATH}/${id}/restore`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
      qc.invalidateQueries({ queryKey: userKeys.base() });
    },
  });
}
