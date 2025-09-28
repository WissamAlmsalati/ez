"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Spinner, Button, Select } from "flowbite-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api";
import type { Paginated } from "@/entities/catalog/types";

export interface RemoteSelectProps<T> {
  path: string; // e.g. '/departments'
  value: T | null;
  onChange: (val: T | null) => void;
  getOptionValue: (item: T) => string | number;
  getOptionLabel: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
  extraParams?: Record<string, any>;
  pageSize?: number;
  clearable?: boolean;
  className?: string;
  /** If you already know an id but not loaded yet (future enhancement) */
  initialValueId?: string | number;
}

export function RemoteSelect<T>(props: RemoteSelectProps<T>) {
  const {
    path,
    value,
    onChange,
    getOptionLabel,
    getOptionValue,
    placeholder = "Select...",
    disabled,
    extraParams = {},
    pageSize = 10,
    className,
  } = props;

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const serializedParams = useMemo(
    () => JSON.stringify(extraParams || {}),
    [extraParams]
  );

  const query = useInfiniteQuery<Paginated<T>, Error>({
    queryKey: ["remote-select", path, serializedParams, pageSize],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params: any = {
        page: pageParam,
        per_page: pageSize,
        ...extraParams,
      };
      const { data } = await apiInstance.get<Paginated<T>>(path, { params });
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;
      const { current_page, last_page } = lastPage.meta as any;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  // If filter params change, ensure first page reload (react-query key change should do it, but we also can ensure selected value still valid)
  useEffect(() => {
    if (!value) return; // keep existing if still valid (cannot easily validate without domain knowledge)
    // Optionally could clear selection here if it should be tied strictly to params
  }, [serializedParams]);

  const flatItems = useMemo(() => {
    return (query.data?.pages.flatMap((p) => p.data || []) || []).map((r) => ({
      raw: r,
      value: getOptionValue(r),
      label: getOptionLabel(r),
    }));
  }, [query.data, getOptionLabel, getOptionValue]);

  const selectedValue = useMemo(() => {
    if (!value) return "";
    return String(getOptionValue(value));
  }, [value, getOptionValue]);

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (!v) {
      onChange(null);
      return;
    }
    const found = flatItems.find((it) => String(it.value) === v);
    if (found) onChange(found.raw as T);
  }

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!query.hasNextPage) return;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            query.fetchNextPage();
          }
        });
      },
      { rootMargin: "150px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [query.hasNextPage, query.fetchNextPage, flatItems.length]);

  const loading = query.isLoading || query.isFetchingNextPage;
  const error = query.error as any;

  return (
    <div className={className}>
      <Select
        disabled={disabled || loading}
        value={selectedValue}
        onChange={handleSelectChange}
      >
        <option value="">{placeholder}</option>
        {flatItems.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      {/* <div className="mt-2 flex items-center gap-2 min-h-[24px]">
        {loading && <Spinner size="sm" />}
        {error && (
          <span className="text-red-500 text-xs">
            {(error?.message || "Failed") as string}
          </span>
        )}
      </div> */}
      {/* sentinel for infinite scroll */}
      {query.hasNextPage && !error && <div ref={loadMoreRef} className="h-2" />}
    </div>
  );
}

export default RemoteSelect;
