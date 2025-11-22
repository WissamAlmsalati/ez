"use client";
import { useParams } from "next/navigation";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import { useUserDetail } from "@/entities/user/api";
import UserOrdersTable from "@/features/users/detail/UserOrdersTable";
import UserInfoSection from "@/features/users/detail/UserInfoSection";
import { UserDetailSkeleton } from "@/features/users/detail/UserDetailSkeleton";
import { useSessionStore } from "@/entities/session/model/sessionStore";
import ChangePasswordForm from "@/features/users/detail/ChangePasswordForm";

export default function UserDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const intId = id ? Number(id) : undefined;
  const query = useUserDetail(intId);
  const currentUserId = useSessionStore((s) => s.user?.id);

  if (query.isLoading)
    return (
      <div className="space-y-6">
        <BreadcrumbComp
          title={"جاري التحميل..."}
          items={[{ title: "المستخدمون", to: "/users" }, { title: "مستخدم" }]}
        />
        <UserDetailSkeleton />;
      </div>
    );
  if (query.isError || !query.data)
    return (
      <p className="text-center text-sm text-red-500">تعذر تحميل المستخدم</p>
    );

  const user = query.data;
  const isCurrentUser =
    currentUserId != null && Number(user.id) === Number(currentUserId);

  return (
    <div className="space-y-6">
      <BreadcrumbComp
        title={user.name}
        items={[
          { title: "المستخدمون", to: "/users" },
          { title: query.data.name },
        ]}
      />

      <div className="flex flex-col gap-4">
        <UserInfoSection user={user} />
        {isCurrentUser && <ChangePasswordForm />}
        {user.role === "customer" && (
          <UserOrdersTable userId={user.id as number} />
        )}
      </div>
    </div>
  );
}
