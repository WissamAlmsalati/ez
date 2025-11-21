"use client";

import DailyProfitCard from "./DailyProfitCard";
import OrdersStatusChart from "./OrdersStatusChart";
import ProductsStatusChart from "./ProductsStatusChart";
import LatestOrdersTable from "./LatestOrdersTable";
import HomeStatsSkeleton from "./HomeStatsSkeleton";
import { useHomeDashboardQuery } from "@/entities/home/api";
import { useSessionStore } from "@/entities/session/model/sessionStore";
export default function HomeStatsGrid() {
  const { data, isLoading, isError, refetch } = useHomeDashboardQuery();

  const isManager = useSessionStore((s) => s.isManager);
  if (isLoading) return <HomeStatsSkeleton />;
  if (isError) {
    return (
      <div className="space-y-3 text-sm">
        <div className="text-red-600">حدث خطأ أثناء جلب البيانات</div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 rounded bg-sky-600 text-white"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div
      className="flex flex-col max-h-full"
      aria-label="إحصائيات لوحة التحكم"
    >
      {/* Top row */}
      {isManager && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-4">
          <div className="">
            <DailyProfitCard
              amount={stats?.dailyProfit.amount || 0}
              change={stats?.dailyProfit.change || "0%"}
            />
          </div>
          <div className="">
            <OrdersStatusChart
              pending={stats?.orders.pending || 0}
              inProgress={stats?.orders.inProgress || 0}
              completed={stats?.orders.completed || 0}
            />
          </div>
          <div className="">
            <ProductsStatusChart
              active={stats?.products.active || 0}
              inactive={stats?.products.inactive || 0}
            />
          </div>
        </div>
      )}

      {/* Latest orders full width */}
      <div className="md:col-span-6 lg:col-span-9 xl:col-span-12 ">
        <LatestOrdersTable orders={data?.latestOrders || []} />
      </div>
    </div>
  );
}
