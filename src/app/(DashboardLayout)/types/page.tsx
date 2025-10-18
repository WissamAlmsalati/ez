"use client";
import CatalogGrid from "@/shared/ui/catalog/CatalogGrid";
import CatalogCard from "@/shared/ui/catalog/CatalogCard";
import EmptyState from "@/shared/ui/catalog/EmptyState";
import CatalogSkeleton from "@/shared/ui/catalog/CatalogSkeleton";
import Pagination from "@/shared/ui/catalog/Pagination";
import { Button } from "flowbite-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { useToggleType, useTypesQuery } from "@/entities/product-type/api";
import CreateTypeModal from "@/features/types/create/CreateTypeModal";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import { ActiveStatusFilter } from "@/shared/ui/catalog/ActiveStatusFilter";
import { SearchFilter } from "@/shared/ui/catalog/SearchFilter";
import { CategoryFilter } from "@/shared/ui/catalog/CategoryFilter";

export default function TypesPage() {
  const BCrumb = [
    {
      title: "الأنواع",
    },
  ];
  return (
    <>
      <BreadcrumbComp title="الأنواع" items={BCrumb} />
      <Suspense fallback={<CatalogSkeleton />}>
        <TypesPageContent />
      </Suspense>
    </>
  );
}

function TypesPageContent() {
  const searchParams = useSearchParams();
  const params = useMemo(
    () => Object.fromEntries(searchParams?.entries?.() ?? []) as any,
    [searchParams]
  );
  const { data, isLoading } = useTypesQuery({
    page: params.page ? Number(params.page) : 1,
    per_page: params.per_page ? Number(params.per_page) : 15,
    search: params.search,
    is_active:
      params.is_active === "1"
        ? true
        : params.is_active === "0"
        ? false
        : undefined,
    category_id: params.category_id ? Number(params.category_id) : undefined,
  });
  const toggle = useToggleType();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <SearchFilter />
          <CategoryFilter />
          <ActiveStatusFilter />
        </div>
        <Button
          color="primary"
          className="transition-colors duration-300"
          onClick={() => setOpen(true)}
        >
          إضافة نوع
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
              image={item.image ?? null}
              active={!!item.is_active}
              link={`/types/${item.id}`}
              onToggle={async () => {
                await toggle.mutateAsync(item.id);
              }}
              footer={item.category.name}
            />
          ))}
        </CatalogGrid>
      )}
      {data?.meta && <Pagination meta={data.meta} />}
      <CreateTypeModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
