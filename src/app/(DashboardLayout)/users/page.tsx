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
    <>
      <BreadcrumbComp title="المستخدمون" items={BCrumb} />
      <Suspense fallback={<CatalogSkeleton />}>
        <UsersPageContent />
      </Suspense>
    </>
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <SearchFilter />
          <RoleFilter />
          <ActiveStatusFilter />
        </div>
        {isManager && (
          <div>
            <Button
              size="sm"
              color="primary"
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
                  {user.role_text || user.role}{" "}
                  {user.department ? `• ${user.department.name}` : ""}
                </span>
              }
            />
          ))}
        </CatalogGrid>
      )}
      {data?.meta && <Pagination meta={data.meta} />}
      <CreateUserModal open={openCreate} onClose={() => setOpenCreate(false)} />
    </div>
  );
}
