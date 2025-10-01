"use client";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import { OrdersFilters } from "@/features/orders/list/OrdersFilters";
import { OrdersTable } from "@/features/orders/list/OrdersTable";

export default function OrdersPage() {
  return (
    <>
      <BreadcrumbComp title="الطلبات" items={[{ title: "الطلبات" }]} />
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <OrdersFilters />
        </div>
        <OrdersTable />
      </div>
    </>
  );
}
