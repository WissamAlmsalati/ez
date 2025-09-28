import { apiInstance as axiosInstance } from "@/shared/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, BaseItem, ListParams, Paginated } from "./types";
import { ApiError } from "./types";
import type { AxiosError } from "axios";

export const catalogKeys = {
  root: ["catalog"] as const,
  byPath: (path: string) => [...catalogKeys.root, path] as const,
  list: (path: string, params?: ListParams) =>
    [...catalogKeys.byPath(path), "list", params ?? {}] as const,
  detail: (path: string, id: string | number) =>
    [...catalogKeys.byPath(path), "detail", id] as const,
};

// Optionally map each item (transport -> domain). R defaults to T so existing calls remain valid.
export function buildListQuery<T extends BaseItem, R = T>(
  path: string,
  mapper?: (item: T) => R
) {
  return (params?: ListParams) =>
    useQuery({
      queryKey: catalogKeys.list(path, params),
      queryFn: async () => {
        const { data } = await axiosInstance.get<Paginated<T>>(path, {
          params,
        });
        if (!mapper) return data as unknown as Paginated<R>;
        return {
          ...data,
          // map items defensively
          data: (data.data || []).map((d) => mapper(d)),
        } as Paginated<R>;
      },
    });
}

export function buildCreateMutation<
  TCreate extends object,
  TResp extends BaseItem
>(path: string) {
  return () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (payload: FormData | TCreate) => {
        try {
          const dataToSend =
            payload instanceof FormData ? payload : toFormData(payload);
          const { data } = await axiosInstance.post<ApiResponse<TResp>>(
            path,
            dataToSend,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          return data;
        } catch (err) {
          throw normalizeAxiosError(err);
        }
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: catalogKeys.byPath(path) });
      },
    });
  };
}

export function buildToggleMutation<TResp extends BaseItem>(path: string) {
  return () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (id: number | string) => {
        try {
          const { data } = await axiosInstance.patch<ApiResponse<TResp>>(
            `${path}/${id}/toggle-status`
          );
          return data;
        } catch (err) {
          throw normalizeAxiosError(err);
        }
      },
      onMutate: async (id: number | string) => {
        const qkRoot = catalogKeys.byPath(path);
        await qc.cancelQueries({ queryKey: qkRoot });
        const snapshot = qc.getQueriesData<Paginated<TResp>>({
          queryKey: qkRoot,
        });
        snapshot.forEach(([key, value]) => {
          if (!value) return;
          qc.setQueryData(key, {
            ...value,
            data: value.data.map((it) =>
              it.id === id ? { ...it, is_active: !it.is_active } : it
            ) as any,
          });
        });
        return { snapshot };
      },
      onError: (_err, _variables, context) => {
        const qkRoot = catalogKeys.byPath(path);
        context?.snapshot?.forEach?.(([key, value]: any) => {
          qc.setQueryData(key, value);
        });
      },
      onSettled: () => {
        qc.invalidateQueries({ queryKey: catalogKeys.byPath(path) });
      },
    });
  };
}

export function toFormData(
  obj: any,
  form: FormData = new FormData(),
  namespace?: string
): FormData {
  if (obj == null) return form;
  Object.keys(obj).forEach((key) => {
    const value = (obj as any)[key];
    if (value === undefined || value === null) return;
    const formKey = namespace ? `${namespace}[${key}]` : key;

    if (value instanceof Date) {
      form.append(formKey, value.toISOString());
    } else if (value instanceof File || value instanceof Blob) {
      form.append(formKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === "object" && !(v instanceof Blob)) {
          toFormData(v, form, `${formKey}[${i}]`);
        } else {
          form.append(`${formKey}[${i}]`, normalizePrimitive(v));
        }
      });
    } else if (typeof value === "object") {
      toFormData(value, form, formKey);
    } else {
      form.append(formKey, normalizePrimitive(value));
    }
  });
  return form;
}

function normalizePrimitive(v: any): string | Blob {
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v == null) return "";
  return String(v);
}

function normalizeAxiosError(err: any): ApiError {
  const ax = err as AxiosError<any>;
  const status = ax.response?.status;
  const body = ax.response?.data as any;
  const message = body?.message || ax.message || "Request failed";
  return new ApiError(message, { status, body });
}
