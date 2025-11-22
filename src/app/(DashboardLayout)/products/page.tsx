"use client";
import { Suspense, useMemo, useState } from "react";
import CatalogGrid from "@/shared/ui/catalog/CatalogGrid";
import CatalogCard from "@/shared/ui/catalog/CatalogCard";
import EmptyState from "@/shared/ui/catalog/EmptyState";
import CatalogSkeleton from "@/shared/ui/catalog/CatalogSkeleton";
import Pagination from "@/shared/ui/catalog/Pagination";
import { Button } from "flowbite-react";
import { useSearchParams } from "next/navigation";
import { useProductsQueryV2, useToggleProduct } from "@/entities/product/api";
import CreateProductModal from "@/features/products/create/CreateProductModal";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import { ActiveStatusFilter } from "@/shared/ui/catalog/ActiveStatusFilter";
import { SearchFilter } from "@/shared/ui/catalog/SearchFilter";
import { CategoryFilter } from "@/shared/ui/catalog/CategoryFilter";
import { TypeFilter } from "@/shared/ui/catalog/TypeFilter";
// لاحقاً يمكن إضافة TypeFilter إن توفر
import UnitsModal from "@/features/products/units/UnitsModal";
import { useSessionStore } from "@/entities/session/model/sessionStore";

export default function ProductsPage() {
  const BCrumb = [
    {
      title: "الأصناف",
    },
  ];
  return (
    <main
      className="space-y-4 sm:space-y-5 pt-2 sm:pt-3"
      aria-label="صفحة الأصناف"
    >
      <div className="sm:px-0">
        <BreadcrumbComp title="الأصناف" items={BCrumb} />
      </div>
      <Suspense fallback={<CatalogSkeleton />}>
        <ProductsPageContent />
      </Suspense>
    </main>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const isManager = useSessionStore((s) => s.isManager);
  const params = useMemo(
    () => Object.fromEntries(searchParams?.entries?.() ?? []) as any,
    [searchParams]
  );
  const { data, isLoading } = useProductsQueryV2({
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
    type_id: params.type_id ? Number(params.type_id) : undefined,
  });
  const toggle = useToggleProduct();
  const [open, setOpen] = useState(false);
  const [unitsOpen, setUnitsOpen] = useState(false);

  return (
    <div className="space-y-5 sm:px-0">
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" 
        aria-label="مرشحات وإجراءات الأصناف"
      >
        <div className="flex items-stretch gap-2 sm:gap-3">
          <div className="w-1/4 sm:w-auto order-1">
            <SearchFilter />
          </div>
          {isManager ? (
            <>
              <div className="w-1/4 sm:w-auto order-2">
                <CategoryFilter />
              </div>
              <div className="w-1/4 sm:w-auto order-3">
                <TypeFilter />
              </div>
              <div className= "w-1/4 sm:w-auto order-4 ">
                <ActiveStatusFilter />
              </div>
            </>
          ) : (
            <div className="order-2">
              <TypeFilter />
            </div>
          )}
        </div>
        {isManager && (
          <div className="flex items-stretch gap-2 w-full md:w-auto order-last">
            <Button
              color="light"
              className="transition-colors duration-300 w-1/2 sm:w-auto"
              onClick={() => setUnitsOpen(true)}
            >
              الوحدات
            </Button>

            <Button
              color="primary"
              className="transition-colors duration-300 w-1/2 sm:w-auto"
              onClick={() => setOpen(true)}
            >
              إضافة صنف
            </Button>
          </div>
        )}
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
              link={`/products/${item.id}`}
              onToggle={async () => {
                await toggle.mutateAsync(item.id);
              }}
              footer={`${item.type.name} - ${item.type.category.name}`}
            />
          ))}
        </CatalogGrid>
      )}
      {data?.meta && (
        <div className="pt-2">
          <Pagination meta={data.meta} />
        </div>
      )}
      {isManager && (
        <CreateProductModal open={open} onClose={() => setOpen(false)} />
      )}
      <UnitsModal open={unitsOpen} onClose={() => setUnitsOpen(false)} />
    </div>
  );
}
