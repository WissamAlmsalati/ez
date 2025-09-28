"use client";
import { SearchFilter } from "./SearchFilter";
import { ActiveStatusFilter } from "./ActiveStatusFilter";

export default function CatalogFilters() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchFilter />
      <ActiveStatusFilter />
    </div>
  );
}
