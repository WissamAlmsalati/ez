"use client";
import { useParams } from "next/navigation";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import { useUserDetail } from "@/entities/user/api";
import UserOrdersTable from "@/features/users/detail/UserOrdersTable";
import UserInfoSection from "@/features/users/detail/UserInfoSection";
import { UserDetailSkeleton } from "@/features/users/detail/UserDetailSkeleton";

export default function UserDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const intId = id ? Number(id) : undefined;
  const query = useUserDetail(intId);

  if (query.isLoading) return <UserDetailSkeleton />;
  if (query.isError || !query.data)
    return (
      <p className="text-center text-sm text-red-500">تعذر تحميل المستخدم</p>
    );

  const user = query.data;

  return (
    <div className="space-y-6">
      <BreadcrumbComp
        title={user.name}
        items={[{ title: "المستخدمون", to: "/users" }, { title: query.data.name }]}
      />

      <div className="grid gap-6">
        <UserInfoSection user={user} />
        {user.role === "customer" && (
          <UserOrdersTable userId={user.id as number} />
        )}
      </div>
    </div>
  );
}
