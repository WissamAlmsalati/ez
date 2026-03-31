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

  const getPageNumbers = () => {
    const pagesList: (number | string)[] = [];
    if (last_page <= 7) {
      for (let i = 1; i <= last_page; i++) pagesList.push(i);
    } else {
      if (current_page <= 4) {
        for (let i = 1; i <= 5; i++) pagesList.push(i);
        pagesList.push("...");
        pagesList.push(last_page);
      } else if (current_page >= last_page - 3) {
        pagesList.push(1);
        pagesList.push("...");
        for (let i = last_page - 4; i <= last_page; i++) pagesList.push(i);
      } else {
        pagesList.push(1);
        pagesList.push("...");
        pagesList.push(current_page - 1);
        pagesList.push(current_page);
        pagesList.push(current_page + 1);
        pagesList.push("...");
        pagesList.push(last_page);
      }
    }
    return pagesList;
  };

  const pages = getPageNumbers();

  return (
    <div
      className="flex items-center justify-center gap-2 mt-4 flex-wrap"
      dir="rtl"
    >
      <Button
        size="xs"
        color="gray"
        disabled={current_page <= 1}
        onClick={() => setPage(current_page - 1)}
      >
        السابق
      </Button>
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <Button
            key={p}
            size="xs"
            color={p === current_page ? "primary" : "light"}
            onClick={() => setPage(p as number)}
            className="transition-colors duration-300 min-w-[32px]"
          >
            {p}
          </Button>
        ),
      )}
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
