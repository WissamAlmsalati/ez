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
    <main className="space-y-4 sm:space-y-6 pt-2 sm:pt-3" aria-label="صفحة الطلبات">
      <div className="sm:px-0">
        <BreadcrumbComp title="الطلبات" items={[{ title: "الطلبات" }]} />
      </div>
      <Suspense
        fallback={
          <div className="p-4 text-sm text-neutral-500">جارٍ التحميل...</div>
        }
      >
        <div className="space-y-5 sm:px-0">
          {/* Filters & actions */}
          <div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            aria-label="مرشحات وإجراءات الطلبات"
          >
            <div className="md:flex-1">
              <OrdersFilters />
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <Button
                color={"primary"}
                className="transition-colors duration-300 w-full sm:w-auto"
                onClick={() => setOpenReport(true)}
              >
                استخراج تقرير
              </Button>
            </div>
          </div>
          <OrdersTable />
        </div>
      </Suspense>
      <EmployeeProductsReportModal
        open={openReport}
        onClose={() => setOpenReport(false)}
      />
    </main>
  );
}
