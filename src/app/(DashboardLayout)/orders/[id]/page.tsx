"use client";
import { notFound } from "next/navigation";
import { useOrderQuery } from "@/entities/order/api";
import { OrderDetailSkeleton } from "@/features/orders/detail/OrderDetailSkeleton";
import OrderInfoSection from "@/features/orders/detail/OrderInfoSection";
import CustomerSection from "@/features/orders/detail/CustomerSection";
import ItemsTable from "@/features/orders/detail/ItemsTable";
import DepartmentsTable from "@/features/orders/detail/DepartmentsTable";
import StatusHistoryTable from "@/features/orders/detail/StatusHistoryTable";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const intId = id ? Number(id) : undefined;
  const query = useOrderQuery(intId);

  if (query.isLoading) return <OrderDetailSkeleton />;
  if (query.isError)
    return (
      <p className="text-center text-sm text-red-500">فشل في تحميل الطلب</p>
    );
  if (!query.data) return notFound();

  const order = query.data;
  return (
    <div className="space-y-6">
      <BreadcrumbComp
        title="تفاصيل الطلب"
        items={[
          { title: "الطلبات", to: "/orders" },
          { title: order.order_number },
        ]}
      />
      <div className="grid gap-6">
        <OrderInfoSection order={order} />
        <CustomerSection order={order} />
        <ItemsTable order={order} />
        <DepartmentsTable order={order} />
        <StatusHistoryTable order={order} />
      </div>
    </div>
  );
}
