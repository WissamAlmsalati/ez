"use client";
import { Button } from "flowbite-react";
import { useRouter, useSearchParams } from "next/navigation";

type MetaLike = {
  current_page?: number;
  last_page?: number;
  currentPage?: number;
  lastPage?: number;
  total?: number;
};

export default function Pagination({ meta }: { meta: MetaLike }) {
  const router = useRouter();
  const params = useSearchParams();
  const setPage = (p: number) => {
    const next = new URLSearchParams(params?.toString() ?? "");
    next.set("page", String(p));
    router.push(`?${next.toString()}`);
  };
  const current_page = meta.current_page ?? meta.currentPage ?? 1;
  const last_page = meta.last_page ?? meta.lastPage ?? 1;
  // show pagination if more than 1 page OR explicit total > per_page (fallback)
  if (!last_page || last_page < 1) return null;
  if (last_page === 1) {
    // if only one page, we can choose to hide; keep visible for clarity only if query param page >1 (invalid) -> reset
    const pageParam = Number(params?.get("page") || 1);
    if (pageParam > 1) setPage(1);
    return null; // hide single-page pagination
  }

  // generate page numbers (simple; could be improved with truncation if large)
  const pages = Array.from({ length: last_page }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
      <Button
        size="xs"
        color="gray"
        disabled={current_page <= 1}
        onClick={() => setPage(current_page - 1)}
      >
        السابق
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          size="xs"
          color={p === current_page ? "primary" : "light"}
          onClick={() => setPage(p)}
          className="transition-colors duration-300"
        >
          {p}
        </Button>
      ))}
      <Button
        size="xs"
        color="gray"
        disabled={current_page >= last_page}
        onClick={() => setPage(current_page + 1)}
      >
        التالي
      </Button>
    </div>
  );
}
