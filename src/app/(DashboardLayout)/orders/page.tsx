"use client";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import { OrdersFilters } from "@/features/orders/list/OrdersFilters";
import { OrdersTable } from "@/features/orders/list/OrdersTable";
import { Button } from "flowbite-react";
import { Suspense, useState } from "react";
import EmployeeProductsReportModal from "@/features/reports/EmployeeProductsReportModal";

export default function OrdersPage() {
  const [openReport, setOpenReport] = useState(false);
  return (
    <>
      <BreadcrumbComp title="الطلبات" items={[{ title: "الطلبات" }]} />
      <Suspense fallback={<div className="p-4 text-sm text-neutral-500">جارٍ التحميل...</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <OrdersFilters />
          </div>
          <Button
            color={"primary"}
            className="shrink-0"
            onClick={() => setOpenReport(true)}
          >
            استخراج تقرير
          </Button>
        </div>
        <OrdersTable />
      </div>
      </Suspense>
      <EmployeeProductsReportModal
        open={openReport}
        onClose={() => setOpenReport(false)}
      />
    </>
  );
}
