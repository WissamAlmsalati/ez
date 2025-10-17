"use client";
import CatalogGrid from "@/shared/ui/catalog/CatalogGrid";
import CatalogCard from "@/shared/ui/catalog/CatalogCard";
import EmptyState from "@/shared/ui/catalog/EmptyState";
import CatalogSkeleton from "@/shared/ui/catalog/CatalogSkeleton";
import Pagination from "@/shared/ui/catalog/Pagination";
import { Button } from "flowbite-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { useCategoriesQuery, useToggleCategory } from "@/entities/category/api";
import CreateCategoryModal from "@/features/categories/create/CreateCategoryModal";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import { ActiveStatusFilter } from "@/shared/ui/catalog/ActiveStatusFilter";
import { SearchFilter } from "@/shared/ui/catalog/SearchFilter";

export default function CategoriesPage() {
  const BCrumb = [
    {
      title: "الأصناف",
    },
  ];
  return (
    <>
      <BreadcrumbComp title="الأصناف" items={BCrumb} />
      <Suspense fallback={<CatalogSkeleton />}>
        <CategoriesPageContent />
      </Suspense>
    </>
  );
}

function CategoriesPageContent() {
  const searchParams = useSearchParams();
  const params = useMemo(
    () => Object.fromEntries(searchParams?.entries?.() ?? []) as any,
    [searchParams]
  );
  const { data, isLoading } = useCategoriesQuery({
    page: params.page ? Number(params.page) : 1,
    per_page: params.per_page ? Number(params.per_page) : 15,
    search: params.search,
    is_active:
      params.is_active === "1"
        ? true
        : params.is_active === "0"
        ? false
        : undefined,
  });

  const toggle = useToggleCategory();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <SearchFilter />
          <ActiveStatusFilter />
        </div>
        <Button
          color={"primary"}
          className="transition-colors duration-300"
          onClick={() => setOpen(true)}
        >
          إضافة صنف
        </Button>
      </div>

      {isLoading ? (
        <CatalogSkeleton />
      ) : !data || data.data.length === 0 ? (
        <EmptyState />
      ) : (
        <CatalogGrid>
          {data.data.map((item) => (
            <CatalogCard
              key={item.id}
              title={item.name}
              image={item.imageUrl || null}
              active={!!item.is_active}
              onToggle={async () => {
                await toggle.mutateAsync(item.id);
              }}
              link={`/categories/${item.id}`}
            />
          ))}
        </CatalogGrid>
      )}
      {data?.meta && <Pagination meta={data.meta} />}
      <CreateCategoryModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
