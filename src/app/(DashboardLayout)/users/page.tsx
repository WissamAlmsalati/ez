"use client";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import CatalogGrid from "@/shared/ui/catalog/CatalogGrid";
import CatalogCard from "@/shared/ui/catalog/CatalogCard";
import EmptyState from "@/shared/ui/catalog/EmptyState";
import CatalogSkeleton from "@/shared/ui/catalog/CatalogSkeleton";
import Pagination from "@/shared/ui/catalog/Pagination";
import { SearchFilter } from "@/shared/ui/catalog/SearchFilter";
import { ActiveStatusFilter } from "@/shared/ui/catalog/ActiveStatusFilter";
import RoleFilter from "@/shared/ui/catalog/RoleFilter";
import { useUsersQuery } from "@/entities/user/api";
import CreateUserModal from "@/features/users/create/CreateUserModal";
import { Button } from "flowbite-react";
import { useSessionStore } from "@/entities/session/model/sessionStore";

export default function UsersPage() {
  const BCrumb = [
    {
      title: "المستخدمون",
    },
  ];

  return (
    <main
      className="space-y-4 sm:space-y-5 pt-2 sm:pt-3"
      aria-label="صفحة المستخدمين"
    >
      <div className="sm:px-0">
        <BreadcrumbComp title="المستخدمون" items={BCrumb} />
      </div>
      <Suspense fallback={<CatalogSkeleton />}>
        <UsersPageContent />
      </Suspense>
    </main>
  );
}

function UsersPageContent() {
  const [openCreate, setOpenCreate] = useState(false);
  const isManager = useSessionStore((s) => s.isManager);
  const searchParams = useSearchParams();
  const params = useMemo(
    () => Object.fromEntries(searchParams?.entries?.() ?? []) as any,
    [searchParams]
  );

  const { data, isLoading } = useUsersQuery({
    page: params.page ? Number(params.page) : 1,
    per_page: params.per_page ? Number(params.per_page) : 15,
    search: params.search,
    role: params.role,
    department_id: params.department_id
      ? Number(params.department_id)
      : undefined,
    is_active:
      params.is_active === "1"
        ? true
        : params.is_active === "0"
        ? false
        : undefined,
    include_deleted: params.include_deleted === "1" ? true : undefined,
  });

  return (
    <div className="space-y-5 sm:px-0">
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        aria-label="مرشحات وإجراءات المستخدمين"
      >
        <div className="flex items-stretch gap-2 sm:gap-3">
          <div className="w-1/3 sm:w-auto order-1">
            <SearchFilter />
          </div>
          <div className="w-1/3 sm:w-auto order-2 ">
            <RoleFilter />
          </div>
          <div className="order-3">
            <ActiveStatusFilter />
          </div>
        </div>
        {isManager && (
          <div className="w-full md:w-auto order-last">
            <Button
              size="sm"
              color="primary"
              className="w-full md:w-auto"
              onClick={() => setOpenCreate(true)}
            >
              إضافة مستخدم
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
          {data.data.map((user) => (
            <CatalogCard
              key={user.id}
              title={user.name}
              image={null}
              active={!!user.is_active}
              link={`/users/${user.id}`}
              onToggle={() => {}}
              showSwitch={false}
              hideImage
              footer={
                <span className="text-xs">
                  {user.role === "manager"
                    ? "مدير"
                    : user.role === "employee"
                    ? "موظف"
                    : "زبون"}
                </span>
              }
            />
          ))}
        </CatalogGrid>
      )}
      {data?.meta && (
        <div className="pt-2">
          <Pagination meta={data.meta} />
        </div>
      )}
      <CreateUserModal open={openCreate} onClose={() => setOpenCreate(false)} />
    </div>
  );
}
