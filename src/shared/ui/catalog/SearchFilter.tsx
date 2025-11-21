"use client";
import { TextInput } from "flowbite-react";
import { useCatalogFilters } from "./useCatalogFilters";
import { useEffect, useRef } from "react";

interface Props {
  className?: string;
  autoFocus?: boolean;
}

export function SearchFilter({ className, autoFocus }: Props) {
  const { filters, update } = useCatalogFilters();
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={className + " w-full"} style={{ maxWidth: 210 }}>
      <TextInput
        ref={ref}
        placeholder="ابحث…"
        defaultValue={filters.search ?? ""}
        onChange={(e) => update({ search: e.target.value })}
        sizing="md"
        color="gray"
      />
    </div>
  );
}
