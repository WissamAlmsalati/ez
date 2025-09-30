"use client";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import CatalogGrid from "@/shared/ui/catalog/CatalogGrid";
import CatalogCard from "@/shared/ui/catalog/CatalogCard";
import CatalogSkeleton from "@/shared/ui/catalog/CatalogSkeleton";
import Pagination from "@/shared/ui/catalog/Pagination";
import EmptyState from "@/shared/ui/catalog/EmptyState";
import { useToggleProduct } from "@/entities/product/api";
import { useCreateAdvertisementModal } from "@/features/advertisements/create/createAdvertisementModalStore";
import { useAddFeaturedProductModal } from "@/features/products/featured/addFeaturedProductModalStore";
import CreateAdvertisementModal from "@/features/advertisements/create/CreateAdvertisementModal";
import { useAdvertisementsQuery } from "@/entities/advertisement/api";
import { AdvertisementCard } from "@/entities/advertisement/ui/AdvertisementCard";
import { AdvertisementSkeletonGrid } from "@/entities/advertisement/ui/AdvertisementCardSkeleton";
import { useFeaturedProductsQuery } from "@/entities/product/lib/use-featured-products-query";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import AddFeaturedProductModal from "@/features/products/featured/AddFeaturedProductModal";

export default function AdvertisementsPage() {
  const { open, openModal, closeModal } = useCreateAdvertisementModal();
  const {
    open: openFeatured,
    openModal: openFeaturedModal,
    closeModal: closeFeaturedModal,
  } = useAddFeaturedProductModal();

  // قراءة البارامز من الـ URL (مثل صفحة المنتجات) ليعمل Pagination الموحد
  const searchParams = useSearchParams();
  const params = useMemo(
    () => Object.fromEntries(searchParams?.entries?.() ?? []),
    [searchParams]
  );
  const page = params.page ? Number(params.page) : 1;
  const perPage = params.per_page ? Number(params.per_page) : 15;
  const tab = params.tab === "featured" ? "featured" : "ads"; // default ads
  const router = useRouter();

  function setTab(next: "ads" | "featured") {
    if (next === tab) return;
    const sp = new URLSearchParams(params as any);
    sp.set("tab", next);
    // إعادة ضبط الصفحة عند تغيير التاب
    sp.delete("page");
    router.replace(`?${sp.toString()}`);
  }

  const adsQuery = useAdvertisementsQuery({ page, per_page: perPage });
  const featuredQuery = useFeaturedProductsQuery({ page, per_page: perPage });

  const isAds = tab === "ads";

  return (
    <>
      <BreadcrumbComp title="إعلانات" items={[{ title: "إعلانات" }]} />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Button
              color={isAds ? "primary" : "outlineprimary"}
              size="sm"
              onClick={() => setTab("ads")}
            >
              إعلانات
            </Button>
            <Button
              color={!isAds ? "primary" : "outlineprimary"}
              size="sm"
              onClick={() => setTab("featured")}
            >
              أبرز المنتجات
            </Button>
          </div>
          {isAds ? (
            <Button color="primary" size="sm" onClick={openModal}>
              إضافة إعلان
            </Button>
          ) : (
            <Button color="primary" size="sm" onClick={openFeaturedModal}>
              إضافة منتج للأبرز
            </Button>
          )}
        </div>

        {/* Content */}
        <div>
          {isAds ? (
            <AdsListSection query={adsQuery} />
          ) : (
            <FeaturedProductsSection query={featuredQuery} />
          )}
        </div>
        {/* TODO: لاحقاً يمكن ربط التاب والصفحة مع search params للحفظ عند التحديث */}
        <CreateAdvertisementModal open={open} onClose={closeModal} />
        <AddFeaturedProductModal
          open={openFeatured}
          onClose={closeFeaturedModal}
        />
      </div>
    </>
  );
}

function AdsListSection({ query }: { query: any }) {
  if (query.isLoading) return <AdvertisementSkeletonGrid />;
  if (query.isError)
    return (
      <p className="text-center text-sm text-red-500">فشل في تحميل الإعلانات</p>
    );
  const items = query.data?.data || [];
  if (!items.length)
    return (
      <p className="text-center text-sm text-neutral-500">
        لا توجد إعلانات حالياً
      </p>
    );
  const meta = query.data?.meta;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((ad: any) => (
          <AdvertisementCard
            key={ad.id}
            item={ad}
            href={`/advertisements/${ad.id}`}
          />
        ))}
      </div>
      {meta && <Pagination meta={meta} />}
    </div>
  );
}

function FeaturedProductsSection({ query }: { query: any }) {
  const toggle = useToggleProduct();
  if (query.isLoading) return <CatalogSkeleton />;
  if (query.isError)
    return (
      <p className="text-center text-sm text-red-500">فشل في تحميل المنتجات</p>
    );
  const data = query.data;
  if (!data || data.data.length === 0) return <EmptyState />;
  return (
    <>
      <CatalogGrid>
        {data.data.map((item: any) => (
          <CatalogCard
            key={item.id}
            title={item.name}
            image={item.image ?? null}
            active={!!item.is_active}
            link={`/products/${item.id}`}
            onToggle={async () => {
              await toggle.mutateAsync(item.id);
            }}
            footer={
              item.type
                ? `${item.type.name} - ${item.type.category?.name ?? ""}`
                : undefined
            }
            showSwitch={false}
          />
        ))}
      </CatalogGrid>
      {data.meta && <Pagination meta={data.meta} />}
    </>
  );
}
