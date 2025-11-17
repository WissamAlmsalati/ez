"use client";
import { notFound } from "next/navigation";
import { useOrderQuery } from "@/entities/order/api";
import { OrderDetailSkeleton } from "@/features/orders/detail/OrderDetailSkeleton";
import OrderInfoSection from "@/features/orders/detail/OrderInfoSection";
import CustomerSection from "@/features/orders/detail/CustomerSection";
import CategoryItemsTable from "@/features/orders/detail/CategoryItemsTable";
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
        {/* Render per-category tables if provided by backend; otherwise fallback to flat items table */}
        {order.grouped_products && order.grouped_products.length > 0 && (
          <CategoryItemsTable order={order} />
        ) }
      </div>
    </div>
  );
}
